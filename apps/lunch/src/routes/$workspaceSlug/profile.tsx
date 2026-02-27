import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ProfilePage } from '@/pages/profile';

export const Route = createFileRoute('/$workspaceSlug/profile')({
  component: RouteComponent,
});

function RouteComponent() {
  const { workspaceSlug } = Route.useParams();
  const navigate = useNavigate();

  function handleNavigate(path: string) {
    // ProfilePage 경로 매핑:
    // '/settings' -> /$workspaceSlug/settings
    if (path === '/settings') {
      navigate({ to: `/${workspaceSlug}/settings` });
      return;
    }
    navigate({ to: `/${workspaceSlug}${path}` });
  }

  return <ProfilePage workspaceId={workspaceSlug} onNavigate={handleNavigate} />;
}
