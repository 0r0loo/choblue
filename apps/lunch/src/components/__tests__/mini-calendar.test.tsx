import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MiniCalendar } from '../mini-calendar';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const TODAY = new Date();
const TODAY_STRING = toDateString(TODAY);

const MONTH_NAMES = [
  '1월',
  '2월',
  '3월',
  '4월',
  '5월',
  '6월',
  '7월',
  '8월',
  '9월',
  '10월',
  '11월',
  '12월',
];

describe('MiniCalendar', () => {
  // ===========================================================================
  // Rendering
  // ===========================================================================
  describe('rendering', () => {
    it('should display the current month and year', () => {
      render(
        <MiniCalendar
          selectedDate={TODAY_STRING}
          onDateSelect={vi.fn()}
        />,
      );

      const currentYear = TODAY.getFullYear();
      const currentMonth = MONTH_NAMES[TODAY.getMonth()];

      expect(
        screen.getByText(new RegExp(`${currentYear}.*${currentMonth}|${currentMonth}.*${currentYear}`)),
      ).toBeInTheDocument();
    });

    it('should highlight today with a distinct visual indicator', () => {
      render(
        <MiniCalendar
          selectedDate={TODAY_STRING}
          onDateSelect={vi.fn()}
        />,
      );

      // Today's date cell should have aria-current="date"
      const todayCell = screen.getByRole('button', {
        name: new RegExp(`${TODAY.getDate()}`),
        current: 'date',
      });

      expect(todayCell).toBeInTheDocument();
    });

    it('should highlight the selectedDate', () => {
      const selectedDate = '2026-02-15';

      render(
        <MiniCalendar
          selectedDate={selectedDate}
          onDateSelect={vi.fn()}
        />,
      );

      const selectedCell = screen.getByRole('button', {
        name: /15/,
        pressed: true,
      });

      expect(selectedCell).toBeInTheDocument();
    });

    it('should display indicators on dates that have calendar data', () => {
      const calendarData: Record<string, number> = {
        '2026-02-10': 2,
        '2026-02-20': 1,
      };

      render(
        <MiniCalendar
          selectedDate="2026-02-15"
          onDateSelect={vi.fn()}
          calendarData={calendarData}
        />,
      );

      // Dates with posts should have a visual indicator (dot)
      const date10Cell = screen.getByRole('button', { name: /10/ });
      const date20Cell = screen.getByRole('button', { name: /20/ });

      // The indicator should exist within or near the date cells
      expect(within(date10Cell).getByTestId('date-indicator')).toBeInTheDocument();
      expect(within(date20Cell).getByTestId('date-indicator')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Interaction
  // ===========================================================================
  describe('interaction', () => {
    it('should call onDateSelect with the date string when a date is clicked', async () => {
      const user = userEvent.setup();
      const onDateSelect = vi.fn();

      render(
        <MiniCalendar
          selectedDate="2026-02-01"
          onDateSelect={onDateSelect}
        />,
      );

      await user.click(screen.getByRole('button', { name: /15/ }));

      expect(onDateSelect).toHaveBeenCalledWith('2026-02-15');
    });

    it('should navigate to the previous month when previous button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <MiniCalendar
          selectedDate="2026-02-15"
          onDateSelect={vi.fn()}
        />,
      );

      await user.click(
        screen.getByRole('button', { name: /이전|prev|</ }),
      );

      // After clicking previous, should show January 2026
      expect(
        screen.getByText(/2026.*1월|1월.*2026/),
      ).toBeInTheDocument();
    });

    it('should navigate to the next month when next button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <MiniCalendar
          selectedDate="2026-02-15"
          onDateSelect={vi.fn()}
        />,
      );

      await user.click(
        screen.getByRole('button', { name: /다음|next|>/ }),
      );

      // After clicking next, should show March 2026
      expect(
        screen.getByText(/2026.*3월|3월.*2026/),
      ).toBeInTheDocument();
    });
  });
});
