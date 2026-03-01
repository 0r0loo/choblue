import { useMemo, useState } from 'react';
import { Button } from '@choblue/ui/button';
import type { CalendarPost } from '@/types';
import { getHolidaysForMonth } from '@/lib/holidays';

export interface MiniCalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  onPostClick?: (postId: string) => void;
  calendarData?: Record<string, CalendarPost[]>;
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

export function MiniCalendar({ selectedDate, onDateSelect, onPostClick, calendarData = {} }: MiniCalendarProps) {
  const parsed = parseDate(selectedDate);
  const [viewYear, setViewYear] = useState(parsed.year);
  const [viewMonth, setViewMonth] = useState(parsed.month);

  const todayString = toDateString(new Date());
  const monthKey = `${viewYear}-${String(viewMonth).padStart(2, '0')}`;
  const holidays = useMemo(() => getHolidaysForMonth(monthKey), [monthKey]);

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
    <div key={`blank-${i}`} className="min-h-[72px]" />
  ));

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const month = String(viewMonth).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateString = `${viewYear}-${month}-${dayStr}`;
    const isToday = dateString === todayString;
    const isSelected = dateString === selectedDate;
    const posts = calendarData[dateString] ?? [];
    const holiday = holidays[dateString];
    const dayOfWeek = new Date(viewYear, viewMonth - 1, day).getDay();
    const isSunday = dayOfWeek === 0;
    const isHoliday = !!holiday;
    const isRedDay = isSunday || isHoliday;

    return (
      <div
        key={dateString}
        className={`relative flex min-h-[72px] flex-col rounded-lg border p-1 text-xs transition-colors cursor-pointer ${
          isSelected
            ? 'border-primary bg-primary/10'
            : isToday
              ? 'border-accent bg-accent/50'
              : 'border-transparent hover:bg-accent/30'
        }`}
        onClick={() => handleDateClick(day)}
        role="button"
        tabIndex={0}
        aria-current={isToday ? 'date' : undefined}
        aria-pressed={isSelected}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleDateClick(day);
          }
        }}
      >
        <span className={`mb-0.5 text-[11px] leading-none ${
          isSelected ? 'font-bold text-primary' : isRedDay ? 'font-bold text-red-500' : isToday ? 'font-bold' : ''
        }`}>
          {day}
        </span>
        {isHoliday && (
          <span className="truncate text-[9px] leading-none text-red-400">
            {holiday.name}
          </span>
        )}
        <div className="flex flex-col gap-0.5 overflow-hidden">
          {posts.slice(0, 2).map((post) => (
            <button
              key={post.id}
              type="button"
              className="w-full truncate rounded bg-primary/15 px-1 py-0.5 text-left text-[10px] leading-tight text-primary hover:bg-primary/25 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onPostClick?.(post.id);
              }}
            >
              {post.menu}({post.participantCount}/{post.maxParticipants})
            </button>
          ))}
          {posts.length > 2 && (
            <span className="text-[10px] text-muted-foreground leading-tight">
              +{posts.length - 2}
            </span>
          )}
        </div>
      </div>
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
        {DAY_LABELS.map((label, idx) => (
          <div key={label} className={`flex h-6 items-center justify-center ${idx === 0 ? 'text-red-500' : ''}`}>
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
