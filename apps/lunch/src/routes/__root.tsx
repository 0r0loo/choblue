import { createRootRoute, Outlet } from '@tanstack/react-router';
import { ToastProvider, ToastViewport } from '@choblue/ui/toast';

export const Route = createRootRoute({
  component: () => (
    <ToastProvider>
      <div className="min-h-dvh bg-background text-foreground">
        <Outlet />
      </div>
      <ToastViewport />
    </ToastProvider>
  ),
});
