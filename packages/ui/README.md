# @choblue/ui 디자인 시스템

본 패키지는 애플리케이션 전반에서 재사용 가능한 핵심 프레젠테이션 컴포넌트를 제공하는 UI 라이브러리입니다. `React`, `Tailwind CSS v4`, `Radix UI / Floating UI` 기반으로 구축되어 일관된 디자인 톤앤매너와 높은 유지보수성을 지향합니다.

## ✨ 1. 디자인 철학 (Design Philosophy)

### 1) 솔리드 미니멀리즘 (Solid Minimalism)

모호한 반투명(Glassmorphism) 효과를 배제하고 확고한 솔리드(Solid) 텍스처를 지향합니다.

- **True Dark Mode:** 다크 모드에서는 오닉스 블랙(`Onyx Black`, `#000000` / `#12121A`)을 사용하여 극적인 고대비(High Contrast)를 만들어냅니다.
- **명확한 모서리:** 경계가 불분명해지는 현상을 막기 위해 극단적으로 얇은 테두리(`border-black/5`, `dark:border-white/10`)를 적극 사용하여 요소 간의 레이어를 깨끗하게 분리합니다.

### 2) 프리미엄 뎁스(Depth) 구조

평면적인 플랫 디자인을 벗어나 Z축 깊이감을 활용해 컴포넌트에 입체감을 부여합니다.

- 넓고 부드럽게 퍼지는 다층적인 그림자(`--shadow-sm` ~ `--shadow-xl`)를 활용합니다.
- 배경색(Background)과 표면색(Surface)을 구분하여 중요한 정보가 자연스럽게 앞쪽으로 튀어나와 보이게 만듭니다 (Floating Effect).

### 3) 쫀쫀한 마이크로 인터랙션 (Micro-interactions)

모든 조작은 즉각적(Snappy)이고 부드럽게 응답해야 합니다.

- **동적인 햅틱 반응:** 버튼 등 클릭 가능한 요소는 `active:scale-[0.98]`과 같은 햅틱 스케일링을 통해 탄력 있는 피드백을 제공합니다.
- **정교한 트랜지션 제어:** `transition-all` 사용을 지양하고, 브라우저 렌더링 최적화를 위해 상태가 변하는 타겟 속성(`color`, `background-color`, `border-color`, `box-shadow`, `transform`)만을 명시적으로 트랜지션합니다 (`duration-150` ~ `duration-200 ease-apple`).

---

## 🏗️ 2. 컴포넌트 개발 가이드 (Development Guidelines)

새로운 UI 컴포넌트를 추가하거나 기존 컴포넌트를 수정할 때 아래 규칙을 반드시 준수하세요.

### Do (권장)

- ✔️ 시맨틱 토큰(예: `bg-primary`, `text-muted-foreground`)을 우선적으로 사용하여 다크모드가 자동으로 완벽하게 대응되도록 합니다.
- ✔️ 컴포넌트 변형(Variant) 관리는 항상 `class-variance-authority` (cva)와 `cn` 유틸리티 함수를 이용합니다.
- ✔️ 마이크로 애니메이션 타이밍은 글로벌 CSS 변수에 정의된 `--ease-apple`, `--ease-spring`을 사용하여 제품 전체에 일관된 템포를 유지합니다.
- ✔️ 성능(Pain/Layout/Composite)을 고려하여 애니메이션 적용 시 `opacity`, `transform` 위주로 사용하거나 명시적인 트랜지션 클래스를 작성합니다.

### Don't (금지)

- ❌ `bg-neutral-100` 형태의 하드 코딩 스케일을 직접 사용하지 마세요. 다크모드 대응 시 예외 처리가 복잡해집니다.
- ❌ 순수 장식형/컨테이너형 컴포넌트(예: 단순 Card)에 무분별하게 `hover:` 등 인터랙션 상태를 넣지 마세요. 인터랙션이 필요한 "Clickable Card"는 확장 컴포넌트로 분리합니다.
- ❌ 픽셀(px) 단위의 마진(Margin)을 하드코딩하지 않습니다. 간격(Spacing) 스케일(`p-4`, `gap-2`)을 이용하여 일관성을 지킵니다.
- ❌ `transition-all`은 남용 시 성능 저하를 유발하므로 특수한 예외가 아니면 사용을 금합니다.

---

## 🎨 3. 토큰 구조화 (Token Structure)

현재 테마를 구성하는 주요 뼈대입니다 (`@choblue/tailwind-config`).

- **색상 팔레트:** `Neutral`, `Primary` (보라색 계열 베이스), `Success`, `Info`, `Warning`, `Danger`
- **시맨틱 매핑 대상:**
  - `background`, `foreground`: 전체 화면 배경 및 기본 텍스트
  - `surface`: 배경 위로 올라오는 카드, 모달 등
  - `muted`, `muted-foreground`: 비활성화, 부가 정보
  - `border`, `ring`, `input`: 테두리, 포커스, 폼 컨트롤
- **접근성(a11y):** 포커스 링은 `focus-visible:` 패턴과 은은한 글로우(`ring-[3px] ring-primary/20`) 스타일을 조합하여 시각적 디자인과 키보드 조작 접근성을 모두 충족시킵니다.

---

컴포넌트 로드맵은 [ROADMAP.md](./ROADMAP.md)를 참고하세요.
