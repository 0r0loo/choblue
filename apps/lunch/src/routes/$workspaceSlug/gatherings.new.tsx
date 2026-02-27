import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/$workspaceSlug/gatherings/new')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>모집글 작성</div>;
}
