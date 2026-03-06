# @choblue/ui

React + Tailwind CSS v4 + Radix UI 기반 UI 컴포넌트 라이브러리.
`@choblue` 모노레포 내 앱들이 공유하는 디자인 시스템이다.

## 디자인 방향

**솔리드 미니멀.** 반투명 효과(Glassmorphism) 없이 깔끔한 솔리드 톤을 쓴다.

- 다크모드는 오닉스 블랙(`#000000` / `#12121A`) 베이스로 고대비 유지
- 요소 간 구분은 얇은 테두리(`border-black/5`, `dark:border-white/10`)로 처리
- 배경(Background)과 표면(Surface)을 분리해서 카드/모달이 자연스럽게 떠 보이게
- 그림자는 `--shadow-sm` ~ `--shadow-xl` 다층 구조
- 클릭 요소에 `active:scale-[0.98]` 같은 미세한 스케일링으로 피드백
- `transition-all` 금지. 변경되는 속성만 명시적으로 트랜지션

## 컴포넌트 추가/수정 규칙

### 해야 할 것

- 시맨틱 토큰(`bg-primary`, `text-muted-foreground` 등) 우선 사용 → 다크모드 자동 대응
- variant 관리는 CVA + `cn()` 유틸
- 애니메이션 타이밍은 `--ease-apple`, `--ease-spring` 사용
- 애니메이션은 `opacity`, `transform` 위주 (렌더링 성능)

### 하지 말 것

- `bg-neutral-100` 같은 하드코딩 스케일 직접 사용 (다크모드 깨짐)
- 단순 컨테이너(Card 등)에 `hover:` 넣기 (클릭 가능한 건 별도 컴포넌트로)
- `px` 마진 하드코딩 (`p-4`, `gap-2` 같은 스페이싱 스케일 사용)
- `transition-all` 남용

## 토큰 구조

테마는 `@choblue/tailwind-config`에서 관리한다.

- **팔레트**: Neutral, Primary(보라), Success, Info, Warning, Danger
- **시맨틱 토큰**: background, foreground, surface, muted, border, ring, input
- **포커스 링**: `focus-visible:` + `ring-[3px] ring-primary/20` 조합

## 컴포넌트 구조

```
src/components/{name}/
├── {name}.tsx          # 구현 (CVA 패턴)
├── {name}.test.tsx     # 테스트
└── index.ts            # barrel export
```

로드맵은 [ROADMAP.md](./ROADMAP.md) 참고.