import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@choblue/ui/button';
import { api, getErrorMessage } from '@/lib/api';
import { postQueries } from '@/lib/queries';
import { postKeys } from '@/lib/query-keys';

export interface PostDetailPageProps {
  postId: string;
  currentMemberId: string;
  onNavigate: (path: string) => void;
}

export function PostDetailPage({ postId, currentMemberId, onNavigate }: PostDetailPageProps) {
  const queryClient = useQueryClient();

  const { data: post, isLoading, error: fetchError } = useQuery(
    postQueries.detail(postId),
  );

  const participateMutation = useMutation({
    mutationFn: () => api.post(`/posts/${postId}/participate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => api.delete(`/posts/${postId}/participate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) });
    },
  });

  const closeMutation = useMutation({
    mutationFn: () => api.post(`/posts/${postId}/close`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/posts/${postId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      queryClient.invalidateQueries({ queryKey: postKeys.calendars() });
      onNavigate('/');
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">불러오는 중...</p>
      </div>
    );
  }

  if (fetchError || !post) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-destructive">
          {fetchError
            ? getErrorMessage(fetchError, '데이터를 불러오는 중 오류가 발생했습니다.')
            : '데이터를 찾을 수 없습니다.'}
        </p>
      </div>
    );
  }

  const isAuthor = post.author.id === currentMemberId;
  const isParticipating = post.participations.some(
    (p) => p.member.id === currentMemberId,
  );
  const isOpen = post.status === 'open';

  const actionError =
    participateMutation.error ??
    cancelMutation.error ??
    closeMutation.error ??
    deleteMutation.error;

  function handleDelete() {
    const confirmed = window.confirm('정말 삭제하시겠습니까?');
    if (!confirmed) return;
    deleteMutation.mutate();
  }

  function handleEdit() {
    onNavigate(`/posts/${postId}/edit`);
  }

  return (
    <div className="flex min-h-screen flex-col items-center p-4">
      <div className="w-full max-w-md space-y-6">
        <h2 className="text-2xl font-bold">{post.menu}</h2>

        <div className="space-y-3 rounded-lg border p-4">
          {post.restaurant && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">식당/장소</span>
              <span>{post.restaurant}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">날짜</span>
            <span>{post.date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">시간</span>
            <span>{post.time}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">최대 인원</span>
            <span>{post.maxParticipants}명</span>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold">
            참여자 ({post.participations.length}/{post.maxParticipants})
          </h3>
          <ul className="space-y-1">
            {post.participations.map((p) => (
              <li key={p.id} className="text-sm">
                {p.member.nickname}
              </li>
            ))}
          </ul>
        </div>

        {actionError && (
          <p className="text-sm text-destructive">
            {getErrorMessage(actionError, '오류가 발생했습니다.')}
          </p>
        )}

        <div className="flex flex-col gap-3">
          {isOpen && !isParticipating && !isAuthor && (
            <Button onClick={() => participateMutation.mutate()}>참여하기</Button>
          )}

          {isOpen && isParticipating && !isAuthor && (
            <Button variant="outline" onClick={() => cancelMutation.mutate()}>
              참여 취소
            </Button>
          )}

          {isAuthor && (
            <>
              <Button variant="outline" onClick={handleEdit}>
                수정
              </Button>
              {isOpen && (
                <Button variant="secondary" onClick={() => closeMutation.mutate()}>
                  마감
                </Button>
              )}
              <Button variant="destructive" onClick={handleDelete}>
                삭제
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
