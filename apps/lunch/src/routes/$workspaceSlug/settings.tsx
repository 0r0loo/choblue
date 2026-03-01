import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { SettingsPage } from '@/pages/settings';

export const Route = createFileRoute('/$workspaceSlug/settings')({
  component: RouteComponent,
});

function RouteComponent() {
  const { workspaceSlug } = Route.useParams();
  const navigate = useNavigate();

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
      onNavigate={handleNavigate}
    />
  );
}
