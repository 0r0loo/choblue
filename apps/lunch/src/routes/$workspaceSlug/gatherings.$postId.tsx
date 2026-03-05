import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/$workspaceSlug/gatherings/$postId')({
  component: () => <Outlet />,
});
