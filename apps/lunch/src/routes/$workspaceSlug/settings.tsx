import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { SettingsPage } from '@/pages/settings';
import { useCurrentMember } from '@/hooks/use-current-member';

export const Route = createFileRoute('/$workspaceSlug/settings')({
  component: RouteComponent,
});

function RouteComponent() {
  const { workspaceSlug } = Route.useParams();
  const navigate = useNavigate();
  const { data: currentMember, isLoading } = useCurrentMember(workspaceSlug);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">불러오는 중...</p>
      </div>
    );
  }

  function handleNavigate(path: string) {
    if (path === '/') {
      navigate({ to: `/${workspaceSlug}` });
      return;
    }
    navigate({ to: `/${workspaceSlug}${path}` });
  }

  return (
    <SettingsPage
      workspaceId={workspaceSlug}
      currentMemberId={currentMember?.id ?? ''}
      onNavigate={handleNavigate}
    />
  );
}
