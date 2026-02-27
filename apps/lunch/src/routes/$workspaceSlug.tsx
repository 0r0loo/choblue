import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/$workspaceSlug')({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
