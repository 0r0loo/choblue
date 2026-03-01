import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@choblue/ui/button';
import { postQueries } from '@/lib/queries';
import { MiniCalendar } from '@/components/mini-calendar';
import { PostFeed } from '@/components/post-feed';

export interface MainPageProps {
  workspaceId: string;
  onNavigate: (path: string) => void;
}

function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function MainPage({ workspaceId, onNavigate }: MainPageProps) {
  const [selectedDate, setSelectedDate] = useState(() => toDateString(new Date()));

  const yearMonth = selectedDate.slice(0, 7);

  const { data: posts = [] } = useQuery({
    ...postQueries.list(workspaceId, selectedDate),
    enabled: !!workspaceId,
  });

  const { data: calendarData = {} } = useQuery({
    ...postQueries.calendar(workspaceId, yearMonth),
    enabled: !!workspaceId,
  });

  function handlePostClick(postId: string) {
    onNavigate(`/gatherings/${postId}`);
  }

  function handleFabClick() {
    onNavigate(`/gatherings/new`);
  }

  return (
    <div className="relative flex flex-col p-4">
      <div className="mx-auto w-full max-w-md space-y-6">
        <MiniCalendar
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          onPostClick={handlePostClick}
          calendarData={calendarData}
        />

        <PostFeed posts={posts} onPostClick={handlePostClick} />
      </div>

      <Button
        className="fixed bottom-6 right-6 rounded-full shadow-lg"
        size="lg"
        onClick={handleFabClick}
      >
        모집하기
      </Button>
    </div>
  );
}
