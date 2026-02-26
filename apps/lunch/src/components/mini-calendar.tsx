import { useState } from 'react';
import { Button } from '@choblue/ui/button';

export interface MiniCalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  calendarData?: Record<string, number>;
}

const MONTH_NAMES = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월',
];

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDate(dateStr: string): { year: number; month: number; day: number } {
  const [year, month, day] = dateStr.split('-').map(Number);
  return { year, month, day };
}

export function MiniCalendar({ selectedDate, onDateSelect, calendarData = {} }: MiniCalendarProps) {
  const parsed = parseDate(selectedDate);
  const [viewYear, setViewYear] = useState(parsed.year);
  const [viewMonth, setViewMonth] = useState(parsed.month);

  const todayString = toDateString(new Date());

  const firstDayOfMonth = new Date(viewYear, viewMonth - 1, 1);
  const startDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();

  function handlePrevMonth() {
    if (viewMonth === 1) {
      setViewYear(viewYear - 1);
      setViewMonth(12);
    } else {
      setViewMonth(viewMonth - 1);
    }
  }

  function handleNextMonth() {
    if (viewMonth === 12) {
      setViewYear(viewYear + 1);
      setViewMonth(1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  }

  function handleDateClick(day: number) {
    const month = String(viewMonth).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    onDateSelect(`${viewYear}-${month}-${dayStr}`);
  }

  const blanks = Array.from({ length: startDayOfWeek }, (_, i) => (
    <div key={`blank-${i}`} />
  ));

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const month = String(viewMonth).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateString = `${viewYear}-${month}-${dayStr}`;
    const isToday = dateString === todayString;
    const isSelected = dateString === selectedDate;
    const hasData = calendarData[dateString] !== undefined && calendarData[dateString] > 0;

    return (
      <button
        key={dateString}
        type="button"
        className={`relative flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors ${
          isSelected
            ? 'bg-primary text-primary-foreground'
            : isToday
              ? 'bg-accent font-bold'
              : 'hover:bg-accent'
        }`}
        aria-current={isToday ? 'date' : undefined}
        aria-pressed={isSelected}
        onClick={() => handleDateClick(day)}
      >
        {day}
        {hasData && (
          <span
            data-testid="date-indicator"
            className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary"
          />
        )}
      </button>
    );
  });

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrevMonth}
          aria-label="이전"
        >
          &lt;
        </Button>
        <span className="text-sm font-semibold">
          {viewYear} {MONTH_NAMES[viewMonth - 1]}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextMonth}
          aria-label="다음"
        >
          &gt;
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
        {DAY_LABELS.map((label) => (
          <div key={label} className="flex h-9 items-center justify-center">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {blanks}
        {days}
      </div>
    </div>
  );
}
