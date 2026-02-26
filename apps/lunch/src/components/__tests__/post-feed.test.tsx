import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PostFeed } from '../post-feed';
import type { LunchPost } from '@/types';

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------
const MOCK_POSTS: LunchPost[] = [
  {
    id: 'post-1',
    menu: '짬뽕',
    restaurant: '만리장성',
    date: '2026-02-26',
    time: '12:00',
    maxParticipants: 4,
    status: 'open',
    author: { id: 'user-1', nickname: '김개발' },
    participations: [
      { id: 'p-1', member: { id: 'user-1', nickname: '김개발' } },
    ],
  },
  {
    id: 'post-2',
    menu: '돈까스',
    restaurant: '경양식집',
    date: '2026-02-26',
    time: '12:30',
    maxParticipants: 6,
    status: 'open',
    author: { id: 'user-2', nickname: '박디자인' },
    participations: [
      { id: 'p-2', member: { id: 'user-2', nickname: '박디자인' } },
      { id: 'p-3', member: { id: 'user-3', nickname: '이기획' } },
    ],
  },
];

describe('PostFeed', () => {
  // ===========================================================================
  // Rendering
  // ===========================================================================
  describe('rendering', () => {
    it('should render all post cards in the list', () => {
      render(<PostFeed posts={MOCK_POSTS} onPostClick={vi.fn()} />);

      expect(screen.getByText('짬뽕')).toBeInTheDocument();
      expect(screen.getByText('돈까스')).toBeInTheDocument();
    });

    it('should display empty state message when posts array is empty', () => {
      render(<PostFeed posts={[]} onPostClick={vi.fn()} />);

      expect(
        screen.getByText(/아직 모집글이 없습니다/),
      ).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Interaction
  // ===========================================================================
  describe('interaction', () => {
    it('should call onPostClick with the post id when a card is clicked', async () => {
      const user = userEvent.setup();
      const onPostClick = vi.fn();

      render(<PostFeed posts={MOCK_POSTS} onPostClick={onPostClick} />);

      await user.click(screen.getByText('짬뽕'));

      expect(onPostClick).toHaveBeenCalledWith('post-1');
    });
  });
});
