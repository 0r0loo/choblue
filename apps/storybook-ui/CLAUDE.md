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

## 5. 스크립트

| 명령 | 용도 |
|------|------|
| `pnpm storybook` | 개발 서버 (port 6006) |
| `pnpm build-storybook` | 정적 빌드 |
| `pnpm test` | Vitest 브라우저 테스트 |