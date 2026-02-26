import { useState, useEffect } from 'react';
import { Button } from '@choblue/ui/button';
import { api } from '@/lib/api';
import { MiniCalendar } from '@/components/mini-calendar';
import { PostFeed } from '@/components/post-feed';
import type { LunchPost } from '@/types';

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
  const [posts, setPosts] = useState<LunchPost[]>([]);
  const [calendarData, setCalendarData] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;

    async function fetchPosts() {
      try {
        const data = await api.get<LunchPost[]>(
          `/workspaces/${workspaceId}/posts?date=${selectedDate}`,
        );
        if (!cancelled) {
          setPosts(data);
        }
      } catch {
        if (!cancelled) {
          setPosts([]);
        }
      }
    }

    fetchPosts();

    return () => {
      cancelled = true;
    };
  }, [workspaceId, selectedDate]);

  useEffect(() => {
    let cancelled = false;

    async function fetchCalendar() {
      try {
        const yearMonth = selectedDate.slice(0, 7);
        const data = await api.get<Record<string, number>>(
          `/workspaces/${workspaceId}/posts/calendar?month=${yearMonth}`,
        );
        if (!cancelled) {
          setCalendarData(data);
        }
      } catch {
        if (!cancelled) {
          setCalendarData({});
        }
      }
    }

    fetchCalendar();

    return () => {
      cancelled = true;
    };
  }, [workspaceId, selectedDate]);

  function handlePostClick(postId: string) {
    onNavigate(`/gatherings/${postId}`);
  }

  function handleFabClick() {
    onNavigate(`/gatherings/new`);
  }

  return (
    <div className="relative flex min-h-screen flex-col p-4">
      <div className="mx-auto w-full max-w-md space-y-6">
        <MiniCalendar
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
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
