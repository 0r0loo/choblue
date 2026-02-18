# @choblue/ui 디자인 시스템 컨벤션

## 1. 컴포넌트 구조

### 파일 위치
```
packages/ui/src/
├── lib/
│   └── cn.ts              # clsx + tailwind-merge 유틸리티
├── styles/
│   ├── theme.css           # @theme 디자인 토큰
│   ├── dark-theme.css      # .dark 변수 오버라이드
│   └── globals.css         # 테마 번들 + Pretendard CDN
├── button.tsx              # 컴포넌트 파일 (kebab-case 아님, 단일 단어)
├── text-input.tsx          # 복합 이름은 kebab-case
└── index.ts                # 없음 — barrel export 사용하지 않음
```

### Import 패턴
```tsx
// apps에서 사용
import { Button } from "@choblue/ui/button";
import { TextInput } from "@choblue/ui/text-input";
import { cn } from "@choblue/ui/lib/cn";
```

---

## 2. Props 네이밍 규칙

### 핵심 Props

| Prop | 타입 | 용도 | 예시 |
|------|------|------|------|
| `variant` | string literal union | 시각적 스타일 변형 | `"primary"` `"secondary"` `"outline"` `"ghost"` |
| `size` | string literal union | 크기 | `"sm"` `"md"` `"lg"` |
| `status` | string literal union | 시맨틱 상태 | `"success"` `"warning"` `"error"` `"info"` |
| `className` | `string` | 추가 Tailwind 클래스 | `"mt-4"` |
| `ref` | `React.Ref<T>` | DOM 참조 | React 19 props ref |
| `as` | ElementType | 렌더링 엘리먼트 오버라이드 | `"div"` `"span"` `"a"` |
| `disabled` | `boolean` | 비활성화 상태 | 네이티브 HTML 속성 그대로 |

### variant vs status 구분

```tsx
// variant → 시각적 스타일 (디자인 의도)
<Button variant="primary">저장</Button>
<Button variant="outline">취소</Button>

// status → 시맨틱 상태 (데이터/피드백 의미)
<Input status="error" />
<Badge status="success">완료</Badge>
<Alert status="warning">주의</Alert>

// variant와 status는 동시에 사용 가능
<Badge variant="outline" status="error">실패</Badge>
```

### 금지 패턴
- ❌ `color` prop 사용 금지 → `variant` 또는 `status` 사용
- ❌ `type` prop을 스타일 용도로 사용 금지 → HTML 네이티브 `type`만 허용
- ❌ `isDisabled`, `isLoading` 같은 `is` 접두사 금지 → `disabled`, `loading` 사용
- ❌ boolean variant 금지 → `variant="ghost"` ✅ / `ghost={true}` ❌

---

## 3. 컴포넌트 작성 패턴

### 기본 템플릿

```tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./lib/cn";

// 1. variants 정의
const buttonVariants = cva(
  "기본 클래스들", // base
  {
    variants: {
      variant: {
        primary: "...",
        secondary: "...",
      },
      size: {
        sm: "...",
        md: "...",
        lg: "...",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

// 2. Props 타입 정의
interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  // 추가 커스텀 props
}

// 3. 컴포넌트 (named export, React 19 ref)
function Button({ variant, size, className, ref, ...props }: ButtonProps) {
  return (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

// 4. export
export { Button, buttonVariants };
export type { ButtonProps };
```

### 규칙
- **named export만 사용** (`export default` 금지)
- **`"use client"` 는 이벤트 핸들러가 있을 때만** 추가
- **React.ComponentProps<"element">를 extends** — 네이티브 HTML 속성 자동 상속
- **ref는 props에서 직접 destructure** — React 19 방식, forwardRef 사용하지 않음
- **variants 객체도 export** — 외부에서 스타일 재사용 가능하도록
- **Props 타입도 export** — 래퍼 컴포넌트 작성 시 필요

---

## 4. 스타일링 규칙

### 디자인 토큰 사용
```tsx
// ✅ 시맨틱 토큰 사용
className="bg-background text-foreground border-border"
className="bg-primary text-primary-foreground"
className="text-muted-foreground"

// ❌ 하드코딩 금지
className="bg-white text-black border-gray-200"
className="bg-[#8333FF]"
```

### 컬러 스케일 참조
```tsx
// ✅ 스케일이 필요할 때 토큰 스케일 사용
className="bg-primary-100 text-primary-900"  // 밝은 배경 + 진한 텍스트
className="hover:bg-primary-600"              // hover 시 한 단계 어둡게

// ❌ Tailwind 기본 컬러 사용 금지
className="bg-blue-500"  // → bg-primary-500 사용
className="text-red-600" // → text-danger-600 사용
```

### status별 컬러 매핑
```
success → success-* (초록/민트 계열)
warning → warning-* (오렌지 계열)
error   → danger-*  (빨강 계열)
info    → info-*    (시안 계열)
```

### 반응형 / 상태 클래스 순서
```tsx
// 순서: base → responsive → hover → focus → disabled
className="h-9 px-4 md:h-10 md:px-6 hover:bg-primary/90 focus-visible:ring-2 disabled:opacity-50"
```

---

## 5. 사이즈 시스템

| Size | Height | Padding X | Font Size | 용도 |
|------|--------|-----------|-----------|------|
| `sm` | `h-8` (32px) | `px-3` | `text-xs` | 밀집 UI, 테이블 내부 |
| `md` | `h-9` (36px) | `px-4` | `text-sm` | 기본값 |
| `lg` | `h-10` (40px) | `px-6` | `text-base` | 강조, CTA |
| `icon` | `h-9 w-9` | - | - | 아이콘 전용 버튼 |

---

## 6. 접근성 (a11y) 최소 규칙

- 인터랙티브 요소에 `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring` 필수
- `disabled` 상태에 `disabled:pointer-events-none disabled:opacity-50` 필수
- 아이콘 전용 버튼에 `aria-label` 필수
- 시맨틱 HTML 태그 우선 (`<button>`, `<input>`, `<a>`)

---

## 7. 파일 네이밍

| 대상 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 파일 | kebab-case.tsx | `button.tsx`, `text-input.tsx` |
| 유틸리티 파일 | kebab-case.ts | `cn.ts`, `format-date.ts` |
| CSS 파일 | kebab-case.css | `theme.css`, `dark-theme.css` |
| 컴포넌트 이름 | PascalCase | `Button`, `TextInput` |
| Props 타입 | PascalCase + Props | `ButtonProps`, `TextInputProps` |
| Variants 변수 | camelCase + Variants | `buttonVariants`, `textInputVariants` |