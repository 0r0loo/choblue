import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@choblue/ui/button';
import { Input } from '@choblue/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@choblue/ui/dialog';
import { api, getErrorMessage } from '@/lib/api';
import { workspaceQueries, memberQueries } from '@/lib/queries';
import { workspaceKeys } from '@/lib/query-keys';
import type { Workspace } from '@/types';

export interface SettingsPageProps {
  workspaceId: string;
  onNavigate: (path: string) => void;
}

export function SettingsPage({
  workspaceId,
  onNavigate,
}: SettingsPageProps) {
  const queryClient = useQueryClient();

  const { data: workspace, isLoading: isLoadingWorkspace, error: wsError } = useQuery(
    workspaceQueries.detail(workspaceId),
  );

  const { data: members = [], isLoading: isLoadingMembers } = useQuery(
    workspaceQueries.members(workspaceId),
  );

  const { data: me } = useQuery(memberQueries.me());

  const isAdmin = me?.role === 'admin';

  const [copied, setCopied] = useState(false);

  // Workspace edit form state
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editInitialized, setEditInitialized] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);

  // Regenerate invite confirmation
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);

  // Leave workspace confirmation
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  // Initialize form when workspace loads
  if (workspace && !editInitialized) {
    setEditName(workspace.name);
    setEditDescription(workspace.description);
    setEditInitialized(true);
  }

  const editMutation = useMutation({
    mutationFn: (payload: { name: string; description: string }) =>
      api.patch<Workspace>(`/workspaces/${workspaceId}`, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(workspaceKeys.detail(workspaceId), updated);
      setEditSuccess(true);
    },
  });

  const regenerateMutation = useMutation({
    mutationFn: () =>
      api.post<Workspace>(`/workspaces/${workspaceId}/regenerate-invite`),
    onSuccess: (updated) => {
      queryClient.setQueryData(workspaceKeys.detail(workspaceId), updated);
      setShowRegenerateConfirm(false);
    },
  });

  const leaveMutation = useMutation({
    mutationFn: () => api.delete(`/workspaces/${workspaceId}/members/me`),
    onSuccess: () => {
      document.cookie = 'workspaceId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      onNavigate('/');
    },
  });

  const isLoading = isLoadingWorkspace || isLoadingMembers;

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">불러오는 중...</p>
      </div>
    );
  }

  if (wsError || !workspace) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-destructive">
          {wsError
            ? getErrorMessage(wsError, '데이터를 불러오는 중 오류가 발생했습니다.')
            : '데이터를 찾을 수 없습니다.'}
        </p>
      </div>
    );
  }

  const inviteLink = `${window.location.origin}/join/${workspace.inviteCode}`;

  async function handleCopyInviteLink() {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEditSuccess(false);

    if (!editName.trim()) {
      return;
    }

    editMutation.mutate({ name: editName, description: editDescription });
  }

  function handleRegenerateConfirm() {
    regenerateMutation.mutate();
  }

  function handleLeaveConfirm() {
    leaveMutation.mutate();
  }

  const actionError =
    editMutation.error ?? regenerateMutation.error ?? leaveMutation.error;

  return (
    <div className="flex flex-col items-center p-4 pb-8">
      <div className="w-full max-w-md space-y-5">
        {/* Page title */}
        <h2 className="text-xl font-bold tracking-tight">설정</h2>

        {/* Invite link section */}
        {workspace.inviteCode && (
          <div className="rounded-xl border border-black/5 bg-card p-4 shadow-sm dark:border-white/10">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              초대 링크
            </h3>
            <div className="mt-3 flex items-center gap-2">
              <code className="flex-1 truncate rounded-lg bg-accent px-3 py-2 text-xs">
                /join/{workspace.inviteCode}
              </code>
              <Button variant="outline" size="sm" onClick={handleCopyInviteLink}>
                {copied ? '완료!' : '복사'}
              </Button>
            </div>

            {/* Admin: Regenerate */}
            {isAdmin && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setShowRegenerateConfirm(true)}
                  className="text-xs text-muted-foreground transition-colors duration-200 hover:text-foreground"
                >
                  초대 링크 재발급
                </button>
                <Dialog open={showRegenerateConfirm} onOpenChange={setShowRegenerateConfirm}>
                  <DialogContent className="max-w-sm">
                    <DialogHeader>
                      <DialogTitle>초대 링크 재발급</DialogTitle>
                      <DialogDescription>
                        재발급하면 기존 초대 링크는 무효화됩니다. 계속하시겠습니까?
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowRegenerateConfirm(false)}
                      >
                        취소
                      </Button>
                      <Button size="sm" onClick={handleRegenerateConfirm}>
                        재발급
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        )}

        {/* Admin: Edit workspace form */}
        {isAdmin && (
          <form
            onSubmit={handleEditSubmit}
            className="rounded-xl border border-black/5 bg-card p-4 shadow-sm dark:border-white/10"
          >
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              워크스페이스 수정
            </h3>
            <div className="mt-3 space-y-3">
              <div className="space-y-1.5">
                <label htmlFor="workspace-name" className="text-sm font-medium">
                  이름
                </label>
                <Input
                  id="workspace-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="workspace-description" className="text-sm font-medium">
                  설명
                </label>
                <Input
                  id="workspace-description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3">
                <Button type="submit" size="sm">
                  저장
                </Button>
                {editSuccess && (
                  <span className="text-sm text-success-500">저장되었습니다</span>
                )}
              </div>
            </div>
          </form>
        )}

        {/* Member list */}
        <div className="space-y-2.5">
          <h3 className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            멤버 ({members.length})
          </h3>
          <div className="rounded-xl border border-black/5 bg-card shadow-sm dark:border-white/10">
            <ul className="divide-y divide-black/5 dark:divide-white/10">
              {members.map((member) => (
                <li
                  key={member.id}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-medium">
                    {member.nickname.charAt(0)}
                  </div>
                  <span className="min-w-0 truncate text-sm font-medium">
                    {member.nickname}
                  </span>
                  {member.role === 'admin' && (
                    <span className="ml-auto shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                      관리자
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Error */}
        {actionError && (
          <p className="text-sm text-destructive">
            {getErrorMessage(actionError, '오류가 발생했습니다.')}
          </p>
        )}

        {/* Leave workspace */}
        <div className="border-t border-black/5 pt-5 dark:border-white/10">
          <button
            type="button"
            onClick={() => setShowLeaveConfirm(true)}
            className="text-sm text-muted-foreground transition-colors duration-200 hover:text-destructive"
          >
            워크스페이스 나가기
          </button>
          <Dialog open={showLeaveConfirm} onOpenChange={setShowLeaveConfirm}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>워크스페이스 나가기</DialogTitle>
                <DialogDescription>
                  정말 나가시겠습니까? 나가면 다시 초대를 받아야 참여할 수 있습니다.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLeaveConfirm(false)}
                >
                  취소
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleLeaveConfirm}
                >
                  나가기
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
