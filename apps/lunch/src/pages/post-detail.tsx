import { useEffect, useState } from 'react';
import { Button } from '@choblue/ui/button';
import { api } from '@/lib/api';
import type { LunchPost } from '@/types';

export interface PostDetailPageProps {
  postId: string;
  currentMemberId: string;
  onNavigate: (path: string) => void;
}

export function PostDetailPage({ postId, currentMemberId, onNavigate }: PostDetailPageProps) {
  const [post, setPost] = useState<LunchPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchPost() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.get<LunchPost>(`/posts/${postId}`);
        if (!cancelled) {
          setPost(data);
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

    fetchPost();

    return () => {
      cancelled = true;
    };
  }, [postId]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">불러오는 중...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-destructive">{error ?? '데이터를 찾을 수 없습니다.'}</p>
      </div>
    );
  }

  const isAuthor = post.author.id === currentMemberId;
  const isParticipating = post.participations.some(
    (p) => p.member.id === currentMemberId,
  );
  const isOpen = post.status === 'open';

  async function handleParticipate() {
    setActionError(null);
    try {
      await api.post(`/posts/${postId}/participate`);
      const updated = await api.get<LunchPost>(`/posts/${postId}`);
      setPost(updated);
    } catch {
      setActionError('참여 중 오류가 발생했습니다.');
    }
  }

  async function handleCancelParticipation() {
    setActionError(null);
    try {
      await api.delete(`/posts/${postId}/participate`);
      const updated = await api.get<LunchPost>(`/posts/${postId}`);
      setPost(updated);
    } catch {
      setActionError('참여 취소 중 오류가 발생했습니다.');
    }
  }

  async function handleClose() {
    setActionError(null);
    try {
      await api.post(`/posts/${postId}/close`);
      const updated = await api.get<LunchPost>(`/posts/${postId}`);
      setPost(updated);
    } catch {
      setActionError('마감 중 오류가 발생했습니다.');
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm('정말 삭제하시겠습니까?');
    if (!confirmed) return;

    setActionError(null);
    try {
      await api.delete(`/posts/${postId}`);
      onNavigate('/');
    } catch {
      setActionError('삭제 중 오류가 발생했습니다.');
    }
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
          <p className="text-sm text-destructive">{actionError}</p>
        )}

        <div className="flex flex-col gap-3">
          {isOpen && !isParticipating && !isAuthor && (
            <Button onClick={handleParticipate}>참여하기</Button>
          )}

          {isOpen && isParticipating && !isAuthor && (
            <Button variant="outline" onClick={handleCancelParticipation}>
              참여 취소
            </Button>
          )}

          {isAuthor && (
            <>
              <Button variant="outline" onClick={handleEdit}>
                수정
              </Button>
              {isOpen && (
                <Button variant="secondary" onClick={handleClose}>
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
