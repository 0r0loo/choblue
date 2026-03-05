import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { PostDetailPage } from '@/pages/post-detail';
import { useCurrentMember } from '@/hooks/use-current-member';

export const Route = createFileRoute('/$workspaceSlug/gatherings/$postId/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { workspaceSlug, postId } = Route.useParams();
  const navigate = useNavigate();
  const { data: currentMember, isLoading } = useCurrentMember(workspaceSlug);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">불러오는 중...</p>
      </div>
    );
  }

  function handleNavigate(path: string) {
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
