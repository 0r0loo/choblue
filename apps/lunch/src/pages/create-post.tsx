import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@choblue/ui/button';
import { Input } from '@choblue/ui/input';
import { api, getErrorMessage } from '@/lib/api';
import { postKeys } from '@/lib/query-keys';

export interface CreatePostPageProps {
  workspaceId: string;
  onNavigate: (path: string) => void;
}

const TIME_OPTIONS = [
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
];

function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function CreatePostPage({ workspaceId, onNavigate }: CreatePostPageProps) {
  const queryClient = useQueryClient();

  const [menu, setMenu] = useState('');
  const [restaurant, setRestaurant] = useState('');
  const [date, setDate] = useState(getTodayString());
  const [time, setTime] = useState('12:00');
  const [maxParticipants, setMaxParticipants] = useState(4);
  const [menuError, setMenuError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [timeError, setTimeError] = useState<string | null>(null);
  const [maxParticipantsError, setMaxParticipantsError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: (payload: {
      menu: string;
      restaurant: string | null;
      date: string;
      time: string;
      maxParticipants: number;
    }) => api.post(`/workspaces/${workspaceId}/posts`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      queryClient.invalidateQueries({ queryKey: postKeys.calendars() });
      onNavigate(`/${workspaceId}`);
    },
  });

  function validate(): boolean {
    let isValid = true;

    if (!menu.trim()) {
      setMenuError('메뉴를 입력해주세요');
      isValid = false;
    } else {
      setMenuError(null);
    }

    if (!date) {
      setDateError('날짜를 선택해주세요');
      isValid = false;
    } else {
      setDateError(null);
    }

    if (!time) {
      setTimeError('시간을 선택해주세요');
      isValid = false;
    } else {
      setTimeError(null);
    }

    if (maxParticipants < 2 || maxParticipants > 10) {
      setMaxParticipantsError('최대 인원은 2~10명이어야 합니다');
      isValid = false;
    } else {
      setMaxParticipantsError(null);
    }

    return isValid;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    createMutation.mutate({
      menu,
      restaurant: restaurant.trim() || null,
      date,
      time,
      maxParticipants,
    });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
        <h2 className="text-2xl font-bold">점심 모집하기</h2>

        <div className="space-y-2">
          <label htmlFor="post-menu" className="text-sm font-medium">
            메뉴
          </label>
          <Input
            id="post-menu"
            placeholder="짬뽕, 김치찌개 등"
            value={menu}
            onChange={(e) => setMenu(e.target.value)}
            aria-invalid={!!menuError}
          />
          {menuError && (
            <p className="text-sm text-destructive">{menuError}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="post-restaurant" className="text-sm font-medium">
            식당/장소
          </label>
          <Input
            id="post-restaurant"
            placeholder="만리장성, 구내식당 등"
            value={restaurant}
            onChange={(e) => setRestaurant(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="post-date" className="text-sm font-medium">
            날짜
          </label>
          <Input
            id="post-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-invalid={!!dateError}
          />
          {dateError && (
            <p className="text-sm text-destructive">{dateError}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="post-time" className="text-sm font-medium">
            시간
          </label>
          <select
            id="post-time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {TIME_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {timeError && (
            <p className="text-sm text-destructive">{timeError}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="post-max-participants" className="text-sm font-medium">
            최대 인원
          </label>
          <Input
            id="post-max-participants"
            type="number"
            min={2}
            max={10}
            value={maxParticipants}
            onChange={(e) => setMaxParticipants(Number(e.target.value))}
            aria-invalid={!!maxParticipantsError}
          />
          {maxParticipantsError && (
            <p className="text-sm text-destructive">{maxParticipantsError}</p>
          )}
        </div>

        {createMutation.error && (
          <p className="text-sm text-destructive">
            {getErrorMessage(createMutation.error, '오류가 발생했습니다. 다시 시도해주세요.')}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={createMutation.isPending}>
          {createMutation.isPending ? '모집 중...' : '모집하기'}
        </Button>
      </form>
    </div>
  );
}
