import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/$workspaceSlug/gatherings/$postId/edit',
)({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>모집글 수정</div>;
}
