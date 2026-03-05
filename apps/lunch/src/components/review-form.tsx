import { useState } from 'react';
import { Button } from '@choblue/ui/button';
import { Input } from '@choblue/ui/input';
import { StarRating } from '@choblue/ui/star-rating';
import { getErrorMessage } from '@/lib/api';

export interface ReviewFormValues {
  tasteRating: number;
  portionRating: number;
  restaurant: string;
  menu: string;
  content: string;
}

export interface ReviewFormProps {
  mode: 'create' | 'edit';
  initialValues?: Partial<ReviewFormValues>;
  onSubmit: (data: ReviewFormValues) => void;
  onCancel?: () => void;
  isPending?: boolean;
  error?: Error | null;
}

export function ReviewForm({
  mode,
  initialValues,
  onSubmit,
  onCancel,
  isPending = false,
  error = null,
}: ReviewFormProps) {
  const [tasteRating, setTasteRating] = useState(initialValues?.tasteRating ?? 5);
  const [portionRating, setPortionRating] = useState(initialValues?.portionRating ?? 5);
  const [restaurant, setRestaurant] = useState(initialValues?.restaurant ?? '');
  const [menu, setMenu] = useState(initialValues?.menu ?? '');
  const [content, setContent] = useState(initialValues?.content ?? '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      tasteRating,
      portionRating,
      restaurant,
      menu,
      content,
    });
  }

  const isCreate = mode === 'create';

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium">식당</label>
        <Input
          required
          placeholder="식당 이름"
          value={restaurant}
          onChange={(e) => setRestaurant(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">메뉴</label>
        <Input
          required
          placeholder="메뉴 이름"
          value={menu}
          onChange={(e) => setMenu(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">맛</label>
        <StarRating value={tasteRating} onChange={setTasteRating} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">양</label>
        <StarRating value={portionRating} onChange={setPortionRating} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">한줄평</label>
        <Input
          maxLength={200}
          placeholder="한줄평을 남겨주세요 (선택)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
      {error && (
        <p className="text-sm text-danger">
          {getErrorMessage(
            error,
            isCreate ? '리뷰 작성 중 오류가 발생했습니다.' : '리뷰 수정 중 오류가 발생했습니다.',
          )}
        </p>
      )}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending
            ? isCreate ? '작성 중...' : '수정 중...'
            : isCreate ? '리뷰 작성' : '저장'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            취소
          </Button>
        )}
      </div>
    </form>
  );
}
