# Restaurant 엔티티 분리 + 메뉴 기록 개선

## Context

현재 LunchPost에 `restaurant: varchar (nullable)` 필드가 단순 텍스트로 존재.
사용자가 원하는 것:
- **식당 정보 정규화**: 이름, 카테고리(한식/중식/...), 네이버 지도 링크
- **재사용**: 모집글 작성 시 기존 식당 선택 OR 신규 식당 등록
- **메뉴 기록**: 모집글(LunchPost) 기준으로 날짜별 식당/메뉴 이력 조회 (현재는 리뷰 테이블에서만 가져와서 빈 화면)

---

## 설계

### Restaurant Entity (신규)
```
Restaurant
├── id: uuid (PK)
├── name: varchar(100), NOT NULL
├── category: enum (KOREAN, CHINESE, JAPANESE, WESTERN, SNACK, CAFE, OTHER)
├── mapLink: varchar(500), nullable (네이버 지도 URL)
├── workspaceId: uuid (FK → Workspace)
├── createdAt: timestamp
└── ManyToOne → Workspace
```
- 워크스페이스 단위로 식당 관리 (A팀의 식당 목록 ≠ B팀)
- `@Unique(['name', 'workspaceId'])` — 같은 워크스페이스에서 식당명 중복 방지

### LunchPost 변경
- `restaurant: varchar (nullable)` → `restaurantId: uuid (nullable, FK → Restaurant)`
- `@ManyToOne(() => Restaurant)` 관계 추가
- 식당 없이도 모집 가능 (기존 동작 유지)

### 카테고리 enum
```typescript
enum RestaurantCategory {
  KOREAN = 'korean',    // 한식
  CHINESE = 'chinese',  // 중식
  JAPANESE = 'japanese', // 일식
  WESTERN = 'western',  // 양식
  SNACK = 'snack',      // 분식
  CAFE = 'cafe',        // 카페/디저트
  OTHER = 'other',      // 기타
}
```

### 모집글 작성 UX 플로우
1. 식당 선택 드롭다운: 워크스페이스의 기존 식당 목록 + "신규 식당" 옵션 + "선택 안 함"
2. 기존 식당 선택 → `restaurantId` 전달
3. "신규 식당" 선택 → 이름/카테고리/지도링크 입력 폼 노출 → FE가 먼저 `POST /restaurants` → 반환된 ID로 모집글 생성
4. "선택 안 함" → `restaurantId` 없이 생성

### 메뉴 기록 변경
- **데이터 소스**: Review 테이블 → **LunchPost + Restaurant** JOIN
- **조건**: `status = 'closed'`, `isDeleted = false`
- **표시 항목**: 날짜 | 식당명 | 카테고리 | 메뉴 | 참여자 수 | 지도 링크

---

## 구현 단위 (BE 선행 → FE 후행)

### Step 1: Restaurant Entity + Module (BE, 파일 3개)

**`apps/lunch-api/src/entities/restaurant.entity.ts`** (신규)
- RestaurantCategory enum + Restaurant entity

**`apps/lunch-api/src/restaurant/restaurant.service.ts`** (신규)
- `create(dto, workspaceId)` — 이름 중복 체크 후 생성
- `findByWorkspace(workspaceId)` — 워크스페이스 식당 목록 (이름순)

**`apps/lunch-api/src/restaurant/restaurant.controller.ts`** (신규)
- `POST /workspaces/:workspaceId/restaurants` — 신규 식당 등록
- `GET /workspaces/:workspaceId/restaurants` — 식당 목록 조회

**`apps/lunch-api/src/restaurant/dto/create-restaurant.dto.ts`** (신규)
- `name: @IsString @Length(1, 100)`
- `category: @IsEnum(RestaurantCategory)`
- `mapLink?: @IsOptional @IsUrl`

**`apps/lunch-api/src/restaurant/restaurant.module.ts`** (신규)
- TypeOrmModule.forFeature([Restaurant])

**`apps/lunch-api/src/app.module.ts`**
- RestaurantModule import 추가

### Step 2: LunchPost Entity + DTO 변경 (BE, 파일 3개)

**`apps/lunch-api/src/entities/lunch-post.entity.ts`**
- `restaurant: varchar` 제거 → `restaurantId: uuid (nullable)` 추가
- `@ManyToOne(() => Restaurant)` 관계 추가

**`apps/lunch-api/src/lunch-post/dto/create-lunch-post.dto.ts`**
- `restaurant?: string` → `restaurantId?: @IsOptional @IsUUID`

**`apps/lunch-api/src/lunch-post/dto/update-lunch-post.dto.ts`**
- 동일 변경

### Step 3: LunchPost Service + Controller 업데이트 (BE, 파일 2개)

**`apps/lunch-api/src/lunch-post/lunch-post.service.ts`**
- `create()`: `restaurant` → `restaurantId`
- `update()`: `restaurant` → `restaurantId`
- `findByDate()`, `findOne()`: `relations`에 `restaurant: true` 추가

**`apps/lunch-api/src/lunch-post/lunch-post.module.ts`**
- TypeOrmModule.forFeature에 Restaurant 추가

### Step 4: 메뉴 기록 엔드포인트 변경 (BE, 파일 1개)

**`apps/lunch-api/src/review/review.service.ts`** — `getMenuHistory()` 수정
- Review 기반 쿼리 → LunchPost + Restaurant JOIN 쿼리로 변경
- SELECT: date, restaurant.name, restaurant.category, restaurant.mapLink, menu, participantCount
- WHERE: workspaceId, status = 'closed', isDeleted = false
- 필터: dateFrom, dateTo, search (menu/restaurant.name ILIKE)

또는 이 메서드를 `LunchPostService`로 이동 (더 적절한 위치)

### Step 5: FE 타입 + 쿼리 업데이트 (FE, 파일 3개)

**`apps/lunch/src/types/index.ts`**
- `Restaurant` 타입 추가: `{ id, name, category, mapLink? }`
- `LunchPost.restaurant` → `LunchPost.restaurant: Restaurant | null`
- `MenuHistoryItem` 변경: `{ date, restaurantName, category, mapLink?, menu, participantCount }`

**`apps/lunch/src/lib/query-keys.ts`**
- `restaurantKeys` 추가

**`apps/lunch/src/lib/queries.ts`**
- `restaurantQueries.list(workspaceId)` 추가
- `reviewQueries.menuHistory()` 반환 타입 업데이트

### Step 6: 모집글 생성/수정 폼 (FE, 파일 2개)

**`apps/lunch/src/pages/create-post.tsx`**
- 기존 restaurant 텍스트 입력 → 식당 선택 UI
- 드롭다운: "선택 안 함" | 기존 식당 목록 | "신규 식당 추가"
- 신규 식당 선택 시: 이름, 카테고리 드롭다운, 지도 링크 입력 필드 노출
- 제출 시: 신규면 POST /restaurants 먼저 → restaurantId로 모집글 생성

**`apps/lunch/src/pages/edit-post.tsx`**
- 동일 패턴, 기존 식당 pre-selected

### Step 7: 포스트 카드/상세 + 메뉴 기록 UI (FE, 파일 3개)

**`apps/lunch/src/components/post-card.tsx`**
- `post.restaurant` (string) → `post.restaurant?.name` + 카테고리 뱃지

**`apps/lunch/src/pages/post-detail.tsx`**
- 식당 정보 영역: 이름 + 카테고리 + 지도 링크 (클릭 시 새 탭)

**`apps/lunch/src/pages/menu-history.tsx`**
- MenuHistoryItem 타입 변경 반영
- 카테고리 표시, 지도 링크 버튼 추가

---

## 의존성

```
Step 1 (Restaurant Entity) → Step 2 (LunchPost 변경) → Step 3 (Service/Controller)
                                                         → Step 4 (메뉴 기록 변경)
                                                           ↓
                                                    Step 5 (FE 타입/쿼리)
                                                      ↓        ↓
                                                    Step 6    Step 7
                                                  (폼 변경) (카드/상세/기록)
```

---

## DB 참고

- `synchronize: true` 사용 중
- LunchPost에 기존 restaurant 텍스트 데이터가 있으면 컬럼 drop 시 사라짐
- 개발환경이므로 기존 데이터 유실 허용

---

## 검증

| Step | 검증 명령 |
|------|-----------|
| 1-4 | `cd apps/lunch-api && npx vitest run --reporter=verbose` |
| 5-7 | `cd apps/lunch && npx tsc --noEmit` |
| 전체 | 브라우저: 모집글 작성 시 신규 식당 등록 (이름/카테고리/지도링크) |
| 전체 | 브라우저: 모집글 작성 시 기존 식당 선택 |
| 전체 | 브라우저: 포스트 카드/상세에서 식당 카테고리 + 지도 링크 확인 |
| 전체 | 브라우저: 메뉴 기록 페이지에서 마감된 모집글 기반 데이터 확인 |