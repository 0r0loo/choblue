# 점심 모집 앱 개발 계획

## Context
기존 @choblue 모노레포에 점심 모집 앱을 추가한다.
회사에서 점심 같이 먹을 사람을 모집하는 서비스.
MVP: 로그인 없이 초대 링크 + 닉네임으로 즉시 사용.
기획 문서: `docs/lunch/`

## 구조
```
apps/lunch/        — React SPA (Vite + TanStack Router, 모바일 웹 우선)
apps/lunch-api/    — NestJS API (TypeORM + PostgreSQL)
```

## 기술 스택
- **프론트**: React 19, Vite, TanStack Router, TanStack Query, @choblue/ui
- **백엔드**: NestJS, TypeORM, PostgreSQL
- **인증**: Cookie 기반 (httpOnly, UUID token)
- **스타일**: Tailwind CSS v4, @choblue/tailwind-config

---

## Phase 0: 프로젝트 스캐폴딩

### 0-A: apps/lunch/ (Vite + React + TanStack Router)
- `package.json` — react, @tanstack/react-router, @tanstack/react-query, @choblue/ui(workspace:*), @choblue/tailwind-config(workspace:*)
- `vite.config.ts` — @vitejs/plugin-react, @tanstack/router-plugin/vite, @tailwindcss/vite
- `tsconfig.json` — extends @choblue/typescript-config/react-library.json, paths: @/* → ./src/*
- `eslint.config.js` — @choblue/eslint-config/react-internal
- `index.html` — SPA 진입점
- `src/globals.css` — @source 워크어라운드
- `src/main.tsx` — RouterProvider, QueryClientProvider 셋업
- `src/routeTree.gen.ts` — TanStack Router 자동 생성 라우트 트리

### 0-B: apps/lunch-api/ (NestJS)
- `package.json` — @nestjs/core, typeorm, pg, class-validator, cookie-parser
- `tsconfig.json` — emitDecoratorMetadata, experimentalDecorators
- `src/main.ts` — port 4000, CORS, cookie-parser
- `src/app.module.ts` — TypeOrmModule.forRoot(), ConfigModule

### 검증
- `pnpm install` → 두 앱 dev 서버 실행 확인

---

## Phase 1: 백엔드 — DB 엔티티 + 핵심 API

### 엔티티
| 엔티티 | 핵심 필드 |
|--------|----------|
| Workspace | name, slug, description, invite_code, admin_token |
| Member | workspace_id, nickname, cookie_token, role(admin/member) |
| LunchPost | workspace_id, author_id, menu, restaurant, date, time, max_participants, status(open/closed), is_deleted |
| Participation | lunch_post_id, member_id (unique constraint) |

### 인증
- Cookie Guard (lunch_token → Member 조회)
- @CurrentMember(), @CurrentWorkspace() 데코레이터

### API 엔드포인트
| Method | Path | 설명 |
|--------|------|------|
| POST | /workspaces | 워크스페이스 생성 |
| GET | /workspaces/by-invite/:code | 초대 링크 정보 |
| POST | /workspaces/:id/members | 참여 |
| GET | /workspaces/:id | 상세 |
| PATCH | /workspaces/:id | 수정 (관리자) |
| GET | /workspaces/:id/members | 멤버 목록 |
| GET | /workspaces/:id/posts?date= | 날짜별 모집글 |
| GET | /workspaces/:id/posts/calendar | 달력 데이터 |
| POST | /workspaces/:id/posts | 모집글 작성 |
| GET | /posts/:id | 모집글 상세 |
| PATCH | /posts/:id | 수정 (작성자) |
| DELETE | /posts/:id | 삭제 (soft) |
| POST | /posts/:id/close | 마감 |
| POST | /posts/:id/participate | 참여 |
| DELETE | /posts/:id/participate | 참여 취소 |
| PATCH | /members/me | 닉네임 변경 |

### 자동 마감 크론
- @nestjs/schedule, 매분 실행

---

## Phase 2: 프론트엔드 — 레이아웃 + 온보딩

### TanStack Router 파일 구조 (file-based routing)
```
src/routes/
├── __root.tsx                              — 루트 레이아웃
├── index.tsx                               — / 랜딩
├── create.tsx                              — /create 워크스페이스 생성
├── workspaces.tsx                          — /workspaces 선택
└── $slug/
    ├── route.tsx                           — 워크스페이스 레이아웃 (인증 체크)
    ├── index.tsx                           — 메인 (달력 + 피드)
    ├── invite.$inviteCode.tsx              — 초대 참여
    ├── settings.tsx                        — 설정
    ├── profile.tsx                         — 프로필
    └── gatherings/
        ├── new.tsx                         — 모집글 작성
        ├── $gatheringId/
        │   ├── index.tsx                   — 모집글 상세
        │   └── edit.tsx                    — 모집글 수정
```

### 2-A: 앱 셸
- __root.tsx — QueryClientProvider, ToastProvider, 모바일 레이아웃 (max-w-[640px])
- app-header.tsx — sticky 헤더
- api.ts — fetch 래퍼 (credentials: include)

### 2-B~2-E: 랜딩 → 생성 → 초대 → 선택

---

## Phase 3: 프론트엔드 — 핵심 기능

### 3-A: 메인 뷰
- mini-calendar.tsx — 월간 달력 (모집글 있는 날짜에 점)
- post-feed.tsx — TanStack Query로 30초 폴링
- post-card.tsx — @choblue/ui Card + Badge
- fab-button.tsx — 플로팅 "모집하기"

### 3-B: 모집글 상세
- 참여자 목록, 참여/취소 (10초 폴링)
- 작성자 메뉴: 수정, 삭제, 마감 (Dialog)

### 3-C: 모집글 작성/수정
- React Hook Form + Zod
- time-select (30분 단위), participant-stepper (2~10)

### 3-D: 설정 + 3-E: 프로필

---

## Phase 4: 마감 작업
- 에러 핸들링, 로딩 스켈레톤, 빈 상태
- Toast 통합
- Rate Limiting, 입력 소독

---

## 핵심 설계 결정
1. **React SPA (Vite)**: SEO 불필요 (초대 전용), 배포 단순 (정적 파일)
2. **TanStack Router**: 타입 안전 라우팅, file-based routing, 코드 스플리팅 자동
3. **로그인 없음**: cookie_token UUID로 식별
4. **폴링**: 실시간 대신 30초/10초 (단순화)
5. **모바일 우선**: max-w-[640px] 중앙 정렬
6. **@choblue/ui 재사용**: Button, Input, Card, Badge, Dialog, Toast, Select, Textarea

## 참조 파일
- `apps/storybook-ui/package.json` — Vite 앱 설정 패턴 참조
- `apps/storybook-ui/.storybook/main.ts` — Vite + Tailwind 설정 참조
- `packages/typescript-config/react-library.json` — TS 설정
- `packages/eslint-config/react-internal.js` — ESLint 설정
- `packages/tailwind-config/styles/globals.css` — @source 워크어라운드 참조