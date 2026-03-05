import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@choblue/ui/button';
import { Card, CardContent } from '@choblue/ui/card';
import { Input } from '@choblue/ui/input';
import { StarRating } from '@choblue/ui/star-rating';
import { reviewQueries } from '@/lib/queries';
import type { MenuHistoryItem } from '@/types';

export interface MenuHistoryPageProps {
  workspaceId: string;
  onNavigate: (path: string) => void;
}

export function MenuHistoryPage({ workspaceId, onNavigate }: MenuHistoryPageProps) {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [search, setSearch] = useState('');
  const [appliedFilters, setAppliedFilters] = useState<{
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }>({});

  const { data: items = [], isLoading } = useQuery(
    reviewQueries.menuHistory(workspaceId, appliedFilters),
  );

  function handleApplyFilters() {
    setAppliedFilters({
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      search: search || undefined,
    });
  }

  function handleReset() {
    setDateFrom('');
    setDateTo('');
    setSearch('');
    setAppliedFilters({});
  }

  return (
    <div className="flex min-h-screen flex-col items-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate('/')}
            aria-label="뒤로가기"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
          <h2 className="text-xl font-bold">메뉴 기록</h2>
        </div>

        {/* 필터 영역 */}
        <Card>
          <CardContent className="space-y-3 pt-6">
            <div className="space-y-1">
              <label className="text-sm font-medium">검색</label>
              <Input
                placeholder="음식명 또는 식당명"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-sm font-medium">시작일</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">종료일</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleApplyFilters}>검색</Button>
              <Button size="sm" variant="outline" onClick={handleReset}>초기화</Button>
            </div>
          </CardContent>
        </Card>

        {/* 리스트 */}
        {isLoading ? (
          <p className="text-center text-sm text-muted-foreground">불러오는 중...</p>
        ) : items.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">기록이 없습니다.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((item: MenuHistoryItem) => (
              <Card key={item.id}>
                <CardContent className="space-y-1 pt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.restaurant}</span>
                    <span className="text-xs text-muted-foreground">{item.date}</span>
                  </div>
                  <p className="text-sm">{item.menu}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-3 text-xs">
                      <span className="flex items-center gap-1">
                        맛 <StarRating value={item.tasteRating} readOnly size="sm" />
                      </span>
                      <span className="flex items-center gap-1">
                        양 <StarRating value={item.portionRating} readOnly size="sm" />
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">{item.memberNickname}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
