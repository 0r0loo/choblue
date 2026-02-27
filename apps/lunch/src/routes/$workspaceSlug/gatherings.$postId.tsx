import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { PostDetailPage } from '@/pages/post-detail';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface CurrentMember {
  id: string;
  nickname: string;
}

export const Route = createFileRoute('/$workspaceSlug/gatherings/$postId')({
  component: RouteComponent,
});

function RouteComponent() {
  const { workspaceSlug, postId } = Route.useParams();
  const navigate = useNavigate();
  const [currentMember, setCurrentMember] = useState<CurrentMember | null>(
    null,
  );
  const [isLoadingMember, setIsLoadingMember] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchCurrentMember() {
      try {
        const data = await api.get<CurrentMember>(
          `/workspaces/${workspaceSlug}/members/me`,
        );
        if (!cancelled) {
          setCurrentMember(data);
        }
      } catch {
        // 멤버 정보를 가져올 수 없는 경우 빈 상태로 처리
      } finally {
        if (!cancelled) {
          setIsLoadingMember(false);
        }
      }
    }

    fetchCurrentMember();

    return () => {
      cancelled = true;
    };
  }, [workspaceSlug]);

  if (isLoadingMember) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">불러오는 중...</p>
      </div>
    );
  }

  function handleNavigate(path: string) {
    // PostDetailPage 경로 매핑:
    // '/' -> 메인 페이지 (/$workspaceSlug)
    // '/posts/${postId}/edit' -> /$workspaceSlug/gatherings/${postId}/edit
    if (path === '/') {
      navigate({ to: `/${workspaceSlug}` });
      return;
    }
    const editMatch = path.match(/^\/posts\/(.+)\/edit$/);
    if (editMatch) {
      navigate({ to: `/${workspaceSlug}/gatherings/${editMatch[1]}/edit` });
      return;
    }
    navigate({ to: `/${workspaceSlug}${path}` });
  }

  return (
    <PostDetailPage
      postId={postId}
      currentMemberId={currentMember?.id ?? ''}
      onNavigate={handleNavigate}
    />
  );
}
