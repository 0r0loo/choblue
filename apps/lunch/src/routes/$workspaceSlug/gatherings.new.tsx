import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { CreatePostPage } from '@/pages/create-post';

export const Route = createFileRoute('/$workspaceSlug/gatherings/new')({
  component: RouteComponent,
});

function RouteComponent() {
  const { workspaceSlug } = Route.useParams();
  const navigate = useNavigate();

  function handleNavigate(path: string) {
    // CreatePostPage는 성공 시 `/${workspaceId}`로 이동 요청 -> 메인 페이지
    if (path === `/${workspaceSlug}`) {
      navigate({ to: `/${workspaceSlug}` });
      return;
    }
    navigate({ to: `/${workspaceSlug}${path}` });
  }

  return (
    <CreatePostPage workspaceId={workspaceSlug} onNavigate={handleNavigate} />
  );
}
