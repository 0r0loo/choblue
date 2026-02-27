import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { LandingPage } from '@/pages/landing';

export const Route = createFileRoute('/')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  return <LandingPage onNavigate={(path) => navigate({ to: path })} />;
}
