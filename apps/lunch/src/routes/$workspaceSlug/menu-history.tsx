import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { MenuHistoryPage } from '@/pages/menu-history';

export const Route = createFileRoute('/$workspaceSlug/menu-history')({
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
    <MenuHistoryPage
      workspaceId={workspaceSlug}
      onNavigate={handleNavigate}
    />
  );
}
