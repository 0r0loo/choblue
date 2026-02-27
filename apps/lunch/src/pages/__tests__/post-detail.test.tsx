import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithQueryClient } from '@/test-utils';
import { PostDetailPage } from '../post-detail';
import type { LunchPost } from '@/types';

// ---------------------------------------------------------------------------
// Mock: API module
// ---------------------------------------------------------------------------
vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
  ApiError: class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
    }
  },
}));

// eslint-disable-next-line
import { api } from '@/lib/api';
const mockApiGet = vi.mocked(api.get);
const mockApiPost = vi.mocked(api.post);
const mockApiDelete = vi.mocked(api.delete);

// ---------------------------------------------------------------------------
// Mock: window.confirm
// ---------------------------------------------------------------------------
const mockConfirm = vi.fn();

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------
const POST_ID = 'post-1';
const AUTHOR_MEMBER_ID = 'member-1';
const OTHER_MEMBER_ID = 'member-2';

const MOCK_POST: LunchPost = {
  id: POST_ID,
  menu: '짬뽕',
  restaurant: '만리장성',
  date: '2026-02-27',
  time: '12:00',
  maxParticipants: 4,
  status: 'open',
  author: { id: AUTHOR_MEMBER_ID, nickname: '김개발' },
  participations: [
    { id: 'p-1', member: { id: AUTHOR_MEMBER_ID, nickname: '김개발' } },
    { id: 'p-2', member: { id: 'member-3', nickname: '이디자인' } },
  ],
};

const MOCK_POST_WITH_CURRENT_USER_PARTICIPATING: LunchPost = {
  ...MOCK_POST,
  participations: [
    ...MOCK_POST.participations,
    { id: 'p-3', member: { id: OTHER_MEMBER_ID, nickname: '박총무' } },
  ],
};

const MOCK_CLOSED_POST: LunchPost = {
  ...MOCK_POST,
  status: 'closed',
};

describe('PostDetailPage', () => {
  const onNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockApiGet.mockResolvedValue(MOCK_POST);
    window.confirm = mockConfirm;
    mockConfirm.mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ===========================================================================
  // Loading
  // ===========================================================================
  describe('loading', () => {
    it('should display loading state while fetching post data', () => {
      // Never resolve the API call to keep loading state
      mockApiGet.mockReturnValue(new Promise(() => {}));

      renderWithQueryClient(
        <PostDetailPage
          postId={POST_ID}
          currentMemberId={OTHER_MEMBER_ID}
          onNavigate={onNavigate}
        />,
      );

      expect(screen.getByText(/로딩|불러오는/)).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Rendering - post info
  // ===========================================================================
  describe('rendering post information', () => {
    it('should display post menu, restaurant, and time after loading', async () => {
      renderWithQueryClient(
        <PostDetailPage
          postId={POST_ID}
          currentMemberId={OTHER_MEMBER_ID}
          onNavigate={onNavigate}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText('짬뽕')).toBeInTheDocument();
      });

      expect(screen.getByText(/만리장성/)).toBeInTheDocument();
      expect(screen.getByText(/12:00/)).toBeInTheDocument();
    });

    it('should display participant list with nicknames', async () => {
      renderWithQueryClient(
        <PostDetailPage
          postId={POST_ID}
          currentMemberId={OTHER_MEMBER_ID}
          onNavigate={onNavigate}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText(/김개발/)).toBeInTheDocument();
        expect(screen.getByText(/이디자인/)).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // Participate / Cancel participation
  // ===========================================================================
  describe('participation', () => {
    it('should show "참여하기" button when current user is not participating and post is open', async () => {
      renderWithQueryClient(
        <PostDetailPage
          postId={POST_ID}
          currentMemberId={OTHER_MEMBER_ID}
          onNavigate={onNavigate}
        />,
      );

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /참여하기/ }),
        ).toBeInTheDocument();
      });
    });

    it('should show "참여 취소" button when current user is already participating', async () => {
      mockApiGet.mockResolvedValue(MOCK_POST_WITH_CURRENT_USER_PARTICIPATING);

      renderWithQueryClient(
        <PostDetailPage
          postId={POST_ID}
          currentMemberId={OTHER_MEMBER_ID}
          onNavigate={onNavigate}
        />,
      );

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /참여 취소/ }),
        ).toBeInTheDocument();
      });
    });

    it('should call api.post for participation when "참여하기" is clicked', async () => {
      mockApiPost.mockResolvedValue({});
      const user = userEvent.setup();

      renderWithQueryClient(
        <PostDetailPage
          postId={POST_ID}
          currentMemberId={OTHER_MEMBER_ID}
          onNavigate={onNavigate}
        />,
      );

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /참여하기/ }),
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /참여하기/ }));

      await waitFor(() => {
        expect(mockApiPost).toHaveBeenCalledWith(
          `/posts/${POST_ID}/participate`,
        );
      });
    });

    it('should call api.delete for cancellation when "참여 취소" is clicked', async () => {
      mockApiGet.mockResolvedValue(MOCK_POST_WITH_CURRENT_USER_PARTICIPATING);
      mockApiDelete.mockResolvedValue(undefined);
      const user = userEvent.setup();

      renderWithQueryClient(
        <PostDetailPage
          postId={POST_ID}
          currentMemberId={OTHER_MEMBER_ID}
          onNavigate={onNavigate}
        />,
      );

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /참여 취소/ }),
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /참여 취소/ }));

      await waitFor(() => {
        expect(mockApiDelete).toHaveBeenCalledWith(
          `/posts/${POST_ID}/participate`,
        );
      });
    });

    it('should not show participate button when post is closed', async () => {
      mockApiGet.mockResolvedValue(MOCK_CLOSED_POST);

      renderWithQueryClient(
        <PostDetailPage
          postId={POST_ID}
          currentMemberId={OTHER_MEMBER_ID}
          onNavigate={onNavigate}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText('짬뽕')).toBeInTheDocument();
      });

      expect(
        screen.queryByRole('button', { name: /참여하기/ }),
      ).not.toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Author actions
  // ===========================================================================
  describe('author actions', () => {
    it('should show "수정", "마감", "삭제" buttons when current user is the author', async () => {
      renderWithQueryClient(
        <PostDetailPage
          postId={POST_ID}
          currentMemberId={AUTHOR_MEMBER_ID}
          onNavigate={onNavigate}
        />,
      );

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /수정/ }),
        ).toBeInTheDocument();
      });

      expect(
        screen.getByRole('button', { name: /마감/ }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /삭제/ }),
      ).toBeInTheDocument();
    });

    it('should not show author buttons when current user is not the author', async () => {
      renderWithQueryClient(
        <PostDetailPage
          postId={POST_ID}
          currentMemberId={OTHER_MEMBER_ID}
          onNavigate={onNavigate}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText('짬뽕')).toBeInTheDocument();
      });

      expect(
        screen.queryByRole('button', { name: /수정/ }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /마감/ }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /삭제/ }),
      ).not.toBeInTheDocument();
    });

    it('should call api.post to close post when "마감" is clicked', async () => {
      mockApiPost.mockResolvedValue({});
      const user = userEvent.setup();

      renderWithQueryClient(
        <PostDetailPage
          postId={POST_ID}
          currentMemberId={AUTHOR_MEMBER_ID}
          onNavigate={onNavigate}
        />,
      );

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /마감/ }),
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /마감/ }));

      await waitFor(() => {
        expect(mockApiPost).toHaveBeenCalledWith(
          `/posts/${POST_ID}/close`,
        );
      });
    });

    it('should call api.delete to delete post after confirmation when "삭제" is clicked', async () => {
      mockApiDelete.mockResolvedValue(undefined);
      mockConfirm.mockReturnValue(true);
      const user = userEvent.setup();

      renderWithQueryClient(
        <PostDetailPage
          postId={POST_ID}
          currentMemberId={AUTHOR_MEMBER_ID}
          onNavigate={onNavigate}
        />,
      );

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /삭제/ }),
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /삭제/ }));

      await waitFor(() => {
        expect(mockApiDelete).toHaveBeenCalledWith(`/posts/${POST_ID}`);
      });
    });
  });
});
