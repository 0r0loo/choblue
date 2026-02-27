import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/$workspaceSlug/gatherings/$postId')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>모집글 상세</div>;
}
