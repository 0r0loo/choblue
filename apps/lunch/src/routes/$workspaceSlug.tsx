import { useState } from 'react';
import {
  createFileRoute,
  Outlet,
  redirect,
  useNavigate,
} from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { workspaceQueries } from '@/lib/queries';
import { WorkspaceDrawer } from '@/components/workspace-drawer';
import type { Workspace } from '@/types';

export const Route = createFileRoute('/$workspaceSlug')({
  beforeLoad: async ({ params }) => {
    try {
      await api.get<Workspace>(`/workspaces/${params.workspaceSlug}`);
    } catch {
      throw redirect({ to: '/' });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { workspaceSlug } = Route.useParams();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { data: workspace } = useQuery(
    workspaceQueries.detail(workspaceSlug),
  );

  function handleNavigate(path: string) {
    if (path === '/') {
      navigate({ to: '/' });
    } else {
      navigate({ to: `/${workspaceSlug}${path}` });
    }
    setIsDrawerOpen(false);
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-[200] border-b border-black/5 bg-background/80 backdrop-blur-xl dark:border-white/10">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={() => navigate({ to: `/${workspaceSlug}` })}
            className="flex min-w-0 items-center gap-2 transition-opacity duration-200 hover:opacity-70 active:scale-[0.98]"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
              {(workspace?.name ?? workspaceSlug).charAt(0).toUpperCase()}
            </div>
            <h1 className="truncate text-base font-semibold tracking-tight">
              {workspace?.name ?? workspaceSlug}
            </h1>
          </button>
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground active:scale-[0.96]"
            aria-label="메뉴 열기"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <WorkspaceDrawer
        workspaceId={workspaceSlug}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
