import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@choblue/ui/button';
import { Input } from '@choblue/ui/input';
import { api, getErrorMessage } from '@/lib/api';
import { workspaceQueries } from '@/lib/queries';
import type { JoinResult } from '@/types';

export interface JoinWorkspacePageProps {
  inviteCode: string;
  onNavigate: (path: string) => void;
}

export function JoinWorkspacePage({ inviteCode, onNavigate }: JoinWorkspacePageProps) {
  const { data: workspace, isLoading, error: fetchError } = useQuery(
    workspaceQueries.byInviteCode(inviteCode),
  );

  const [nickname, setNickname] = useState('');
  const [nicknameError, setNicknameError] = useState<string | null>(null);

  useEffect(() => {
    if (workspace?.currentMember?.isMember) {
      onNavigate(`/${workspace.currentMember.slug}`);
    }
  }, [workspace, onNavigate]);

  const joinMutation = useMutation({
    mutationFn: (payload: { nickname: string; inviteCode: string }) =>
      api.post<JoinResult>(`/workspaces/${workspace!.id}/members`, payload),
    onSuccess: (result) => {
      onNavigate(`/${result.workspaceSlug}`);
    },
  });

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
        <p className="text-destructive">
          {getErrorMessage(fetchError, '유효하지 않은 링크입니다')}
        </p>
      </div>
    );
  }

  if (!workspace || workspace.currentMember?.isMember) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-muted-foreground">이동 중...</p>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!nickname.trim()) {
      setNicknameError('닉네임을 입력해주세요');
      return;
    }

    setNicknameError(null);
    joinMutation.mutate({ nickname, inviteCode });
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

        {joinMutation.error && (
          <p className="text-sm text-destructive">
            {getErrorMessage(joinMutation.error, '오류가 발생했습니다. 다시 시도해주세요.')}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={joinMutation.isPending}>
          {joinMutation.isPending ? '참여 중...' : '참여하기'}
        </Button>
      </form>
    </div>
  );
}
