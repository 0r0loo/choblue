import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PostCard } from '../post-card';
import type { LunchPost } from '@/types';

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------
const OPEN_POST: LunchPost = {
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
    { id: 'p-2', member: { id: 'user-2', nickname: '박디자인' } },
  ],
};

const CLOSED_POST: LunchPost = {
  ...OPEN_POST,
  id: 'post-2',
  status: 'closed',
};

const POST_WITHOUT_RESTAURANT: LunchPost = {
  ...OPEN_POST,
  id: 'post-3',
  restaurant: null,
};

describe('PostCard', () => {
  // ===========================================================================
  // Rendering
  // ===========================================================================
  describe('rendering', () => {
    it('should display the menu name', () => {
      render(<PostCard post={OPEN_POST} onClick={vi.fn()} />);

      expect(screen.getByText('짬뽕')).toBeInTheDocument();
    });

    it('should display the restaurant when provided', () => {
      render(<PostCard post={OPEN_POST} onClick={vi.fn()} />);

      expect(screen.getByText(/만리장성/)).toBeInTheDocument();
    });

    it('should not display restaurant text when restaurant is null', () => {
      render(<PostCard post={POST_WITHOUT_RESTAURANT} onClick={vi.fn()} />);

      // First, confirm the component actually renders (menu name should be visible)
      expect(screen.getByText('짬뽕')).toBeInTheDocument();
      // Then verify no restaurant text is shown
      expect(screen.queryByText(/만리장성/)).not.toBeInTheDocument();
    });

    it('should display the time', () => {
      render(<PostCard post={OPEN_POST} onClick={vi.fn()} />);

      expect(screen.getByText(/12:00/)).toBeInTheDocument();
    });

    it('should display current participants and max participants', () => {
      render(<PostCard post={OPEN_POST} onClick={vi.fn()} />);

      // 2 participations / 4 max
      expect(screen.getByText(/2\/4/)).toBeInTheDocument();
    });

    it('should display "모집중" badge when status is open', () => {
      render(<PostCard post={OPEN_POST} onClick={vi.fn()} />);

      expect(screen.getByText(/모집중/)).toBeInTheDocument();
    });

    it('should display "마감" badge when status is closed', () => {
      render(<PostCard post={CLOSED_POST} onClick={vi.fn()} />);

      expect(screen.getByText(/마감/)).toBeInTheDocument();
    });

    it('should display the author nickname', () => {
      render(<PostCard post={OPEN_POST} onClick={vi.fn()} />);

      expect(screen.getByText(/김개발/)).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Interaction
  // ===========================================================================
  describe('interaction', () => {
    it('should call onClick when the card is clicked', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      render(<PostCard post={OPEN_POST} onClick={onClick} />);

      await user.click(screen.getByText('짬뽕'));

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });
});
