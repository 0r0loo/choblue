import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@choblue/ui/button';
import { Input } from '@choblue/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@choblue/ui/select';
import { useToast } from '@choblue/ui/toast';
import { api, getErrorMessage } from '@/lib/api';
import { postQueries } from '@/lib/queries';
import { postKeys } from '@/lib/query-keys';
import type { LunchPost } from '@/types';

export interface EditPostPageProps {
  postId: string;
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

export function EditPostPage({ postId, onNavigate }: EditPostPageProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: post, isLoading, error: fetchError } = useQuery(
    postQueries.detail(postId),
  );

  const [menu, setMenu] = useState('');
  const [restaurant, setRestaurant] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('12:00');
  const [maxParticipants, setMaxParticipants] = useState(4);
  const [menuError, setMenuError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [timeError, setTimeError] = useState<string | null>(null);
  const [maxParticipantsError, setMaxParticipantsError] = useState<string | null>(null);

  useEffect(() => {
    if (post) {
      setMenu(post.menu);
      setRestaurant(post.restaurant ?? '');
      setDate(post.date);
      setTime(post.time.slice(0, 5));
      setMaxParticipants(post.maxParticipants);
    }
  }, [post]);

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<LunchPost>) =>
      api.patch(`/posts/${postId}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) });
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      toast({ title: '수정 완료', description: '모집글이 수정되었습니다.' });
      onNavigate(`/posts/${postId}`);
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">불러오는 중...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-danger">
          {getErrorMessage(fetchError, '데이터를 불러오는 중 오류가 발생했습니다.')}
        </p>
      </div>
    );
  }

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

    updateMutation.mutate({
      menu,
      restaurant: restaurant.trim() || null,
      date,
      time,
      maxParticipants,
    });
  }

  return (
    <div className="flex flex-col items-center p-4 pt-8">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
        <h2 className="text-2xl font-bold">모집글 수정</h2>

        <div className="space-y-2">
          <label htmlFor="edit-menu" className="text-sm font-medium">
            메뉴
          </label>
          <Input
            id="edit-menu"
            placeholder="짬뽕, 김치찌개 등"
            value={menu}
            onChange={(e) => setMenu(e.target.value)}
            aria-invalid={!!menuError}
          />
          {menuError && (
            <p className="text-sm text-danger">{menuError}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="edit-restaurant" className="text-sm font-medium">
            식당/장소
          </label>
          <Input
            id="edit-restaurant"
            placeholder="만리장성, 구내식당 등"
            value={restaurant}
            onChange={(e) => setRestaurant(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="edit-date" className="text-sm font-medium">
            날짜
          </label>
          <Input
            id="edit-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-invalid={!!dateError}
          />
          {dateError && (
            <p className="text-sm text-danger">{dateError}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="edit-time" className="text-sm font-medium">
            시간
          </label>
          <Select value={time} onValueChange={setTime}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_OPTIONS.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {timeError && (
            <p className="text-sm text-danger">{timeError}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="edit-max-participants" className="text-sm font-medium">
            최대 인원
          </label>
          <Input
            id="edit-max-participants"
            type="number"
            min={2}
            max={10}
            value={maxParticipants}
            onChange={(e) => setMaxParticipants(Number(e.target.value))}
            aria-invalid={!!maxParticipantsError}
          />
          {maxParticipantsError && (
            <p className="text-sm text-danger">{maxParticipantsError}</p>
          )}
        </div>

        {updateMutation.error && (
          <p className="text-sm text-danger">
            {getErrorMessage(updateMutation.error, '오류가 발생했습니다. 다시 시도해주세요.')}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? '수정 중...' : '수정하기'}
        </Button>
      </form>
    </div>
  );
}
