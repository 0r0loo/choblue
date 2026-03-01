/** 한국 공휴일 데이터 */

interface Holiday {
  name: string;
  substitute?: boolean;
}

/** 매년 고정 공휴일 (MM-DD → 이름) */
const FIXED_HOLIDAYS: Record<string, string> = {
  '01-01': '신정',
  '03-01': '삼일절',
  '05-05': '어린이날',
  '06-06': '현충일',
  '08-15': '광복절',
  '10-03': '개천절',
  '10-09': '한글날',
  '12-25': '크리스마스',
};

/** 음력 기반 + 대체공휴일 (연도별, YYYY-MM-DD → 이름) */
const LUNAR_HOLIDAYS: Record<string, Record<string, string>> = {
  '2025': {
    '2025-01-28': '설날 연휴',
    '2025-01-29': '설날',
    '2025-01-30': '설날 연휴',
    '2025-05-05': '부처님오신날',
    '2025-05-06': '대체공휴일',
    '2025-10-05': '추석 연휴',
    '2025-10-06': '추석',
    '2025-10-07': '추석 연휴',
    '2025-10-08': '대체공휴일',
  },
  '2026': {
    '2026-02-15': '설날 연휴',
    '2026-02-16': '설날 연휴',
    '2026-02-17': '설날',
    '2026-02-18': '대체공휴일',
    '2026-03-02': '대체공휴일',
    '2026-05-24': '부처님오신날',
    '2026-09-24': '추석 연휴',
    '2026-09-25': '추석',
    '2026-09-26': '추석 연휴',
  },
  '2027': {
    '2027-02-05': '설날 연휴',
    '2027-02-06': '설날',
    '2027-02-07': '설날 연휴',
    '2027-02-08': '대체공휴일',
    '2027-05-13': '부처님오신날',
    '2027-06-07': '대체공휴일',
    '2027-08-16': '대체공휴일',
    '2027-09-14': '추석 연휴',
    '2027-09-15': '추석',
    '2027-09-16': '추석 연휴',
    '2027-10-04': '대체공휴일',
    '2027-10-11': '대체공휴일',
  },
};

/**
 * 해당 월의 공휴일을 반환한다.
 * @param month "YYYY-MM" 형식
 * @returns Record<"YYYY-MM-DD", Holiday>
 */
export function getHolidaysForMonth(month: string): Record<string, Holiday> {
  const [year, mon] = month.split('-');
  const mmPart = mon.padStart(2, '0');
  const result: Record<string, Holiday> = {};

  // 고정 공휴일
  for (const [mmdd, name] of Object.entries(FIXED_HOLIDAYS)) {
    if (mmdd.startsWith(mmPart)) {
      result[`${year}-${mmdd}`] = { name };
    }
  }

  // 음력 기반 공휴일
  const lunarForYear = LUNAR_HOLIDAYS[year];
  if (lunarForYear) {
    for (const [date, name] of Object.entries(lunarForYear)) {
      if (date.startsWith(`${year}-${mmPart}`)) {
        result[date] = { name, substitute: name === '대체공휴일' };
      }
    }
  }

  return result;
}
