# @choblue/ui 컴포넌트 로드맵

완성된 컴포넌트는 `[x]`, 미구현은 `[ ]`로 표기한다.

---

## 완료

- [x] Button — 5 variants, 4 sizes, active:scale 피드백
- [x] Input — size variants, 글로우 포커스, aria-invalid
- [x] Textarea — Input과 동일한 포커스/사이즈 체계
- [x] Badge — primary(틴티드), secondary, outline, destructive
- [x] Card — 반투명 보더, 레이어드 shadow
- [x] Select — Floating UI 기반, 키보드 내비게이션
- [x] Toast — variant(default/destructive), 자동 dismiss
- [x] Dialog — native `<dialog>`, controlled/uncontrolled

---

## 공통

| 컴포넌트 | 상태 | 비고 |
|----------|------|------|
| Checkbox / Radio | `[ ]` | 커스텀 체크마크, 그룹 지원 |
| Switch | `[ ]` | on/off 토글, 설정 화면용 |
| Tooltip | `[ ]` | Floating UI, 딜레이 제어 |
| Popover | `[ ]` | Floating UI, 포커스 트랩 |
| Avatar | `[ ]` | 이미지 + 이니셜 fallback |
| Dropdown Menu | `[ ]` | 중첩 메뉴, 키보드 지원 |
| Skeleton | `[ ]` | pulse 애니메이션 |

## POS / 서비스

| 컴포넌트 | 상태 | 비고 |
|----------|------|------|
| Tabs | `[ ]` | 언더라인 인디케이터 |
| Accordion | `[ ]` | 단일/다중 열기 모드 |
| Bottom Sheet | `[ ]` | 드래그 제스처, 스냅 포인트 |
| Carousel | `[ ]` | 터치 스와이프, 자동 재생 |
| Progress / Spinner | `[ ]` | 로딩 상태 표시 |

## 어드민

| 컴포넌트 | 상태 | 비고 |
|----------|------|------|
| DataTable | `[ ]` | 정렬, 필터, 페이징, 가로 스크롤 |
| Pagination | `[ ]` | DataTable 연동 |
| DatePicker | `[ ]` | 단일/범위 선택 |
| Breadcrumb | `[ ]` | 라우트 연동 |
| Command Menu | `[ ]` | Cmd+K, 전역 검색 |
| Multi-Select | `[ ]` | 태그 칩 입력 |
| Charts | `[ ]` | Recharts 래핑 |
