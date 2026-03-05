import { useCallback } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { JoinWorkspacePage } from '@/pages/join-workspace';

export const Route = createFileRoute('/join/$inviteCode')({
  component: RouteComponent,
});

function RouteComponent() {
  const { inviteCode } = Route.useParams();
  const navigate = useNavigate();

  const onNavigate = useCallback(
    (path: string) => navigate({ to: path }),
    [navigate],
  );

  return (
    <JoinWorkspacePage
      inviteCode={inviteCode}
      onNavigate={onNavigate}
    />
  );
}
