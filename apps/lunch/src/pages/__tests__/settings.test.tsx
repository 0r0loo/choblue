import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithQueryClient } from '@/test-utils';
import { SettingsPage } from '../settings';

// ---------------------------------------------------------------------------
// Mock: API module
// ---------------------------------------------------------------------------
vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    patch: vi.fn(),
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
const mockApiPatch = vi.mocked(api.patch);

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------
const WORKSPACE_ID = 'ws-123';
const CURRENT_MEMBER_ID = 'member-1';

const MOCK_WORKSPACE = {
  id: WORKSPACE_ID,
  name: '개발팀',
  description: '점심 같이 먹어요',
  inviteCode: 'abc-def-ghi',
};

const MOCK_MEMBERS = [
  {
    id: 'member-1',
    nickname: '김관리',
    role: 'admin',
    joinedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'member-2',
    nickname: '박개발',
    role: 'member',
    joinedAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'member-3',
    nickname: '이디자인',
    role: 'member',
    joinedAt: '2026-02-01T00:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function setupApiMocks(
  overrides?: Partial<{
    workspace: typeof MOCK_WORKSPACE;
    members: typeof MOCK_MEMBERS;
    currentMemberId: string;
  }>,
) {
  const workspace = overrides?.workspace ?? MOCK_WORKSPACE;
  const members = overrides?.members ?? MOCK_MEMBERS;

  mockApiGet.mockImplementation((path: string) => {
    if (path === `/workspaces/${WORKSPACE_ID}`) {
      return Promise.resolve(workspace);
    }
    if (path === `/workspaces/${WORKSPACE_ID}/members`) {
      return Promise.resolve(members);
    }
    return Promise.resolve({});
  });
}

function renderSettingsPage(
  props?: Partial<{
    workspaceId: string;
    currentMemberId: string;
    onNavigate: ReturnType<typeof vi.fn>;
  }>,
) {
  const defaultProps = {
    workspaceId: WORKSPACE_ID,
    currentMemberId: props?.currentMemberId ?? CURRENT_MEMBER_ID,
    onNavigate: props?.onNavigate ?? vi.fn(),
  };

  return renderWithQueryClient(
    <SettingsPage {...defaultProps} {...props} />,
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('SettingsPage', () => {
  const onNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    setupApiMocks();

    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ===========================================================================
  // Data loading
  // ===========================================================================
  describe('data loading', () => {
    it('should load and display workspace info and member list', async () => {
      renderSettingsPage({ onNavigate });

      await waitFor(() => {
        expect(screen.getByText('개발팀')).toBeInTheDocument();
      });

      expect(screen.getByText('김관리')).toBeInTheDocument();
      expect(screen.getByText('박개발')).toBeInTheDocument();
      expect(screen.getByText('이디자인')).toBeInTheDocument();
    });

    it('should display loading state while data is being fetched', () => {
      // Make API calls never resolve to keep loading state
      mockApiGet.mockImplementation(() => new Promise(() => {}));

      renderSettingsPage({ onNavigate });

      expect(
        screen.getByText(/로딩|불러오는 중/),
      ).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Invite link
  // ===========================================================================
  describe('invite link', () => {
    it('should display the invite link with correct format', async () => {
      renderSettingsPage({ onNavigate });

      await waitFor(() => {
        expect(
          screen.getByText(/\/join\/abc-def-ghi/),
        ).toBeInTheDocument();
      });
    });

    it('should copy invite link to clipboard when copy button is clicked', async () => {
      const user = userEvent.setup();
      renderSettingsPage({ onNavigate });

      await waitFor(() => {
        expect(screen.getByText(/abc-def-ghi/)).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /복사/ }));

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('/join/abc-def-ghi'),
      );
    });

    it('should display "복사되었습니다" text after successful copy', async () => {
      const user = userEvent.setup();
      renderSettingsPage({ onNavigate });

      await waitFor(() => {
        expect(screen.getByText(/abc-def-ghi/)).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /복사/ }));

      await waitFor(() => {
        expect(screen.getByText(/복사되었습니다/)).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // Member list
  // ===========================================================================
  describe('member list', () => {
    it('should display members with nickname and role', async () => {
      renderSettingsPage({ onNavigate });

      await waitFor(() => {
        expect(screen.getByText('김관리')).toBeInTheDocument();
        expect(screen.getByText('박개발')).toBeInTheDocument();
        expect(screen.getByText('이디자인')).toBeInTheDocument();
      });
    });

    it('should display "관리자" badge for admin members', async () => {
      renderSettingsPage({ onNavigate });

      await waitFor(() => {
        expect(screen.getByText('김관리')).toBeInTheDocument();
      });

      expect(screen.getByText('관리자')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Workspace edit (admin only)
  // ===========================================================================
  describe('workspace edit (admin only)', () => {
    it('should display workspace edit form when current member is admin', async () => {
      // member-1 is admin in MOCK_MEMBERS
      renderSettingsPage({
        onNavigate,
        currentMemberId: 'member-1',
      });

      await waitFor(() => {
        expect(
          screen.getByRole('textbox', { name: /워크스페이스 이름/ }),
        ).toBeInTheDocument();
      });
    });

    it('should not display workspace edit form when current member is not admin', async () => {
      // member-2 is a regular member
      renderSettingsPage({
        onNavigate,
        currentMemberId: 'member-2',
      });

      await waitFor(() => {
        expect(screen.getByText('박개발')).toBeInTheDocument();
      });

      expect(
        screen.queryByRole('textbox', { name: /워크스페이스 이름/ }),
      ).not.toBeInTheDocument();
    });

    it('should call PATCH /workspaces/:id when edit form is submitted', async () => {
      const user = userEvent.setup();
      mockApiPatch.mockResolvedValue({ ...MOCK_WORKSPACE, name: '디자인팀' });

      renderSettingsPage({
        onNavigate,
        currentMemberId: 'member-1',
      });

      await waitFor(() => {
        expect(
          screen.getByRole('textbox', { name: /워크스페이스 이름/ }),
        ).toBeInTheDocument();
      });

      const nameInput = screen.getByRole('textbox', {
        name: /워크스페이스 이름/,
      });
      await user.clear(nameInput);
      await user.type(nameInput, '디자인팀');
      await user.click(screen.getByRole('button', { name: /저장/ }));

      await waitFor(() => {
        expect(mockApiPatch).toHaveBeenCalledWith(
          `/workspaces/${WORKSPACE_ID}`,
          expect.objectContaining({ name: '디자인팀' }),
        );
      });
    });

    it('should display success message after workspace update', async () => {
      const user = userEvent.setup();
      mockApiPatch.mockResolvedValue({ ...MOCK_WORKSPACE, name: '디자인팀' });

      renderSettingsPage({
        onNavigate,
        currentMemberId: 'member-1',
      });

      await waitFor(() => {
        expect(
          screen.getByRole('textbox', { name: /워크스페이스 이름/ }),
        ).toBeInTheDocument();
      });

      const nameInput = screen.getByRole('textbox', {
        name: /워크스페이스 이름/,
      });
      await user.clear(nameInput);
      await user.type(nameInput, '디자인팀');
      await user.click(screen.getByRole('button', { name: /저장/ }));

      await waitFor(() => {
        expect(
          screen.getByText(/수정되었습니다|저장되었습니다/),
        ).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // Invite link regeneration (admin only)
  // ===========================================================================
  describe('invite link regeneration (admin only)', () => {
    it('should display "초대 링크 재발급" button for admin', async () => {
      renderSettingsPage({
        onNavigate,
        currentMemberId: 'member-1',
      });

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /재발급/ }),
        ).toBeInTheDocument();
      });
    });

    it('should display confirmation dialog when regenerate button is clicked', async () => {
      const user = userEvent.setup();
      renderSettingsPage({
        onNavigate,
        currentMemberId: 'member-1',
      });

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /재발급/ }),
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /재발급/ }));

      await waitFor(() => {
        expect(
          screen.getByText(/재발급.*하시겠습니까|기존.*무효/),
        ).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // Leave workspace
  // ===========================================================================
  describe('leave workspace', () => {
    it('should display "워크스페이스 나가기" button', async () => {
      renderSettingsPage({ onNavigate });

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /나가기/ }),
        ).toBeInTheDocument();
      });
    });

    it('should navigate to landing page after confirming leave', async () => {
      const user = userEvent.setup();
      renderSettingsPage({ onNavigate });

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /나가기/ }),
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /나가기/ }));

      // Confirm dialog should appear, then confirm
      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: /확인/ });
        return user.click(confirmButton);
      });

      await waitFor(() => {
        expect(onNavigate).toHaveBeenCalledWith(
          expect.stringContaining('/'),
        );
      });
    });
  });
});
