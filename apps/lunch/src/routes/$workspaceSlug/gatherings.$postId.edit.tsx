import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { EditPostPage } from '@/pages/edit-post';

export const Route = createFileRoute(
  '/$workspaceSlug/gatherings/$postId/edit',
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { workspaceSlug, postId } = Route.useParams();
  const navigate = useNavigate();

  function handleNavigate(path: string) {
    // EditPostPage 경로 매핑:
    // '/posts/${postId}' -> /$workspaceSlug/gatherings/${postId}
    const postMatch = path.match(/^\/posts\/(.+)$/);
    if (postMatch) {
      navigate({ to: `/${workspaceSlug}/gatherings/${postMatch[1]}` });
      return;
    }
    navigate({ to: `/${workspaceSlug}${path}` });
  }

  return <EditPostPage postId={postId} onNavigate={handleNavigate} />;
}
