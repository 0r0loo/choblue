import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { CreateWorkspacePage } from '@/pages/create-workspace';

export const Route = createFileRoute('/create')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  return <CreateWorkspacePage onNavigate={(path) => navigate({ to: path })} />;
}
