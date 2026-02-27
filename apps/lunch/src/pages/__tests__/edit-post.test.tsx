import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithQueryClient } from '@/test-utils';
import { EditPostPage } from '../edit-post';
import type { LunchPost } from '@/types';

// ---------------------------------------------------------------------------
// Mock: API module
// ---------------------------------------------------------------------------
vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    patch: vi.fn(),
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
const mockApiPatch = vi.mocked(api.patch);

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------
const POST_ID = 'post-1';

const MOCK_POST: LunchPost = {
  id: POST_ID,
  menu: '짬뽕',
  restaurant: '만리장성',
  date: '2026-02-27',
  time: '12:00',
  maxParticipants: 4,
  status: 'open',
  author: { id: 'member-1', nickname: '김개발' },
  participations: [
    { id: 'p-1', member: { id: 'member-1', nickname: '김개발' } },
  ],
};

describe('EditPostPage', () => {
  const onNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockApiGet.mockResolvedValue(MOCK_POST);
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
        <EditPostPage postId={POST_ID} onNavigate={onNavigate} />,
      );

      expect(screen.getByText(/로딩|불러오는/)).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Pre-filled form
  // ===========================================================================
  describe('pre-filled form', () => {
    it('should populate form fields with existing post data', async () => {
      renderWithQueryClient(
        <EditPostPage postId={POST_ID} onNavigate={onNavigate} />,
      );

      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: /메뉴/ })).toHaveValue(
          '짬뽕',
        );
      });

      expect(
        screen.getByRole('textbox', { name: /식당\/장소/ }),
      ).toHaveValue('만리장성');
    });

    it('should render "수정하기" submit button', async () => {
      renderWithQueryClient(
        <EditPostPage postId={POST_ID} onNavigate={onNavigate} />,
      );

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /수정하기/ }),
        ).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // API interaction - success
  // ===========================================================================
  describe('when API call succeeds', () => {
    beforeEach(() => {
      mockApiPatch.mockResolvedValue({ ...MOCK_POST, menu: '탕수육' });
    });

    it('should call api.patch with updated data on submit', async () => {
      const user = userEvent.setup();

      renderWithQueryClient(
        <EditPostPage postId={POST_ID} onNavigate={onNavigate} />,
      );

      // Wait for form to be populated
      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: /메뉴/ })).toHaveValue(
          '짬뽕',
        );
      });

      // Clear and type new value
      const menuInput = screen.getByRole('textbox', { name: /메뉴/ });
      await user.clear(menuInput);
      await user.type(menuInput, '탕수육');

      await user.click(screen.getByRole('button', { name: /수정하기/ }));

      await waitFor(() => {
        expect(mockApiPatch).toHaveBeenCalledWith(
          `/posts/${POST_ID}`,
          expect.objectContaining({
            menu: '탕수육',
          }),
        );
      });
    });

    it('should call onNavigate after successful update', async () => {
      const user = userEvent.setup();

      renderWithQueryClient(
        <EditPostPage postId={POST_ID} onNavigate={onNavigate} />,
      );

      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: /메뉴/ })).toHaveValue(
          '짬뽕',
        );
      });

      await user.click(screen.getByRole('button', { name: /수정하기/ }));

      await waitFor(() => {
        expect(onNavigate).toHaveBeenCalled();
      });
    });
  });

  // ===========================================================================
  // API interaction - error
  // ===========================================================================
  describe('when API call fails', () => {
    it('should display error message when API returns an error', async () => {
      mockApiPatch.mockRejectedValue(new Error('Network Error'));

      const user = userEvent.setup();

      renderWithQueryClient(
        <EditPostPage postId={POST_ID} onNavigate={onNavigate} />,
      );

      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: /메뉴/ })).toHaveValue(
          '짬뽕',
        );
      });

      await user.click(screen.getByRole('button', { name: /수정하기/ }));

      await waitFor(() => {
        expect(
          screen.getByText(/다시 시도|오류|실패/),
        ).toBeInTheDocument();
      });
    });
  });
});
