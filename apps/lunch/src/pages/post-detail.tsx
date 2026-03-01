import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@choblue/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@choblue/ui/card';
import { api, getErrorMessage } from '@/lib/api';
import { postQueries, reviewQueries } from '@/lib/queries';
import { postKeys, reviewKeys } from '@/lib/query-keys';
import type { Review } from '@/types';

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

  const { data: reviews } = useQuery({
    ...reviewQueries.list(postId),
    enabled: post?.status === 'closed',
  });

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editContent, setEditContent] = useState('');

  const createReviewMutation = useMutation({
    mutationFn: (payload: { rating: number; content?: string }) =>
      api.post<Review>(`/posts/${postId}/reviews`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.list(postId) });
      setReviewRating(5);
      setReviewContent('');
    },
  });

  const updateReviewMutation = useMutation({
    mutationFn: ({
      reviewId,
      payload,
    }: {
      reviewId: string;
      payload: { rating?: number; content?: string };
    }) => api.patch<Review>(`/reviews/${reviewId}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.list(postId) });
      setEditingReviewId(null);
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId: string) => api.delete(`/reviews/${reviewId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.list(postId) });
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

        <Card>
          <CardContent className="space-y-3 pt-6">
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              참여자 ({post.participations.length}/{post.maxParticipants})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {post.participations.map((p) => (
                <li key={p.id} className="text-sm">
                  {p.member.nickname}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

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

        {!isOpen && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">리뷰</h3>

            {reviews && reviews.length > 0 ? (
              <ul className="space-y-3">
                {reviews.map((review) => (
                  <Card key={review.id} className="overflow-hidden">
                    <CardContent className="space-y-2 pt-4 pb-4">
                    {editingReviewId === review.id ? (
                      <form
                        className="space-y-2"
                        onSubmit={(e) => {
                          e.preventDefault();
                          updateReviewMutation.mutate({
                            reviewId: review.id,
                            payload: {
                              rating: editRating,
                              content: editContent || undefined,
                            },
                          });
                        }}
                      >
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              className={`text-xl ${
                                star <= editRating
                                  ? 'text-yellow-500'
                                  : 'text-gray-300'
                              }`}
                              onClick={() => setEditRating(star)}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                        <input
                          type="text"
                          maxLength={200}
                          placeholder="한줄평을 남겨주세요 (선택)"
                          className="w-full rounded-md border px-3 py-2 text-sm"
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                        />
                        {updateReviewMutation.error && (
                          <p className="text-sm text-destructive">
                            {getErrorMessage(
                              updateReviewMutation.error,
                              '리뷰 수정 중 오류가 발생했습니다.',
                            )}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <Button
                            type="submit"
                            size="sm"
                            disabled={updateReviewMutation.isPending}
                          >
                            {updateReviewMutation.isPending
                              ? '수정 중...'
                              : '저장'}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingReviewId(null)}
                          >
                            취소
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {review.member.nickname}
                          </span>
                          <span className="text-sm text-yellow-500">
                            {'★'.repeat(review.rating)}
                            {'☆'.repeat(5 - review.rating)}
                          </span>
                        </div>
                        {review.content && (
                          <p className="text-sm text-muted-foreground">
                            {review.content}
                          </p>
                        )}
                        {review.memberId === currentMemberId && (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              className="text-xs text-muted-foreground hover:underline"
                              onClick={() => {
                                setEditingReviewId(review.id);
                                setEditRating(review.rating);
                                setEditContent(review.content ?? '');
                              }}
                            >
                              수정
                            </button>
                            <button
                              type="button"
                              className="text-xs text-destructive hover:underline"
                              onClick={() => {
                                if (window.confirm('리뷰를 삭제하시겠습니까?')) {
                                  deleteReviewMutation.mutate(review.id);
                                }
                              }}
                            >
                              삭제
                            </button>
                          </div>
                        )}
                      </>
                    )}
                    </CardContent>
                  </Card>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                아직 리뷰가 없습니다.
              </p>
            )}

            {isParticipating &&
              reviews &&
              !reviews.some((r) => r.memberId === currentMemberId) && (
                <Card>
                  <CardHeader>
                    <CardTitle>리뷰 작성</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form
                      className="space-y-3"
                      onSubmit={(e) => {
                        e.preventDefault();
                        createReviewMutation.mutate({
                          rating: reviewRating,
                          content: reviewContent || undefined,
                        });
                      }}
                    >
                      <div className="space-y-1">
                        <label className="text-sm font-medium">별점</label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              className={`text-xl ${
                                star <= reviewRating
                                  ? 'text-yellow-500'
                                  : 'text-gray-300'
                              }`}
                              onClick={() => setReviewRating(star)}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium">한줄평</label>
                        <input
                          type="text"
                          maxLength={200}
                          placeholder="한줄평을 남겨주세요 (선택)"
                          className="w-full rounded-md border px-3 py-2 text-sm"
                          value={reviewContent}
                          onChange={(e) => setReviewContent(e.target.value)}
                        />
                      </div>
                      {createReviewMutation.error && (
                        <p className="text-sm text-destructive">
                          {getErrorMessage(
                            createReviewMutation.error,
                            '리뷰 작성 중 오류가 발생했습니다.',
                          )}
                        </p>
                      )}
                      <Button
                        type="submit"
                        disabled={createReviewMutation.isPending}
                      >
                        {createReviewMutation.isPending
                          ? '작성 중...'
                          : '리뷰 작성'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
