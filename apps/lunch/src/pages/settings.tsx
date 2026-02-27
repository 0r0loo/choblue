import { useState, useEffect } from 'react';
import { Button } from '@choblue/ui/button';
import { Input } from '@choblue/ui/input';
import { api } from '@/lib/api';

export interface SettingsPageProps {
  workspaceId: string;
  currentMemberId: string;
  onNavigate: (path: string) => void;
}

interface Workspace {
  id: string;
  name: string;
  description: string;
  inviteCode: string;
}

interface Member {
  id: string;
  nickname: string;
  role: 'admin' | 'member';
  joinedAt: string;
}

export function SettingsPage({
  workspaceId,
  currentMemberId,
  onNavigate,
}: SettingsPageProps) {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [copied, setCopied] = useState(false);

  // Workspace edit form state
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editSuccess, setEditSuccess] = useState(false);

  // Regenerate invite confirmation
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);

  // Leave workspace confirmation
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const [ws, mems] = await Promise.all([
          api.get<Workspace>(`/workspaces/${workspaceId}`),
          api.get<Member[]>(`/workspaces/${workspaceId}/members`),
        ]);
        if (!cancelled) {
          setWorkspace(ws);
          setMembers(mems);
          setEditName(ws.name);
          setEditDescription(ws.description);
        }
      } catch {
        if (!cancelled) {
          setError('데이터를 불러오는 중 오류가 발생했습니다.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">불러오는 중...</p>
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-destructive">{error ?? '데이터를 찾을 수 없습니다.'}</p>
      </div>
    );
  }

  const currentMember = members.find((m) => m.id === currentMemberId);
  const isAdmin = currentMember?.role === 'admin';

  const inviteLink = `${window.location.origin}/join/${workspace.inviteCode}`;

  async function handleCopyInviteLink() {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEditSuccess(false);
    setActionError(null);

    if (!editName.trim()) {
      setActionError('워크스페이스 이름을 입력해주세요.');
      return;
    }

    try {
      const updated = await api.patch<Workspace>(
        `/workspaces/${workspaceId}`,
        { name: editName, description: editDescription },
      );
      setWorkspace(updated);
      setEditSuccess(true);
    } catch {
      setActionError('워크스페이스 수정 중 오류가 발생했습니다.');
    }
  }

  function handleRegenerateClick() {
    setShowRegenerateConfirm(true);
  }

  async function handleRegenerateConfirm() {
    setActionError(null);
    try {
      const updated = await api.post<Workspace>(
        `/workspaces/${workspaceId}/regenerate-invite`,
      );
      setWorkspace(updated);
      setShowRegenerateConfirm(false);
    } catch {
      setActionError('초대 링크 재발급 중 오류가 발생했습니다.');
    }
  }

  function handleLeaveClick() {
    setShowLeaveConfirm(true);
  }

  async function handleLeaveConfirm() {
    setActionError(null);
    try {
      await api.delete(`/workspaces/${workspaceId}/members/me`);
      document.cookie = 'workspaceId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      onNavigate('/');
    } catch {
      setActionError('워크스페이스 탈퇴 중 오류가 발생했습니다.');
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center p-4">
      <div className="w-full max-w-md space-y-6">
        <h2 className="text-2xl font-bold">{workspace.name}</h2>

        {/* Invite link section */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">초대 링크</h3>
          <div className="flex items-center gap-2 rounded-lg border p-3">
            <p className="flex-1 break-all font-mono text-sm">
              /join/{workspace.inviteCode}
            </p>
            <Button variant="outline" size="sm" onClick={handleCopyInviteLink}>
              복사
            </Button>
          </div>
          {copied && (
            <p className="text-sm text-green-600">복사되었습니다</p>
          )}
        </div>

        {/* Admin: Regenerate invite link */}
        {isAdmin && (
          <div className="space-y-2">
            <Button variant="outline" onClick={handleRegenerateClick}>
              초대 링크 재발급
            </Button>
            {showRegenerateConfirm && (
              <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-3">
                <p className="text-sm">
                  재발급 하시겠습니까? 기존 초대 링크는 무효화됩니다.
                </p>
                <div className="mt-2 flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleRegenerateConfirm}
                  >
                    확인
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRegenerateConfirm(false)}
                  >
                    취소
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Admin: Edit workspace form */}
        {isAdmin && (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <h3 className="text-lg font-semibold">워크스페이스 수정</h3>
            <div className="space-y-2">
              <label htmlFor="workspace-name" className="text-sm font-medium">
                워크스페이스 이름
              </label>
              <Input
                id="workspace-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="workspace-description"
                className="text-sm font-medium"
              >
                설명
              </label>
              <Input
                id="workspace-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>
            <Button type="submit">저장</Button>
            {editSuccess && (
              <p className="text-sm text-green-600">저장되었습니다</p>
            )}
          </form>
        )}

        {/* Member list */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">
            멤버 ({members.length})
          </h3>
          <ul className="space-y-2">
            {members.map((member) => (
              <li
                key={member.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <span>{member.nickname}</span>
                {member.role === 'admin' && (
                  <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    관리자
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {actionError && (
          <p className="text-sm text-destructive">{actionError}</p>
        )}

        {/* Leave workspace */}
        <div className="border-t pt-4">
          <Button variant="destructive" onClick={handleLeaveClick}>
            워크스페이스 나가기
          </Button>
          {showLeaveConfirm && (
            <div className="mt-2 rounded-lg border border-red-300 bg-red-50 p-3">
              <p className="text-sm">정말 나가시겠습니까?</p>
              <div className="mt-2 flex gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleLeaveConfirm}
                >
                  확인
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLeaveConfirm(false)}
                >
                  취소
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
