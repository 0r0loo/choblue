import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@choblue/ui/button';
import { Card, CardContent } from '@choblue/ui/card';
import { StarRating } from '@choblue/ui/star-rating';
import { api, getErrorMessage } from '@/lib/api';
import { reviewQueries } from '@/lib/queries';
import { reviewKeys } from '@/lib/query-keys';
import { ReviewForm } from '@/components/review-form';
import type { ReviewFormValues } from '@/components/review-form';
import type { Review } from '@/types';

export interface ReviewManagementPageProps {
  workspaceId: string;
  currentMemberId: string;
  memberRole: 'admin' | 'member';
  onNavigate: (path: string) => void;
}

export function ReviewManagementPage({
  workspaceId,
  currentMemberId,
  memberRole,
  onNavigate,
}: ReviewManagementPageProps) {
  const queryClient = useQueryClient();

  const {
    data: reviews = [],
    isLoading,
    error: fetchError,
  } = useQuery(reviewQueries.workspace(workspaceId));

  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  const updateReviewMutation = useMutation({
    mutationFn: ({
      reviewId,
      payload,
    }: {
      reviewId: string;
      payload: {
        tasteRating?: number;
        portionRating?: number;
        restaurant?: string;
        menu?: string;
        content?: string;
      };
    }) => api.patch<Review>(`/reviews/${reviewId}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: reviewKeys.workspace(workspaceId),
      });
      setEditingReviewId(null);
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId: string) => api.delete(`/reviews/${reviewId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: reviewKeys.workspace(workspaceId),
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">불러오는 중...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-danger">
          {getErrorMessage(fetchError, '데이터를 불러오는 중 오류가 발생했습니다.')}
        </p>
      </div>
    );
  }

  function handleEditSubmit(reviewId: string, data: ReviewFormValues) {
    updateReviewMutation.mutate({
      reviewId,
      payload: {
        tasteRating: data.tasteRating,
        portionRating: data.portionRating,
        restaurant: data.restaurant,
        menu: data.menu,
        content: data.content || undefined,
      },
    });
  }

  function handleDelete(reviewId: string) {
    if (window.confirm('리뷰를 삭제하시겠습니까?')) {
      deleteReviewMutation.mutate(reviewId);
    }
  }

  const actionError = updateReviewMutation.error ?? deleteReviewMutation.error;

  return (
    <div className="flex min-h-screen flex-col items-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate('/')}
            aria-label="뒤로가기"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Button>
          <h2 className="text-xl font-bold">리뷰 관리</h2>
        </div>

        {actionError && (
          <p className="text-sm text-danger">
            {getErrorMessage(actionError, '오류가 발생했습니다.')}
          </p>
        )}

        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">아직 리뷰가 없습니다.</p>
        ) : (
          <ul className="space-y-3">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="space-y-2 pt-6">
                  {editingReviewId === review.id ? (
                    <ReviewForm
                      mode="edit"
                      initialValues={{
                        tasteRating: review.tasteRating,
                        portionRating: review.portionRating,
                        restaurant: review.restaurant,
                        menu: review.menu,
                        content: review.content ?? '',
                      }}
                      onSubmit={(data) => handleEditSubmit(review.id, data)}
                      onCancel={() => setEditingReviewId(null)}
                      isPending={updateReviewMutation.isPending}
                      error={updateReviewMutation.error}
                    />
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {review.member.nickname}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {review.restaurant} · {review.menu}
                        </span>
                      </div>
                      <div className="flex gap-4 text-xs">
                        <span className="flex items-center gap-1">
                          맛 <StarRating value={review.tasteRating} readOnly size="sm" />
                        </span>
                        <span className="flex items-center gap-1">
                          양 <StarRating value={review.portionRating} readOnly size="sm" />
                        </span>
                      </div>
                      {review.content && (
                        <p className="text-sm text-muted-foreground">
                          {review.content}
                        </p>
                      )}
                      <div className="flex gap-3 pt-1">
                        {review.memberId === currentMemberId && (
                          <button
                            type="button"
                            className="text-xs text-muted-foreground transition-colors duration-200 hover:text-foreground"
                            onClick={() => setEditingReviewId(review.id)}
                          >
                            수정
                          </button>
                        )}
                        {(memberRole === 'admin' ||
                          review.memberId === currentMemberId) && (
                          <button
                            type="button"
                            className="text-xs text-muted-foreground transition-colors duration-200 hover:text-danger"
                            onClick={() => handleDelete(review.id)}
                          >
                            삭제
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
