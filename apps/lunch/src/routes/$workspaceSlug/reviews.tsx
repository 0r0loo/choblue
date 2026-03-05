import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { ReviewManagementPage } from '@/pages/review-management';
import { useCurrentMember } from '@/hooks/use-current-member';
import { memberQueries } from '@/lib/queries';

export const Route = createFileRoute('/$workspaceSlug/reviews')({
  component: RouteComponent,
});

function RouteComponent() {
  const { workspaceSlug } = Route.useParams();
  const navigate = useNavigate();
  const { data: currentMember, isLoading: isLoadingCurrent } =
    useCurrentMember(workspaceSlug);
  const { data: me, isLoading: isLoadingMe } = useQuery(memberQueries.me());

  const isLoading = isLoadingCurrent || isLoadingMe;

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
    <ReviewManagementPage
      workspaceId={workspaceSlug}
      currentMemberId={currentMember?.id ?? ''}
      memberRole={me?.role ?? 'member'}
      onNavigate={handleNavigate}
    />
  );
}
