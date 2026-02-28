import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { MainPage } from '@/pages/main';

export const Route = createFileRoute('/$workspaceSlug/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { workspaceSlug } = Route.useParams();
  const navigate = useNavigate();

  return (
    <MainPage
      workspaceId={workspaceSlug}
      onNavigate={(path) => navigate({ to: `/${workspaceSlug}${path}` })}
    />
  );
}
