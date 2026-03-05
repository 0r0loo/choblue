# @choblue/ui — 디자인 시스템 로컬 규칙

이 파일은 `packages/ui/` 내 컴포넌트 작업 시 **항상 참조**해야 하는 규칙이다.
일반 패턴(CVA, cn(), 파일 구조)은 `.claude/skills/DesignSystem/SKILL.md`를 따른다.

---

## 1. Surface 계층 (Elevation)

컴포넌트를 만들 때, 해당 컴포넌트가 어느 레벨인지 먼저 판단한다.

| Level | 역할 | 배경 토큰 | 보더 | 그림자 | 라운딩 |
|-------|------|-----------|------|--------|--------|
| **L0** | 페이지 배경 | `bg-background` | — | — | — |
| **L1** | 컨테이너 (Card, Table, Panel) | `bg-card` | `border-border` | `shadow-sm` | `rounded-lg` |
| **L2** | 오버레이 (Dialog, Popover, Toast) | `bg-card` | `border-border` | `shadow-xl` | `rounded-xl` |
| **L3** | 내부 강조 (Table header, Hover, Stripe) | 전용 토큰 사용 | — | — | — |

### 컴포넌트별 토큰 매핑

| 컴포넌트 | Level | 배경 | 보더 | 그림자 | 라운딩 | 비고 |
|----------|-------|------|------|--------|--------|------|
| Card | L1 | `bg-card` | `border-border` | `shadow-sm` | `rounded-lg` | |
| DataTable 컨테이너 | L1 | — | `border-table-border` | `shadow-sm` | `rounded-lg` | |
| DataTable 헤더 | L3 | `bg-table-header` | `border-table-header-border` (하단) | — | — | `text-table-header-foreground` |
| DataTable 행 hover | L3 | `hover:bg-table-row-hover` | — | — | — | |
| Dialog | L2 | `bg-card` | `border-border` | `shadow-xl` | `rounded-xl` | backdrop: `bg-black/50` |
| Toast | L2 | `bg-card` | `border-border` | `shadow-lg` | `rounded-lg` | z-[300] |
| Select Dropdown | L2 | `bg-white dark:bg-neutral-950` | `border-border` | `shadow-md` | `rounded-md` | |
| Input / Textarea | — | `bg-white dark:bg-neutral-950` | `border-input` | `shadow-sm` | `rounded-md` | |
| Button | — | variant별 | — | `shadow-sm` | `rounded-md` | |

**새 컴포넌트 추가 시**: 위 표에서 가장 유사한 컴포넌트를 찾고, 같은 레벨의 토큰을 적용한다.

---

## 2. 테이블 전용 토큰

`theme.css`에 정의된 테이블 시맨틱 토큰:

| 토큰 | Light 값 | Dark 값 | 용도 |
|------|----------|---------|------|
| `table-header` | neutral-100 (`#edf1f7`) | neutral-900 | 헤더 배경 |
| `table-header-foreground` | neutral-700 (`#3b4a63`) | neutral-300 | 헤더 텍스트 |
| `table-row-hover` | neutral-50 (`#f7f9fc`) | neutral-900 | 행 hover 배경 |
| `table-border` | neutral-200 (`#e4e9f2`) | neutral-800 | 행 구분선 |
| `table-header-border` | neutral-300 (`#c5cee0`) | neutral-700 | 헤더-본문 구분선 |

---

## 3. 색상 사용 제약 (접근성)

### 텍스트 안전 기본값 (흰 배경 기준, WCAG AA 4.5:1)

| 팔레트 | 텍스트용 최소 단계 | 배경용 (100~200) |
|--------|-------------------|-----------------|
| Primary | **500** (5.41:1) | 100~200 안전 |
| Success | **600** (6.24:1) | 100~200 안전 |
| Info | **700** (4.60:1) | 100~200 안전 |
| Warning | **700** (4.32:1, 큰텍스트만) | 100~200 안전 |
| Danger | **500** (3.88:1, 큰텍스트만) / **600** (8.14:1) | 100~200 안전 |

### 규칙
- status 뱃지/태그: `bg-{status}-100 text-{status}-{안전단계}` 조합 사용
- 500 단계를 텍스트에 쓸 수 있는 팔레트는 **Primary와 Danger뿐** (나머지는 600~700)
- 아이콘은 큰텍스트 기준(3:1) 적용 가능

### 해결된 이슈
- ~~Danger 500→600 명도 급락~~ → 600을 `#A01108`(L=0.079)로 보정, 부드러운 전이
- ~~Neutral 300→400 간격 불균일~~ → 전체 스케일 재조정, perceptually uniform
- ~~누락 시맨틱 토큰~~ → overlay, disabled, disabled-foreground, popover, popover-foreground 추가

### 남은 이슈
- Success/Info/Warning 500 단계 접근성 미달 (텍스트용으로 600~700 사용 필수)
- sidebar 계열 토큰 미정의 (필요 시 추가)

---

## 4. 새 컴포넌트 스타일 체크리스트

기존 체크리스트(SKILL.md 9절)에 **추가로** 확인할 항목:

- [ ] Surface 계층(L0~L3) 판단 완료
- [ ] 위 토큰 매핑 표에서 유사 컴포넌트와 일관성 확인
- [ ] 사용한 색상 토큰이 접근성 안전 범위 내인지 확인
- [ ] shadow, rounded, border 조합이 같은 레벨 컴포넌트와 동일한지 확인
- [ ] 다크모드에서 사용한 시맨틱 토큰이 dark-theme.css에 정의되어 있는지 확인

---

## 5. 컴포넌트 개발 플로우

새 컴포넌트를 추가하거나 기존 컴포넌트를 수정할 때, 아래 순서를 따른다.

1. **구현** — `packages/ui/src/components/{name}/` 에 컴포넌트 + 테스트 작성
2. **스토리 추가** — `apps/storybook-ui/src/stories/{Name}.stories.tsx` 에 Storybook 스토리 작성 → 시각 검증
3. **커밋** — 구현 + 스토리를 함께 커밋
4. **문서 작성** — `apps/docs-ui/content/` 에 컴포넌트 문서(MDX) 작성 → 별도 커밋