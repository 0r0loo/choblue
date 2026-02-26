import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LandingPage } from '../landing';

describe('LandingPage', () => {
  // ===========================================================================
  // Rendering
  // ===========================================================================
  describe('rendering', () => {
    it('should render the app title', () => {
      const onNavigate = vi.fn();

      render(<LandingPage onNavigate={onNavigate} />);

      expect(
        screen.getByRole('heading', { name: /오늘뭐먹을래|점심/ }),
      ).toBeInTheDocument();
    });

    it('should render "워크스페이스 만들기" button', () => {
      const onNavigate = vi.fn();

      render(<LandingPage onNavigate={onNavigate} />);

      expect(
        screen.getByRole('button', { name: /워크스페이스 만들기/ }),
      ).toBeInTheDocument();
    });

    it('should render invite participation guide text', () => {
      const onNavigate = vi.fn();

      render(<LandingPage onNavigate={onNavigate} />);

      expect(screen.getByText(/초대 링크/)).toBeInTheDocument();
    });

    it('should render usage steps explanation', () => {
      const onNavigate = vi.fn();

      render(<LandingPage onNavigate={onNavigate} />);

      // 3-step usage guide as per screens.md
      expect(screen.getByText(/만들기/)).toBeInTheDocument();
      expect(screen.getByText(/초대/)).toBeInTheDocument();
      expect(screen.getByText(/모집/)).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Interaction
  // ===========================================================================
  describe('interaction', () => {
    it('should call onNavigate with "/create" when "워크스페이스 만들기" button is clicked', async () => {
      const user = userEvent.setup();
      const onNavigate = vi.fn();

      render(<LandingPage onNavigate={onNavigate} />);

      await user.click(
        screen.getByRole('button', { name: /워크스페이스 만들기/ }),
      );

      expect(onNavigate).toHaveBeenCalledWith('/create');
    });
  });
});
