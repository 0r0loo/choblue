import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@choblue/ui/button';
import { api, getErrorMessage } from '@/lib/api';
import { workspaceQueries, memberQueries } from '@/lib/queries';

interface WorkspaceDrawerProps {
  workspaceId: string;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

const MAX_VISIBLE_MEMBERS = 5;

export function WorkspaceDrawer({
  workspaceId,
  isOpen,
  onClose,
  onNavigate,
}: WorkspaceDrawerProps) {
  const { data: workspace } = useQuery(workspaceQueries.detail(workspaceId));
  const { data: members = [] } = useQuery(
    workspaceQueries.members(workspaceId),
  );
  const { data: me } = useQuery(memberQueries.me());

  const [copied, setCopied] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
      setShowLeaveConfirm(false);
    }
  }, [isOpen]);

  const leaveMutation = useMutation({
    mutationFn: () => api.delete(`/workspaces/${workspaceId}/members/me`),
    onSuccess: () => {
      document.cookie =
        'workspaceId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      onNavigate('/');
    },
  });

  const isAdmin = me?.role === 'admin';
  const displayMembers = members.slice(0, MAX_VISIBLE_MEMBERS);
  const remainingCount = Math.max(0, members.length - MAX_VISIBLE_MEMBERS);

  async function handleCopyInviteLink() {
    if (!workspace) return;
    const inviteLink = `${window.location.origin}/join/${workspace.inviteCode}`;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[400] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={`fixed inset-y-0 right-0 z-[500] flex w-80 max-w-[85vw] flex-col rounded-l-2xl border-l border-black/5 bg-background shadow-xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] dark:border-white/10 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <h2 className="text-lg font-bold tracking-tight">메뉴</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground active:scale-[0.96]"
            aria-label="메뉴 닫기"
          >
            <svg
              className="h-4.5 w-4.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4 overflow-y-auto px-5 pb-5">
          {/* Workspace info card */}
          {workspace && (
            <div className="rounded-xl border border-black/5 bg-card p-4 shadow-sm dark:border-white/10">
              <h3 className="font-semibold tracking-tight">
                {workspace.name}
              </h3>
              {workspace.description && (
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {workspace.description}
                </p>
              )}
            </div>
          )}

          {/* My profile card */}
          {me && (
            <button
              type="button"
              onClick={() => onNavigate('/profile')}
              className="flex w-full items-center gap-3 rounded-xl border border-black/5 bg-card p-4 shadow-sm transition-[background-color,box-shadow] duration-200 hover:shadow-md active:scale-[0.98] dark:border-white/10"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {me.nickname.charAt(0)}
              </div>
              <div className="min-w-0 text-left">
                <p className="truncate text-sm font-semibold">{me.nickname}</p>
                <p className="text-xs text-muted-foreground">프로필 수정</p>
              </div>
              <svg
                className="ml-auto h-4 w-4 shrink-0 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}

          {/* Invite link (admin only — API strips inviteCode for members) */}
          {isAdmin && workspace?.inviteCode && (
            <button
              type="button"
              onClick={handleCopyInviteLink}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-black/5 bg-card px-4 py-3 text-sm font-medium shadow-sm transition-[background-color,box-shadow] duration-200 hover:shadow-md active:scale-[0.98] dark:border-white/10"
            >
              <svg
                className="h-4 w-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
              {copied ? (
                <span className="text-primary">복사 완료!</span>
              ) : (
                <span>초대 링크 복사</span>
              )}
            </button>
          )}

          {/* Member list */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                멤버 ({members.length})
              </h4>
            </div>
            <div className="rounded-xl border border-black/5 bg-card shadow-sm dark:border-white/10">
              <ul className="divide-y divide-black/5 dark:divide-white/10">
                {displayMembers.map((member) => (
                  <li
                    key={member.id}
                    className="flex items-center gap-3 px-4 py-2.5"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-medium">
                      {member.nickname.charAt(0)}
                    </div>
                    <span className="min-w-0 truncate text-sm">
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
              {remainingCount > 0 && (
                <div className="border-t border-black/5 px-4 py-2 text-center text-xs text-muted-foreground dark:border-white/10">
                  +{remainingCount}명 더
                </div>
              )}
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => onNavigate('/menu-history')}
              className="flex w-full items-center gap-3 rounded-xl border border-black/5 bg-card px-4 py-3 text-sm font-medium shadow-sm transition-[background-color,box-shadow] duration-200 hover:shadow-md active:scale-[0.98] dark:border-white/10"
            >
              <svg
                className="h-4 w-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              메뉴 기록
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/reviews')}
              className="flex w-full items-center gap-3 rounded-xl border border-black/5 bg-card px-4 py-3 text-sm font-medium shadow-sm transition-[background-color,box-shadow] duration-200 hover:shadow-md active:scale-[0.98] dark:border-white/10"
            >
              <svg
                className="h-4 w-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
              리뷰 관리
            </button>
          </div>

          {/* Settings button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onNavigate('/settings')}
          >
            {isAdmin ? '워크스페이스 설정' : '전체 멤버 보기'}
          </Button>
        </div>

        {/* Footer */}
        <div className="space-y-3 border-t border-black/5 px-5 py-4 dark:border-white/10">
          {/* Workspace list */}
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="flex w-full items-center gap-2 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 9l4-4 4 4M16 15l-4 4-4-4"
              />
            </svg>
            워크스페이스 전환
          </button>

          {leaveMutation.error && (
            <p className="mb-2 text-sm text-danger">
              {getErrorMessage(leaveMutation.error, '오류가 발생했습니다.')}
            </p>
          )}
          {!showLeaveConfirm ? (
            <button
              type="button"
              onClick={() => setShowLeaveConfirm(true)}
              className="text-sm text-muted-foreground transition-colors duration-200 hover:text-danger"
            >
              워크스페이스 나가기
            </button>
          ) : (
            <div className="rounded-xl border border-danger-200 bg-danger-100/50 p-3 dark:border-danger-800 dark:bg-danger-900/20">
              <p className="text-sm font-medium">정말 나가시겠습니까?</p>
              <div className="mt-2.5 flex gap-2">
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => leaveMutation.mutate()}
                >
                  나가기
                </Button>
                <Button
                  variant="ghost"
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
    </>
  );
}
