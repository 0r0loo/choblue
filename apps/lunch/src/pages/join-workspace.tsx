import { useState, useEffect } from 'react';
import { Button } from '@choblue/ui/button';
import { Input } from '@choblue/ui/input';
import { api } from '@/lib/api';

export interface JoinWorkspacePageProps {
  inviteCode: string;
  onNavigate: (path: string) => void;
}

interface WorkspaceInfo {
  id: string;
  name: string;
  slug: string;
  description: string;
  memberCount: number;
}

interface JoinResult {
  memberId: string;
  workspaceSlug: string;
}

export function JoinWorkspacePage({ inviteCode, onNavigate }: JoinWorkspacePageProps) {
  const [workspace, setWorkspace] = useState<WorkspaceInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [nickname, setNickname] = useState('');
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchWorkspace() {
      try {
        const data = await api.get<WorkspaceInfo>(`/workspaces/by-invite/${inviteCode}`);
        if (!cancelled) {
          setWorkspace(data);
          setIsLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : '유효하지 않은 링크입니다';
          setFetchError(message);
          setIsLoading(false);
        }
      }
    }

    void fetchWorkspace();

    return () => {
      cancelled = true;
    };
  }, [inviteCode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!nickname.trim()) {
      setNicknameError('닉네임을 입력해주세요');
      return;
    }

    setNicknameError(null);
    setApiError(null);
    setIsSubmitting(true);

    try {
      const result = await api.post<JoinResult>(
        `/workspaces/${workspace!.id}/members`,
        { nickname, inviteCode },
      );
      onNavigate(`/${result.workspaceSlug}`);
    } catch {
      setApiError('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-muted-foreground">불러오는 중...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-destructive">{fetchError}</p>
      </div>
    );
  }

  if (!workspace) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">{workspace.name}</h2>
          <p className="mt-2 text-muted-foreground">
            에 참여합니다
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="join-nickname" className="text-sm font-medium">
            닉네임
          </label>
          <Input
            id="join-nickname"
            placeholder="홍길동"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            aria-invalid={!!nicknameError}
          />
          {nicknameError && (
            <p className="text-sm text-destructive">{nicknameError}</p>
          )}
        </div>

        {apiError && (
          <p className="text-sm text-destructive">{apiError}</p>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? '참여 중...' : '참여하기'}
        </Button>
      </form>
    </div>
  );
}
