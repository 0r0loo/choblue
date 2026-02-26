import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithQueryClient } from '@/test-utils';
import { JoinWorkspacePage } from '../join-workspace';

// ---------------------------------------------------------------------------
// Mock: API module
// ---------------------------------------------------------------------------
vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
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
const mockApiGet = vi.mocked(api.get);
const mockApiPost = vi.mocked(api.post);

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------
const INVITE_CODE = 'abc-def-ghi';
const WORKSPACE_INFO = {
  id: 'ws-123',
  name: 'ABC테크 개발팀',
  slug: 'abc-tech',
  description: '개발팀 점심 모임',
  memberCount: 5,
};

describe('JoinWorkspacePage', () => {
  const onNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockApiGet.mockResolvedValue(WORKSPACE_INFO);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ===========================================================================
  // Data fetching
  // ===========================================================================
  describe('data fetching', () => {
    it('should fetch workspace info using the invite code', async () => {
      renderWithQueryClient(
        <JoinWorkspacePage
          inviteCode={INVITE_CODE}
          onNavigate={onNavigate}
        />,
      );

      await waitFor(() => {
        expect(mockApiGet).toHaveBeenCalledWith(
          `/workspaces/by-invite/${INVITE_CODE}`,
        );
      });
    });

    it('should display loading state while fetching workspace info', () => {
      // API call never resolves (pending state)
      mockApiGet.mockReturnValue(new Promise(() => {}));

      renderWithQueryClient(
        <JoinWorkspacePage
          inviteCode={INVITE_CODE}
          onNavigate={onNavigate}
        />,
      );

      expect(screen.getByText(/로딩|불러오는 중/)).toBeInTheDocument();
    });

    it('should display error when invite code is invalid', async () => {
      const { ApiError } = await import('@/lib/api');
      mockApiGet.mockRejectedValue(
        new ApiError(404, '유효하지 않은 링크입니다'),
      );

      renderWithQueryClient(
        <JoinWorkspacePage
          inviteCode="invalid-code"
          onNavigate={onNavigate}
        />,
      );

      await waitFor(() => {
        expect(
          screen.getByText(/유효하지 않은 링크/),
        ).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // Rendering (after workspace info loaded)
  // ===========================================================================
  describe('rendering', () => {
    it('should display workspace name after loading', async () => {
      renderWithQueryClient(
        <JoinWorkspacePage
          inviteCode={INVITE_CODE}
          onNavigate={onNavigate}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText(/ABC테크 개발팀/)).toBeInTheDocument();
      });
    });

    it('should display participation prompt with workspace name', async () => {
      renderWithQueryClient(
        <JoinWorkspacePage
          inviteCode={INVITE_CODE}
          onNavigate={onNavigate}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText(/참여합니다/)).toBeInTheDocument();
      });
    });

    it('should render nickname input field', async () => {
      renderWithQueryClient(
        <JoinWorkspacePage
          inviteCode={INVITE_CODE}
          onNavigate={onNavigate}
        />,
      );

      await waitFor(() => {
        expect(
          screen.getByRole('textbox', { name: /닉네임/ }),
        ).toBeInTheDocument();
      });
    });

    it('should render "참여하기" submit button', async () => {
      renderWithQueryClient(
        <JoinWorkspacePage
          inviteCode={INVITE_CODE}
          onNavigate={onNavigate}
        />,
      );

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /참여하기/ }),
        ).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // Validation
  // ===========================================================================
  describe('validation', () => {
    it('should show error message when nickname is empty on submit', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(
        <JoinWorkspacePage
          inviteCode={INVITE_CODE}
          onNavigate={onNavigate}
        />,
      );

      // Wait for workspace info to load, then try to submit without nickname
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /참여하기/ }),
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /참여하기/ }));

      await waitFor(() => {
        expect(screen.getByText(/닉네임.*입력/)).toBeInTheDocument();
      });
    });

    it('should not call API when nickname is empty', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(
        <JoinWorkspacePage
          inviteCode={INVITE_CODE}
          onNavigate={onNavigate}
        />,
      );

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /참여하기/ }),
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /참여하기/ }));

      expect(mockApiPost).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // API interaction - success
  // ===========================================================================
  describe('when join API call succeeds', () => {
    const joinResponse = {
      memberId: 'member-456',
      workspaceSlug: 'abc-tech',
    };

    beforeEach(() => {
      mockApiPost.mockResolvedValue(joinResponse);
    });

    it('should call api.post with nickname when submitted', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(
        <JoinWorkspacePage
          inviteCode={INVITE_CODE}
          onNavigate={onNavigate}
        />,
      );

      await waitFor(() => {
        expect(
          screen.getByRole('textbox', { name: /닉네임/ }),
        ).toBeInTheDocument();
      });

      await user.type(
        screen.getByRole('textbox', { name: /닉네임/ }),
        '김신입',
      );
      await user.click(screen.getByRole('button', { name: /참여하기/ }));

      await waitFor(() => {
        expect(mockApiPost).toHaveBeenCalledWith(
          `/workspaces/${WORKSPACE_INFO.id}/members`,
          expect.objectContaining({
            nickname: '김신입',
            inviteCode: INVITE_CODE,
          }),
        );
      });
    });

    it('should navigate to workspace main page after successful join', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(
        <JoinWorkspacePage
          inviteCode={INVITE_CODE}
          onNavigate={onNavigate}
        />,
      );

      await waitFor(() => {
        expect(
          screen.getByRole('textbox', { name: /닉네임/ }),
        ).toBeInTheDocument();
      });

      await user.type(
        screen.getByRole('textbox', { name: /닉네임/ }),
        '김신입',
      );
      await user.click(screen.getByRole('button', { name: /참여하기/ }));

      await waitFor(() => {
        expect(onNavigate).toHaveBeenCalledWith(
          expect.stringContaining('abc-tech'),
        );
      });
    });
  });

  // ===========================================================================
  // API interaction - error
  // ===========================================================================
  describe('when join API call fails', () => {
    it('should display error message when join API returns an error', async () => {
      mockApiPost.mockRejectedValue(new Error('Network Error'));

      const user = userEvent.setup();
      renderWithQueryClient(
        <JoinWorkspacePage
          inviteCode={INVITE_CODE}
          onNavigate={onNavigate}
        />,
      );

      await waitFor(() => {
        expect(
          screen.getByRole('textbox', { name: /닉네임/ }),
        ).toBeInTheDocument();
      });

      await user.type(
        screen.getByRole('textbox', { name: /닉네임/ }),
        '김신입',
      );
      await user.click(screen.getByRole('button', { name: /참여하기/ }));

      await waitFor(() => {
        expect(
          screen.getByText(/다시 시도|오류|실패/),
        ).toBeInTheDocument();
      });
    });
  });
});
