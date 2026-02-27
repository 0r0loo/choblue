import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithQueryClient } from '@/test-utils';
import { CreatePostPage } from '../create-post';

// ---------------------------------------------------------------------------
// Mock: API module
// ---------------------------------------------------------------------------
vi.mock('@/lib/api', () => ({
  api: {
    post: vi.fn(),
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
const mockApiPost = vi.mocked(api.post);

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------
const WORKSPACE_ID = 'ws-123';

const TIME_OPTIONS = [
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
];

describe('CreatePostPage', () => {
  const onNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ===========================================================================
  // Rendering
  // ===========================================================================
  describe('rendering', () => {
    it('should render menu input field', () => {
      renderWithQueryClient(
        <CreatePostPage workspaceId={WORKSPACE_ID} onNavigate={onNavigate} />,
      );

      expect(
        screen.getByRole('textbox', { name: /메뉴/ }),
      ).toBeInTheDocument();
    });

    it('should render restaurant input field', () => {
      renderWithQueryClient(
        <CreatePostPage workspaceId={WORKSPACE_ID} onNavigate={onNavigate} />,
      );

      expect(
        screen.getByRole('textbox', { name: /식당\/장소/ }),
      ).toBeInTheDocument();
    });

    it('should render time select with lunch time options', () => {
      renderWithQueryClient(
        <CreatePostPage workspaceId={WORKSPACE_ID} onNavigate={onNavigate} />,
      );

      // The time select/combobox should be present
      expect(screen.getByLabelText(/시간/)).toBeInTheDocument();

      // All time options should be available
      for (const time of TIME_OPTIONS) {
        expect(screen.getByText(time)).toBeInTheDocument();
      }
    });

    it('should render max participants field', () => {
      renderWithQueryClient(
        <CreatePostPage workspaceId={WORKSPACE_ID} onNavigate={onNavigate} />,
      );

      expect(screen.getByLabelText(/최대 인원/)).toBeInTheDocument();
    });

    it('should render "모집하기" submit button', () => {
      renderWithQueryClient(
        <CreatePostPage workspaceId={WORKSPACE_ID} onNavigate={onNavigate} />,
      );

      expect(
        screen.getByRole('button', { name: /모집하기/ }),
      ).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Validation
  // ===========================================================================
  describe('validation', () => {
    it('should show error message when menu is empty on submit', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(
        <CreatePostPage workspaceId={WORKSPACE_ID} onNavigate={onNavigate} />,
      );

      // Leave menu empty, click submit
      await user.click(screen.getByRole('button', { name: /모집하기/ }));

      await waitFor(() => {
        expect(screen.getByText(/메뉴.*입력/)).toBeInTheDocument();
      });
    });

    it('should not call API when menu is empty', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(
        <CreatePostPage workspaceId={WORKSPACE_ID} onNavigate={onNavigate} />,
      );

      await user.click(screen.getByRole('button', { name: /모집하기/ }));

      expect(mockApiPost).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // API interaction - success
  // ===========================================================================
  describe('when API call succeeds', () => {
    const successResponse = {
      id: 'post-1',
      menu: '짬뽕',
      restaurant: '만리장성',
      date: '2026-02-27',
      time: '12:00',
      maxParticipants: 4,
      status: 'open',
    };

    beforeEach(() => {
      mockApiPost.mockResolvedValue(successResponse);
    });

    it('should call api.post with form data on valid submit', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(
        <CreatePostPage workspaceId={WORKSPACE_ID} onNavigate={onNavigate} />,
      );

      await user.type(
        screen.getByRole('textbox', { name: /메뉴/ }),
        '짬뽕',
      );
      await user.type(
        screen.getByRole('textbox', { name: /식당\/장소/ }),
        '만리장성',
      );
      await user.click(screen.getByRole('button', { name: /모집하기/ }));

      await waitFor(() => {
        expect(mockApiPost).toHaveBeenCalledWith(
          `/workspaces/${WORKSPACE_ID}/posts`,
          expect.objectContaining({
            menu: '짬뽕',
            restaurant: '만리장성',
          }),
        );
      });
    });

    it('should call onNavigate after successful creation', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(
        <CreatePostPage workspaceId={WORKSPACE_ID} onNavigate={onNavigate} />,
      );

      await user.type(
        screen.getByRole('textbox', { name: /메뉴/ }),
        '짬뽕',
      );
      await user.click(screen.getByRole('button', { name: /모집하기/ }));

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
      mockApiPost.mockRejectedValue(new Error('Network Error'));

      const user = userEvent.setup();
      renderWithQueryClient(
        <CreatePostPage workspaceId={WORKSPACE_ID} onNavigate={onNavigate} />,
      );

      await user.type(
        screen.getByRole('textbox', { name: /메뉴/ }),
        '짬뽕',
      );
      await user.click(screen.getByRole('button', { name: /모집하기/ }));

      await waitFor(() => {
        expect(
          screen.getByText(/다시 시도|오류|실패/),
        ).toBeInTheDocument();
      });
    });
  });
});
