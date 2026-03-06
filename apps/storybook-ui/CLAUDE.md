# storybook-ui -- Storybook 로컬 규칙

이 파일은 `apps/storybook-ui/` 작업 시 참조하는 규칙이다.
컴포넌트 구현 규칙은 `packages/ui/CLAUDE.md`를 따른다.

---

## 1. 역할

`@choblue/ui` 컴포넌트의 시각적 검증 및 인터랙션 테스트 환경.
Storybook 10 + React Vite 기반.

---

## 2. 파일 구조

```
src/stories/{Name}.stories.tsx   -- 컴포넌트 스토리
src/globals.css                  -- Tailwind 진입점 (@source 포함)
.storybook/main.ts               -- Storybook 설정
.storybook/preview.ts            -- 글로벌 데코레이터, 테마
```

---

## 3. 스토리 작성 컨벤션

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Component } from "@choblue/ui/{name}";

const meta = {
  title: "UI/{Name}",
  component: Component,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: { /* controls */ },
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof meta>;
```

### 규칙
- `title`은 반드시 `"UI/{Name}"` 형식
- `tags: ["autodocs"]` 필수
- 각 variant/size/state별 스토리를 개별 export
- `satisfies Meta<typeof Component>` 타입 보장
- import는 `@choblue/ui/{name}` 경로 사용

---

## 4. CSS / Tailwind

`src/globals.css`에서 UI 패키지 소스를 `@source`로 직접 참조:
```css
@import "@choblue/tailwind-config/globals.css";
@source "../../../packages/ui/src/**/*.tsx";
```
새 패키지 경로 추가 시 이 파일에 `@source` 추가 필요.

---

## 5. 콘텐츠 작성 가이드

### 언어 및 톤앤매너
- **한국인 개발자 대상** 문서 — UI에 표시되는 모든 텍스트는 한글로 작성
- 예시 데이터는 **POS 시스템(카페/음식점)** 맥락 사용 (상품명, ₩ 통화 등)
- variant/prop 이름(Primary, Secondary, `sm`, `md` 등)은 **코드 식별자이므로 영어 유지**

### 스토리 내 텍스트 기준

| 항목 | 언어 | 예시 |
|------|------|------|
| 버튼 텍스트 | 한글 | `"확인"`, `"취소"`, `"삭제"` |
| placeholder | 한글 | `"텍스트를 입력하세요..."` |
| 제목/설명 | 한글 | `"상품 삭제"`, `"이 작업은 되돌릴 수 없습니다."` |
| 예시 데이터 | 한글 + ₩ | `"아메리카노"`, `"₩3,500"` |
| variant/size 라벨 | 영어 | `"Primary"`, `"Secondary"` (prop 값 그대로) |
| prop 값, import 경로 | 영어 | `value="coffee"`, `@choblue/ui/button` |

### 일관성 체크
- 같은 컴포넌트의 스토리 간 텍스트 스타일이 통일되어야 함
- 다크모드에서 텍스트/배경 대비가 정상인지 확인 (autodocs 포함)

---

## 6. 스크립트

| 명령 | 용도 |
|------|------|
| `pnpm storybook` | 개발 서버 (port 6006) |
| `pnpm build-storybook` | 정적 빌드 |
| `pnpm test` | Vitest 브라우저 테스트 |