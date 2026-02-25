import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <h1 className="text-3xl font-bold text-primary">오늘뭐먹을래</h1>
    </div>
  );
}
