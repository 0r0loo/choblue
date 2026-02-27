import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithQueryClient } from '@/test-utils';
import { ProfilePage } from '../profile';

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
const WORKSPACE_ID = 'ws-123';

const MOCK_MEMBER = {
  id: 'member-1',
  nickname: '김개발',
  role: 'member',
  joinedAt: '2026-01-15T00:00:00Z',
};

const NICKNAME_MIN_LENGTH = 2;
const NICKNAME_MAX_LENGTH = 10;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function setupApiMocks(
  overrides?: Partial<{ member: typeof MOCK_MEMBER }>,
) {
  const member = overrides?.member ?? MOCK_MEMBER;

  mockApiGet.mockImplementation((path: string) => {
    if (path === '/members/me') {
      return Promise.resolve(member);
    }
    return Promise.resolve({});
  });
}

function renderProfilePage(
  props?: Partial<{
    workspaceId: string;
    onNavigate: ReturnType<typeof vi.fn>;
  }>,
) {
  const defaultProps = {
    workspaceId: WORKSPACE_ID,
    onNavigate: props?.onNavigate ?? vi.fn(),
  };

  return renderWithQueryClient(
    <ProfilePage {...defaultProps} {...props} />,
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('ProfilePage', () => {
  const onNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    setupApiMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ===========================================================================
  // Data loading
  // ===========================================================================
  describe('data loading', () => {
    it('should load and display current member info', async () => {
      renderProfilePage({ onNavigate });

      await waitFor(() => {
        expect(screen.getByDisplayValue('김개발')).toBeInTheDocument();
      });
    });

    it('should display loading state while data is being fetched', () => {
      mockApiGet.mockImplementation(() => new Promise(() => {}));

      renderProfilePage({ onNavigate });

      expect(
        screen.getByText(/로딩|불러오는 중/),
      ).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Nickname display
  // ===========================================================================
  describe('nickname display', () => {
    it('should display current nickname in the input field', async () => {
      renderProfilePage({ onNavigate });

      await waitFor(() => {
        const nicknameInput = screen.getByRole('textbox', {
          name: /닉네임/,
        });
        expect(nicknameInput).toHaveValue('김개발');
      });
    });
  });

  // ===========================================================================
  // Nickname change
  // ===========================================================================
  describe('nickname change', () => {
    it('should disable save button when nickname is unchanged', async () => {
      renderProfilePage({ onNavigate });

      await waitFor(() => {
        expect(screen.getByDisplayValue('김개발')).toBeInTheDocument();
      });

      expect(
        screen.getByRole('button', { name: /저장/ }),
      ).toBeDisabled();
    });

    it('should enable save button when nickname is changed', async () => {
      const user = userEvent.setup();
      renderProfilePage({ onNavigate });

      await waitFor(() => {
        expect(screen.getByDisplayValue('김개발')).toBeInTheDocument();
      });

      const nicknameInput = screen.getByRole('textbox', {
        name: /닉네임/,
      });
      await user.clear(nicknameInput);
      await user.type(nicknameInput, '박디자인');

      expect(
        screen.getByRole('button', { name: /저장/ }),
      ).toBeEnabled();
    });

    it('should show validation error when nickname is less than 2 characters', async () => {
      const user = userEvent.setup();
      renderProfilePage({ onNavigate });

      await waitFor(() => {
        expect(screen.getByDisplayValue('김개발')).toBeInTheDocument();
      });

      const nicknameInput = screen.getByRole('textbox', {
        name: /닉네임/,
      });
      await user.clear(nicknameInput);
      await user.type(nicknameInput, '김');
      await user.click(screen.getByRole('button', { name: /저장/ }));

      await waitFor(() => {
        expect(
          screen.getByText(new RegExp(`${NICKNAME_MIN_LENGTH}자.*이상|최소.*${NICKNAME_MIN_LENGTH}`)),
        ).toBeInTheDocument();
      });
    });

    it('should show validation error when nickname exceeds 10 characters', async () => {
      const user = userEvent.setup();
      renderProfilePage({ onNavigate });

      await waitFor(() => {
        expect(screen.getByDisplayValue('김개발')).toBeInTheDocument();
      });

      const nicknameInput = screen.getByRole('textbox', {
        name: /닉네임/,
      });
      await user.clear(nicknameInput);
      await user.type(nicknameInput, '가나다라마바사아자차카');
      await user.click(screen.getByRole('button', { name: /저장/ }));

      await waitFor(() => {
        expect(
          screen.getByText(new RegExp(`${NICKNAME_MAX_LENGTH}자.*이하|최대.*${NICKNAME_MAX_LENGTH}`)),
        ).toBeInTheDocument();
      });
    });

    it('should call PATCH /members/me with new nickname on valid save', async () => {
      const user = userEvent.setup();
      mockApiPatch.mockResolvedValue({ ...MOCK_MEMBER, nickname: '박디자인' });

      renderProfilePage({ onNavigate });

      await waitFor(() => {
        expect(screen.getByDisplayValue('김개발')).toBeInTheDocument();
      });

      const nicknameInput = screen.getByRole('textbox', {
        name: /닉네임/,
      });
      await user.clear(nicknameInput);
      await user.type(nicknameInput, '박디자인');
      await user.click(screen.getByRole('button', { name: /저장/ }));

      await waitFor(() => {
        expect(mockApiPatch).toHaveBeenCalledWith(
          '/members/me',
          expect.objectContaining({ nickname: '박디자인' }),
        );
      });
    });

    it('should display success message after nickname is saved', async () => {
      const user = userEvent.setup();
      mockApiPatch.mockResolvedValue({ ...MOCK_MEMBER, nickname: '박디자인' });

      renderProfilePage({ onNavigate });

      await waitFor(() => {
        expect(screen.getByDisplayValue('김개발')).toBeInTheDocument();
      });

      const nicknameInput = screen.getByRole('textbox', {
        name: /닉네임/,
      });
      await user.clear(nicknameInput);
      await user.type(nicknameInput, '박디자인');
      await user.click(screen.getByRole('button', { name: /저장/ }));

      await waitFor(() => {
        expect(
          screen.getByText(/닉네임이 변경되었습니다/),
        ).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // Navigation
  // ===========================================================================
  describe('navigation', () => {
    it('should display a link to go back to settings', async () => {
      renderProfilePage({ onNavigate });

      await waitFor(() => {
        expect(screen.getByDisplayValue('김개발')).toBeInTheDocument();
      });

      expect(
        screen.getByRole('link', { name: /설정.*돌아가기|뒤로/ }) ??
          screen.getByRole('button', { name: /설정.*돌아가기|뒤로/ }),
      ).toBeInTheDocument();
    });

    it('should call onNavigate with "/settings" when back link is clicked', async () => {
      const user = userEvent.setup();
      renderProfilePage({ onNavigate });

      await waitFor(() => {
        expect(screen.getByDisplayValue('김개발')).toBeInTheDocument();
      });

      // Try link first, fallback to button
      const backElement =
        screen.queryByRole('link', { name: /설정.*돌아가기|뒤로/ }) ??
        screen.getByRole('button', { name: /설정.*돌아가기|뒤로/ });

      await user.click(backElement);

      expect(onNavigate).toHaveBeenCalledWith('/settings');
    });
  });
});
