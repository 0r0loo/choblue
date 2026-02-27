import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { JoinWorkspacePage } from '@/pages/join-workspace';

export const Route = createFileRoute('/join/$inviteCode')({
  component: RouteComponent,
});

function RouteComponent() {
  const { inviteCode } = Route.useParams();
  const navigate = useNavigate();

  return (
    <JoinWorkspacePage
      inviteCode={inviteCode}
      onNavigate={(path) => navigate({ to: path })}
    />
  );
}
