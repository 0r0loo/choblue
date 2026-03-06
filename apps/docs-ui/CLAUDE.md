# docs-ui -- 컴포넌트 문서 사이트 로컬 규칙

이 파일은 `apps/docs-ui/` 작업 시 참조하는 규칙이다.
컴포넌트 구현 규칙은 `packages/ui/CLAUDE.md`를 따른다.

---

## 1. 역할

`@choblue/ui` 디자인 시스템의 공개 문서 사이트.
Next.js 15 + Nextra 4 기반, Vercel 배포.

---

## 2. 파일 구조

```
content/
  index.mdx                          -- 메인 페이지
  getting-started.mdx                -- 시작 가이드
  colors.mdx                         -- 색상 시스템
  components/{name}.mdx              -- 컴포넌트별 문서
  design-system/{topic}.mdx          -- 디자인 시스템 개념 문서
src/
  app/layout.tsx                     -- 루트 레이아웃
  app/[[...mdxPath]]/page.tsx        -- Nextra 동적 라우트
  demos/{name}-demo.tsx              -- 인터랙티브 데모 컴포넌트
  demos/preview.tsx                  -- 데모 래퍼 컴포넌트
  globals.css                        -- Tailwind 진입점
mdx-components.tsx                   -- MDX 커스텀 컴포넌트
```

---

## 3. 컴포넌트 문서 작성 컨벤션

### 3-1. MDX 파일 (`content/components/{name}.mdx`)

```mdx
import { DemoA, DemoB } from '../../src/demos/{name}-demo'

# {Name}

설명 한 줄.

## Import

\```tsx
import { Component } from '@choblue/ui/{name}'
\```

## Variants

<DemoA />

| Variant | 설명 |
|---------|------|
| ... | ... |

## Props

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| ... | ... | ... | ... |
```

### 3-2. 데모 컴포넌트 (`src/demos/{name}-demo.tsx`)

```tsx
'use client'

import { Component } from '@choblue/ui/{name}'
import { Preview } from './preview'

export function DemoVariants() {
  return (
    <Preview>
      {/* 컴포넌트 사용 예시 */}
    </Preview>
  )
}
```

### 규칙
- 데모 컴포넌트는 반드시 `'use client'` 선언
- `Preview` 래퍼로 감싸서 일관된 스타일 유지
- 각 섹션(Variants, Sizes, States)별로 개별 데모 함수 export
- MDX에서 데모를 import하여 인라인 렌더링

---

## 4. CSS / Tailwind

`src/globals.css`에서 UI 패키지 소스를 `@source`로 직접 참조:
```css
@import "@choblue/tailwind-config/globals.css";
@source "../../../packages/ui/src/**/*.tsx";
```

---

## 5. 스크립트

| 명령 | 용도 |
|------|------|
| `pnpm dev` | 개발 서버 (Next.js Turbopack) |
| `pnpm build` | 프로덕션 빌드 |

---

## 6. 콘텐츠 작성 가이드

### 언어 및 톤앤매너
- **한국인 개발자 대상** — 설명, 테이블, 코드 주석은 한글
- 문체는 **경어체 ("~입니다", "~합니다")** 통일
- 코드 예시 내 UI 텍스트(placeholder, 버튼, 제목 등)도 한글
- 예시 데이터는 **POS 시스템(카페/음식점)** 맥락 (상품명, ₩ 통화)

### MDX 텍스트 기준

| 항목 | 언어 | 예시 |
|------|------|------|
| 마크다운 설명 | 한글 경어체 | `"모달 대화상자 컴포넌트입니다."` |
| Props 테이블 설명 칼럼 | 한글 | `"제어 모드 열림 상태"` |
| 코드 블록 내 UI 텍스트 | 한글 | `"다이얼로그 열기"`, `"취소"` |
| 코드 블록 내 prop/타입 | 영어 | `variant="primary"`, `string` |
| variant/prop 이름 | 영어 | `Primary`, `sm`, `asChild` |
| import 경로, 컴포넌트명 | 영어 | `@choblue/ui/dialog`, `<Button>` |

### 데모 컴포넌트 텍스트 기준
- Storybook과 동일한 기준 적용 (storybook-ui/CLAUDE.md 5절 참조)
- 데모와 MDX 코드 예시의 텍스트가 **서로 일치**해야 함

### 문서 구조 일관성
- 모든 컴포넌트 문서는 동일한 섹션 순서를 따름: Import → 기본 사용 → Variants → Props
- 새 API(훅 등) 추가 시 기존 문서에 `---` 구분선 후 섹션 추가

---

## 7. Vercel 배포

- `ignoreCommand`로 관련 패키지 변경 시만 빌드 트리거
- 새 컴포넌트 문서 추가 시 별도 커밋 (구현 + 스토리와 분리)