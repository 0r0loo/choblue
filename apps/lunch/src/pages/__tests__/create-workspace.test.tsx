import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithQueryClient } from '@/test-utils';
import { CreateWorkspacePage } from '../create-workspace';

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

describe('CreateWorkspacePage', () => {
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
    it('should render workspace name input field', () => {
      renderWithQueryClient(<CreateWorkspacePage onNavigate={onNavigate} />);

      expect(
        screen.getByRole('textbox', { name: /워크스페이스 이름/ }),
      ).toBeInTheDocument();
    });

    it('should render workspace description input field', () => {
      renderWithQueryClient(<CreateWorkspacePage onNavigate={onNavigate} />);

      expect(
        screen.getByRole('textbox', { name: /설명/ }),
      ).toBeInTheDocument();
    });

    it('should render nickname input field', () => {
      renderWithQueryClient(<CreateWorkspacePage onNavigate={onNavigate} />);

      expect(
        screen.getByRole('textbox', { name: /닉네임/ }),
      ).toBeInTheDocument();
    });

    it('should render "만들기" submit button', () => {
      renderWithQueryClient(<CreateWorkspacePage onNavigate={onNavigate} />);

      expect(
        screen.getByRole('button', { name: /만들기/ }),
      ).toBeInTheDocument();
    });

    it('should render placeholder text for workspace name', () => {
      renderWithQueryClient(<CreateWorkspacePage onNavigate={onNavigate} />);

      expect(
        screen.getByPlaceholderText(/ABC테크 개발팀/),
      ).toBeInTheDocument();
    });

    it('should render placeholder text for nickname', () => {
      renderWithQueryClient(<CreateWorkspacePage onNavigate={onNavigate} />);

      expect(screen.getByPlaceholderText(/홍길동/)).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Validation
  // ===========================================================================
  describe('validation', () => {
    it('should show error message when workspace name is empty on submit', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<CreateWorkspacePage onNavigate={onNavigate} />);

      // Fill nickname but leave workspace name empty
      await user.type(
        screen.getByRole('textbox', { name: /닉네임/ }),
        '홍길동',
      );
      await user.click(screen.getByRole('button', { name: /만들기/ }));

      await waitFor(() => {
        expect(
          screen.getByText(/워크스페이스 이름.*입력/),
        ).toBeInTheDocument();
      });
    });

    it('should show error message when nickname is empty on submit', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<CreateWorkspacePage onNavigate={onNavigate} />);

      // Fill workspace name but leave nickname empty
      await user.type(
        screen.getByRole('textbox', { name: /워크스페이스 이름/ }),
        '개발팀',
      );
      await user.click(screen.getByRole('button', { name: /만들기/ }));

      await waitFor(() => {
        expect(screen.getByText(/닉네임.*입력/)).toBeInTheDocument();
      });
    });

    it('should not call API when required fields are empty', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<CreateWorkspacePage onNavigate={onNavigate} />);

      await user.click(screen.getByRole('button', { name: /만들기/ }));

      expect(mockApiPost).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // API interaction - success
  // ===========================================================================
  describe('when API call succeeds', () => {
    const successResponse = {
      id: 'ws-123',
      name: '개발팀',
      slug: 'dev-team',
      inviteCode: 'abc-def-ghi',
      inviteLink: 'http://localhost:3000/dev-team/invite/abc-def-ghi',
    };

    beforeEach(() => {
      mockApiPost.mockResolvedValue(successResponse);
    });

    it('should call api.post with workspace data on valid submit', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<CreateWorkspacePage onNavigate={onNavigate} />);

      await user.type(
        screen.getByRole('textbox', { name: /워크스페이스 이름/ }),
        '개발팀',
      );
      await user.type(
        screen.getByRole('textbox', { name: /닉네임/ }),
        '박총무',
      );
      await user.click(screen.getByRole('button', { name: /만들기/ }));

      await waitFor(() => {
        expect(mockApiPost).toHaveBeenCalledWith(
          '/workspaces',
          expect.objectContaining({
            name: '개발팀',
            nickname: '박총무',
          }),
        );
      });
    });

    it('should include optional description in API call when provided', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<CreateWorkspacePage onNavigate={onNavigate} />);

      await user.type(
        screen.getByRole('textbox', { name: /워크스페이스 이름/ }),
        '개발팀',
      );
      await user.type(
        screen.getByRole('textbox', { name: /설명/ }),
        '점심 모임',
      );
      await user.type(
        screen.getByRole('textbox', { name: /닉네임/ }),
        '박총무',
      );
      await user.click(screen.getByRole('button', { name: /만들기/ }));

      await waitFor(() => {
        expect(mockApiPost).toHaveBeenCalledWith(
          '/workspaces',
          expect.objectContaining({
            name: '개발팀',
            description: '점심 모임',
            nickname: '박총무',
          }),
        );
      });
    });

    it('should display invite link after successful creation', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<CreateWorkspacePage onNavigate={onNavigate} />);

      await user.type(
        screen.getByRole('textbox', { name: /워크스페이스 이름/ }),
        '개발팀',
      );
      await user.type(
        screen.getByRole('textbox', { name: /닉네임/ }),
        '박총무',
      );
      await user.click(screen.getByRole('button', { name: /만들기/ }));

      await waitFor(() => {
        expect(
          screen.getByText(/abc-def-ghi|초대 링크/),
        ).toBeInTheDocument();
      });
    });

    it('should display "초대 링크 복사" button after successful creation', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<CreateWorkspacePage onNavigate={onNavigate} />);

      await user.type(
        screen.getByRole('textbox', { name: /워크스페이스 이름/ }),
        '개발팀',
      );
      await user.type(
        screen.getByRole('textbox', { name: /닉네임/ }),
        '박총무',
      );
      await user.click(screen.getByRole('button', { name: /만들기/ }));

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /복사/ }),
        ).toBeInTheDocument();
      });
    });

    it('should display "시작하기" button after successful creation', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<CreateWorkspacePage onNavigate={onNavigate} />);

      await user.type(
        screen.getByRole('textbox', { name: /워크스페이스 이름/ }),
        '개발팀',
      );
      await user.type(
        screen.getByRole('textbox', { name: /닉네임/ }),
        '박총무',
      );
      await user.click(screen.getByRole('button', { name: /만들기/ }));

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /시작하기/ }),
        ).toBeInTheDocument();
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
      renderWithQueryClient(<CreateWorkspacePage onNavigate={onNavigate} />);

      await user.type(
        screen.getByRole('textbox', { name: /워크스페이스 이름/ }),
        '개발팀',
      );
      await user.type(
        screen.getByRole('textbox', { name: /닉네임/ }),
        '박총무',
      );
      await user.click(screen.getByRole('button', { name: /만들기/ }));

      await waitFor(() => {
        expect(
          screen.getByText(/다시 시도|오류|실패/),
        ).toBeInTheDocument();
      });
    });
  });
});
