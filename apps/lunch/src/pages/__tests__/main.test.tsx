import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithQueryClient } from '@/test-utils';
import { MainPage } from '../main';

// ---------------------------------------------------------------------------
// Mock: API module
// ---------------------------------------------------------------------------
vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
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

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------
const WORKSPACE_ID = 'ws-123';

const MOCK_POSTS = [
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
    restaurant: null,
    date: '2026-02-26',
    time: '12:30',
    maxParticipants: 6,
    status: 'open',
    author: { id: 'user-2', nickname: '박디자인' },
    participations: [],
  },
];

describe('MainPage', () => {
  const onNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Default: return posts for the list endpoint, empty calendar data
    mockApiGet.mockImplementation((path: string) => {
      if (path.includes('/posts') && !path.includes('/calendar')) {
        return Promise.resolve(MOCK_POSTS);
      }
      if (path.includes('/calendar')) {
        return Promise.resolve({ '2026-02-26': 2 });
      }
      return Promise.resolve({});
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ===========================================================================
  // Rendering
  // ===========================================================================
  describe('rendering', () => {
    it('should render the calendar component', async () => {
      renderWithQueryClient(
        <MainPage workspaceId={WORKSPACE_ID} onNavigate={onNavigate} />,
      );

      // The calendar should show the current month/year
      await waitFor(() => {
        expect(
          screen.getByText(/2026.*2월|2월.*2026/),
        ).toBeInTheDocument();
      });
    });

    it('should render the "모집하기" FAB button', () => {
      renderWithQueryClient(
        <MainPage workspaceId={WORKSPACE_ID} onNavigate={onNavigate} />,
      );

      expect(
        screen.getByRole('button', { name: /모집하기/ }),
      ).toBeInTheDocument();
    });

    it('should display post list after data is loaded', async () => {
      renderWithQueryClient(
        <MainPage workspaceId={WORKSPACE_ID} onNavigate={onNavigate} />,
      );

      await waitFor(() => {
        expect(screen.getByText('짬뽕')).toBeInTheDocument();
        expect(screen.getByText('돈까스')).toBeInTheDocument();
      });
    });

    it('should display empty state message when no posts exist for the selected date', async () => {
      mockApiGet.mockImplementation((path: string) => {
        if (path.includes('/posts') && !path.includes('/calendar')) {
          return Promise.resolve([]);
        }
        if (path.includes('/calendar')) {
          return Promise.resolve({});
        }
        return Promise.resolve({});
      });

      renderWithQueryClient(
        <MainPage workspaceId={WORKSPACE_ID} onNavigate={onNavigate} />,
      );

      await waitFor(() => {
        expect(
          screen.getByText(/아직 모집글이 없습니다/),
        ).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // Interaction
  // ===========================================================================
  describe('interaction', () => {
    it('should navigate to the post creation page when FAB is clicked', async () => {
      const user = userEvent.setup();

      renderWithQueryClient(
        <MainPage workspaceId={WORKSPACE_ID} onNavigate={onNavigate} />,
      );

      await user.click(
        screen.getByRole('button', { name: /모집하기/ }),
      );

      expect(onNavigate).toHaveBeenCalledWith(
        expect.stringContaining('gatherings/new'),
      );
    });
  });
});
