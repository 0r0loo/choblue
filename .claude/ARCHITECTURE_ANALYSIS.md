# Lunch App - Architectural Analysis Report

**Generated**: 2026-03-02
**Scope**: Data model, service layer, API design, frontend architecture
**Purpose**: Identify blocking issues for extensibility (menu recommendations, restaurant analysis, analytics)

---

## Executive Summary

**Risk Level**: HIGH - Multiple architectural issues will significantly impede analytics and recommendation features.

### Critical Blockers (Must Fix)
1. **Restaurant & Menu as Strings** (not entities) - blocks restaurant aggregation and analysis
2. **No Rating Dimension Decoupling** - both taste and portion ratings lumped together, limits granular analytics
3. **Review Data Trapped in Flat Query Results** - no aggregation/statistics layer exists
4. **Duplicated Star Rating Components** - 3 separate implementations across pages
5. **No Shared Validation/Query Layer** - business logic scattered across services
6. **Missing Analytics/Reporting APIs** - backend has no stats endpoints

### High-Impact Issues (Should Fix Before Major Features)
- No repository pattern (direct repository injection in services)
- Validation hardcoded in services vs. DTOs
- Manual raw SQL queries for analytics without type safety
- Frontend mutating form state in inline event handlers (not reusable)
- No domain abstractions for ratings/preferences

---

## 1. DATA MODEL ISSUES

### 1.1 Restaurant & Menu as Plain Strings (CRITICAL)

**Location**: `/apps/lunch-api/src/entities/review.entity.ts` (lines 32-35)

```typescript
@Column({ type: 'varchar', length: 100 })
restaurant!: string;

@Column({ type: 'varchar', length: 100 })
menu!: string;
```

**Impact on Extensibility**:
- Cannot aggregate reviews by restaurant (no grouping, no statistics)
- Cannot find popular/recommended restaurants
- Cannot analyze restaurant trends over time
- Cannot deduplicate restaurants (e.g., "피자집" vs "Pizza House")
- Recommendation engine has no entity to attach ML features to
- Analytics queries will require string post-processing and deduplication

**Blocking Specific Features**:
- "Menu recommendations based on accumulated data" - needs menu entity with ratings
- "Restaurant analysis" - needs restaurant entity with aggregated stats
- "General data analytics" - needs dimensions to pivot on

**What Needs to Change**:
```typescript
// Restaurant entity (new)
@Entity()
export class Restaurant {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, length: 100 })
  name!: string;

  @Column({ type: 'float', nullable: true })
  avgTasteRating?: number;

  @Column({ type: 'float', nullable: true })
  avgPortionRating?: number;

  @Column({ type: 'int', default: 0 })
  reviewCount!: number;

  @OneToMany(() => Review, r => r.restaurant)
  reviews!: Review[];
}

// Menu entity (new)
@Entity()
export class Menu {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Restaurant, r => r.menus)
  restaurant!: Restaurant;

  @Column({ length: 100 })
  name!: string;

  @Column({ type: 'float', nullable: true })
  avgTasteRating?: number;

  @OneToMany(() => Review, r => r.menu)
  reviews!: Review[];
}

// Updated Review entity
@Entity()
export class Review {
  // ... existing fields ...

  @ManyToOne(() => Restaurant, r => r.reviews)
  restaurant!: Restaurant;

  @ManyToOne(() => Menu, m => m.reviews)
  menu!: Menu;
}
```

**Estimated Impact**: L-tier (affects 4+ files: entities, migrations, services, controllers)

---

### 1.2 Rating Dimensions Not Decoupled (HIGH)

**Location**: `/apps/lunch-api/src/entities/review.entity.ts` (lines 25-29)

```typescript
@Column({ type: 'int' })
tasteRating!: number;

@Column({ type: 'int' })
portionRating!: number;
```

**Current Issue**:
- Both ratings are stored as bare integers with no metadata
- No way to weight ratings (e.g., taste 70%, portion 30%)
- No scaling/normalization for analytics
- If future features need "service rating" or "ambiance rating", schema becomes inconsistent

**Impact on Extensibility**:
- Aggregation queries require hardcoded column references
- No abstraction for "rating types" vs. "rating values"
- Frontend cannot have a reusable "star rating" component with configurable dimensions

**Better Approach**:
```typescript
// Option A: RatingDimension enum
enum RatingDimension {
  TASTE = 'taste',
  PORTION = 'portion',
  SERVICE = 'service',
  AMBIANCE = 'ambiance',
}

// Option B: Separate Rating value object (DDD)
@Embedded()
ratingScores: {
  taste: number;
  portion: number;
  service?: number;
  // extensible
}

// Option C (Recommended for analytics): JSON column with version
@Column({ type: 'jsonb' })
ratings: {
  taste: number;
  portion: number;
  // future: service?: number
}
```

**Current Blocking Issue**:
- Menu history returns `{ tasteRating, portionRating }` as flat object
- Recommendation algorithm cannot distinguish rating importance
- Analytics queries require duplication (one per dimension)

---

### 1.3 Missing Aggregation Data (HIGH)

**Location**: Entities do not track aggregate metrics

**What's Missing**:
```typescript
// Restaurant should track:
avgTasteRating: number       // for sorting recommendations
avgPortionRating: number
totalReviews: number
lastReviewedAt: Date         // for freshness
mostCommonMenu: string       // for analytics

// Menu should track:
avgTasteRating: number
restaurantId: uuid           // explicit relation
firstReviewDate: Date
lastReviewDate: Date
reviewCount: number
```

**Why It Matters**:
- Current: `getMenuHistory()` returns raw reviews; no pre-computed averages
- Limitation: Each recommendation query needs to `GROUP BY` and aggregate (N+1 queries)
- Blocking: Real-time analytics dashboard would be slow without materialized views
- Workaround: Would require background job + caching (added complexity)

---

## 2. SERVICE LAYER ISSUES

### 2.1 Business Logic Validation in Service Layer (MODERATE)

**Location**: `/apps/lunch-api/src/review/review.service.ts` (lines 33-63)

```typescript
// These checks repeat across services:
if (!post || post.isDeleted) {
  throw new NotFoundException('모집글을 찾을 수 없습니다.');
}

if (post.workspaceId !== workspaceId) {
  throw new ForbiddenException('해당 워크스페이스의 모집글이 아닙니다.');
}

if (post.status !== LunchPostStatus.CLOSED) {
  throw new BadRequestException('마감된 모집글에만 리뷰를 작성할 수 있습니다.');
}
```

**Duplication Found**:
- Participation service (114 lines) also validates post status
- Lunch-post service (267 lines) also validates post status
- Workspace service validates member count & uniqueness

**Impact on Extensibility**:
- Adding a new validation rule (e.g., "can only review if participated") requires changes to multiple places
- Easy to introduce inconsistencies (some services check X, others don't)
- Difficult to add analytics (would need its own service with same validation)
- DDD repositories would encapsulate these checks better

**Better Approach**:
```typescript
// Create domain services or repository methods with business logic
export class ReviewPolicies {
  static canCreateReview(post: LunchPost, participation: Participation): void {
    if (!post || post.isDeleted) throw new NotFoundException(...);
    if (post.status !== LunchPostStatus.CLOSED) throw new BadRequestException(...);
    if (!participation) throw new ForbiddenException(...);
  }
}

// Or use custom repositories:
export class ReviewRepository extends Repository<Review> {
  async createByParticipant(postId: string, memberId: string, dto: CreateReviewDto) {
    // validation + creation in one place
  }
}
```

---

### 2.2 Raw SQL Query Without Type Safety (MODERATE)

**Location**: `/apps/lunch-api/src/review/review.service.ts` (lines 173-209)

```typescript
async getMenuHistory(workspaceId: string, filters?: {...}) {
  const qb = this.reviewRepository.createQueryBuilder('review')
    .innerJoin('review.lunchPost', 'lunchPost')
    .innerJoin('review.member', 'member')
    .select([
      'review.id AS id',
      'review.restaurant AS restaurant',
      'review.menu AS menu',
      'review.tasteRating AS "tasteRating"',
      'review.portionRating AS "portionRating"',
      'lunchPost.date AS date',
      'member.nickname AS "memberNickname"',
    ])
    .where('lunchPost.workspaceId = :workspaceId', { workspaceId })
    // ...
  return qb.getRawMany();  // Loses type information
}
```

**Issues**:
1. Raw queries lose TypeORM typing; frontend receives `any`
2. If column names change, query breaks silently
3. No validation on query results
4. Cannot reuse this query logic for analytics
5. The `MenuHistoryItem` interface (types/index.ts line 43) is manually kept in sync

**For Analytics, This Will Become**:
- Need separate query for aggregates: `avgTasteByRestaurant`, `topMenus`, `trendingRestaurants`
- Each becomes a separate `getRaw*()` method
- Maintenance nightmare if schema evolves

**Better Approach**:
```typescript
// Use queryBuilder with selects that map to entities
async getMenuHistory(workspaceId: string, filters?: {...}) {
  const reviews = await this.reviewRepository.find({
    where: { lunchPost: { workspaceId, ...filterWhere } },
    relations: ['member', 'lunchPost'],
    order: { createdAt: 'DESC' },
  });

  // Then transform to DTO
  return reviews.map(r => ({
    id: r.id,
    restaurant: r.restaurant,  // Still string for now
    menu: r.menu,
    tasteRating: r.tasteRating,
    portionRating: r.portionRating,
    date: r.lunchPost.date,
    memberNickname: r.member.nickname,
  }));
}

// Or create database views/materialized views for analytics
// Then map view results to typed objects
```

---

### 2.3 No Analytics/Aggregation Service (CRITICAL GAP)

**Location**: Does not exist

**Current State**:
- Only CRUD services exist (ReviewService, LunchPostService, etc.)
- No service for statistics/aggregation
- No endpoints to get: avg rating by restaurant, top menus, trends, etc.

**Blocking Analytics Features**:
- "Menu recommendations" → needs `GET /workspaces/{id}/analytics/top-menus`
- "Restaurant analysis" → needs `GET /workspaces/{id}/analytics/restaurants`
- "General analytics" → needs dashboard endpoints

**What Needs to Be Created**:
```typescript
@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Review) private reviewRepo: Repository<Review>,
    @InjectRepository(LunchPost) private postRepo: Repository<LunchPost>,
  ) {}

  // Get avg ratings by restaurant
  async getRestaurantStats(workspaceId: string) {
    return this.reviewRepository
      .createQueryBuilder('r')
      .select('r.restaurant', 'name')
      .addSelect('COUNT(r.id)', 'count')
      .addSelect('AVG(r.tasteRating)', 'avgTaste')
      .addSelect('AVG(r.portionRating)', 'avgPortion')
      .where('lunchPost.workspaceId = :id', { id: workspaceId })
      .groupBy('r.restaurant')
      .getRawMany();
  }

  // Get trending menus (last 30 days)
  async getTrendingMenus(workspaceId: string) { ... }

  // Get member preferences
  async getMemberPreferences(memberId: string) { ... }
}

// Add analytics controller
@Controller('/workspaces/:workspaceId/analytics')
export class AnalyticsController {
  @Get('restaurants')
  async getRestaurantStats() { ... }

  @Get('top-menus')
  async getTopMenus() { ... }
}
```

**Estimated Work**: M-tier (1 service + 1 controller + tests)

---

## 3. FRONTEND ARCHITECTURE ISSUES

### 3.1 Duplicated Star Rating Component (HIGH)

**Locations**:
1. `/apps/lunch/src/pages/post-detail.tsx` (lines 275-289, 294-308, 456-470, 475-489)
2. `/apps/lunch/src/pages/review-management.tsx` (lines 167-181, 187-201)
3. `/apps/lunch/src/pages/menu-history.tsx` (lines 108-109)

**Code Duplication**:
```typescript
// post-detail.tsx - CREATE form (lines 456-470)
{[1, 2, 3, 4, 5].map((star) => (
  <button
    key={star}
    type="button"
    className={`text-xl ${
      star <= reviewTasteRating
        ? 'text-yellow-500'
        : 'text-gray-300'
    }`}
    onClick={() => setReviewTasteRating(star)}
  >
    ★
  </button>
))}

// post-detail.tsx - EDIT form (lines 275-289) - IDENTICAL
// review-management.tsx - EDIT form (lines 167-181) - IDENTICAL
// menu-history.tsx - READ-ONLY (lines 108-109) - string repetition
```

**Impact**:
- 3 independent implementations of the same component
- Cannot change styling without updating 3 places
- Cannot add features (accessibility, keyboard nav) to all
- No type safety on rating value
- Frontend tests would need to repeat assertions

**Required Component**:
```typescript
// packages/ui/src/components/star-rating/star-rating.tsx
interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  maxStars?: number;
  name?: string;
}

export function StarRating({
  value,
  onChange,
  readOnly = false,
  maxStars = 5,
  name,
}: StarRatingProps) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: maxStars }).map((_, i) => {
        const star = i + 1;
        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            className={cn(
              'text-xl transition-colors',
              star <= value ? 'text-yellow-500' : 'text-gray-300',
              !readOnly && 'cursor-pointer hover:text-yellow-400',
            )}
            onClick={() => onChange?.(star)}
            aria-label={`${star} stars`}
            name={name}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
```

**Usage**:
```typescript
<div className="space-y-1">
  <label>Taste Rating</label>
  <StarRating value={tasteRating} onChange={setTasteRating} />
</div>

// Read-only
<StarRating value={review.tasteRating} readOnly />
```

**Estimated Work**: S-tier (create component + refactor 3 pages)

---

### 3.2 Duplicated Review Edit Form Logic (HIGH)

**Locations**:
1. `/apps/lunch/src/pages/post-detail.tsx` (lines 234-346)
2. `/apps/lunch/src/pages/review-management.tsx` (lines 158-253)

**Duplication**:
- Same form layout (restaurant, menu, ratings, content)
- Same state management (editTasteRating, editPortionRating, etc.)
- Same mutation logic
- Same error handling

**Better Approach**:
```typescript
// Create reusable ReviewEditForm component
interface ReviewEditFormProps {
  review: Review;
  onSubmit: (data: UpdateReviewDto) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  error?: Error | null;
}

export function ReviewEditForm({
  review,
  onSubmit,
  onCancel,
  isLoading,
  error,
}: ReviewEditFormProps) {
  const [tasteRating, setTasteRating] = useState(review.tasteRating);
  const [portionRating, setPortionRating] = useState(review.portionRating);
  const [restaurant, setRestaurant] = useState(review.restaurant);
  const [menu, setMenu] = useState(review.menu);
  const [content, setContent] = useState(review.content ?? '');

  return (
    <form onSubmit={async (e) => {
      e.preventDefault();
      await onSubmit({ tasteRating, portionRating, restaurant, menu, content });
    }}>
      {/* Form fields */}
    </form>
  );
}
```

**Estimated Work**: S-tier (extract component + update 2 pages)

---

### 3.3 Inline Form State Management (MODERATE)

**Location**: `/apps/lunch/src/pages/post-detail.tsx` (lines 58-68)

```typescript
const [reviewTasteRating, setReviewTasteRating] = useState(5);
const [reviewPortionRating, setReviewPortionRating] = useState(5);
const [reviewRestaurant, setReviewRestaurant] = useState('');
const [reviewMenu, setReviewMenu] = useState('');
const [reviewContent, setReviewContent] = useState('');
const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
const [editTasteRating, setEditTasteRating] = useState(5);
const [editPortionRating, setEditPortionRating] = useState(5);
const [editRestaurant, setEditRestaurant] = useState('');
const [editMenu, setEditMenu] = useState('');
const [editContent, setEditContent] = useState('');
```

**Issues**:
- 11 separate useState hooks for form state (vs. 1 object)
- Difficult to reset form (need to call 11 setters)
- Cannot serialize/deserialize form state easily
- Cannot validate form state as a unit
- Brittle when editing form field names

**Better Approach** (using React Hook Form):
```typescript
import { useForm } from 'react-hook-form';

const { register, watch, reset, formState: { errors } } = useForm<CreateReviewDto>({
  defaultValues: {
    tasteRating: 5,
    portionRating: 5,
    restaurant: '',
    menu: '',
    content: '',
  },
});

// Single reset call
reset();

// Full validation with Zod schema
```

**Estimated Work**: M-tier (setup react-hook-form, update 2-3 pages)

---

## 4. API DESIGN ISSUES

### 4.1 Inconsistent Endpoint Patterns (MODERATE)

**Current Patterns**:
```
POST /posts/:id/reviews              (create review for post)
GET  /posts/:id/reviews              (get reviews for post)
PATCH /reviews/:id                   (update review)
DELETE /reviews/:id                  (delete review)

GET  /workspaces/:workspaceId/reviews        (get workspace reviews)
GET  /workspaces/:workspaceId/menu-history   (get menu history)

GET  /workspaces/:workspaceId/posts?date=    (get posts by date)
GET  /workspaces/:workspaceId/posts/calendar (get calendar)
GET  /posts/:id                              (get post)
POST /posts                                  (create post)
```

**Issues**:
- Mix of `/posts/:id` and `/workspaces/:id/posts` patterns
- Menu history is under reviews, but is really analytics
- No clear separation between resource endpoints and analytics endpoints

**Better Pattern** (RESTful):
```
# Resources
POST   /workspaces/:id/reviews                  (create)
GET    /workspaces/:id/reviews                  (list, with filters)
GET    /workspaces/:id/reviews/:reviewId        (get)
PATCH  /workspaces/:id/reviews/:reviewId        (update)
DELETE /workspaces/:id/reviews/:reviewId        (delete)

# Analytics (separate namespace)
GET    /workspaces/:id/analytics/menu-history   (menu history)
GET    /workspaces/:id/analytics/restaurants    (restaurant stats) - NEW
GET    /workspaces/:id/analytics/top-menus      (trending) - NEW
GET    /workspaces/:id/analytics/recommendations (recs) - NEW
```

**Impact on Extensibility**:
- Adding analytics endpoints becomes natural
- API versioning easier if structure is consistent
- Easier for frontend to predict endpoint URLs
- Cache strategy becomes clearer

---

### 4.2 No Pagination (MODERATE)

**Location**: All list endpoints return full result sets

```typescript
// review.service.ts line 91-95
return this.reviewRepository.find({
  where: { lunchPostId: postId },
  relations: { member: true },
  order: { createdAt: 'DESC' },
  // NO pagination!
});

// review.service.ts line 159-170
const qb = this.reviewRepository
  .createQueryBuilder('review')
  // ...
  .getMany();  // NO limit
```

**Blocking**:
- If workspace has 10,000+ reviews, menu-history endpoint returns all
- Frontend receives massive JSON payload
- No indication of total count
- Analytics queries unscalable

**Impact for Analytics**:
- Cannot paginate analytics results
- Cannot lazy-load trends
- Dashboard would load slowly with large datasets

---

## 5. OVERALL PATTERNS & MISSING ABSTRACTIONS

### 5.1 No Repository Pattern or Abstraction (MODERATE)

**Current State**:
```typescript
// Services inject Repository directly
@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    // ... other repos
  ) {}

  // Direct repository usage
  return this.reviewRepository.find({ ... });
}
```

**Issues**:
- Business logic mixed with data access
- Cannot reuse query logic across services
- Hard to add cross-cutting concerns (caching, logging, audit)
- DDD repository pattern would encapsulate domain logic better

**Better Approach**:
```typescript
// Custom repository with domain logic
@EntityRepository(Review)
export class ReviewRepository extends Repository<Review> {
  async findByPost(postId: string, workspaceId: string): Promise<Review[]> {
    // Validation + query encapsulated
    const post = await this.lunchPostRepository.findOne({ where: { id: postId } });
    if (!post?.workspaceId === workspaceId) throw new ForbiddenException(...);

    return this.find({
      where: { lunchPostId: postId },
      relations: { member: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findMenuHistory(workspaceId: string, filters?: FiltersDto) {
    return this.createQueryBuilder('review')
      .innerJoin('review.lunchPost', 'lunchPost')
      .innerJoin('review.member', 'member')
      .select([...])
      .where('lunchPost.workspaceId = :id', { id: workspaceId })
      .orWhere('review.createdAt > :date', { date: subDays(new Date(), 30) })
      .getRawMany();
  }
}

// Service becomes thin orchestration layer
@Injectable()
export class ReviewService {
  constructor(private readonly reviewRepository: ReviewRepository) {}

  async findByPost(postId: string, workspaceId: string) {
    return this.reviewRepository.findByPost(postId, workspaceId);
  }
}
```

**Estimated Work**: M-tier (refactor service layer)

---

### 5.2 No Validation Layer Abstraction (MODERATE)

**Current State**:
- DTOs have class-validator decorators (good)
- But services repeat validation checks (bad)

**Example** (workspace.service.ts line 31-34):
```typescript
if (dto.name.length < 2 || dto.name.length > 30) {
  throw new BadRequestException('Workspace name must be between 2 and 30 characters');
}
```

This should be in the DTO:
```typescript
export class CreateWorkspaceDto {
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  name!: string;
  // ...
}
```

**Issues**:
- Business validation logic not in DTOs
- Difficult to standardize validation across services
- Analytics service will need its own validation duplications

---

### 5.3 No Audit/Logging for Analytics (MODERATE)

**Missing**:
- Who edited reviews (audit trail)
- When menu preferences changed
- Member behavior tracking

**Needed for**:
- "Recommendation engine" to track cold start (new members)
- Restaurant analytics to show when ratings changed
- Trend analysis

**Minimal Implementation**:
```typescript
@Entity()
export class ReviewAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Review)
  review!: Review;

  @Column({ type: 'enum', enum: ['created', 'updated', 'deleted'] })
  action!: string;

  @Column({ type: 'jsonb' })
  changes!: any;  // old values vs. new values

  @ManyToOne(() => Member)
  changedBy!: Member;

  @CreateDateColumn()
  createdAt!: Date;
}
```

---

## 6. SUMMARY TABLE: BLOCKING ISSUES

| Issue | Tier | Impact | Blocking Feature | Fix Effort | Notes |
|-------|------|--------|-----------------|-----------|-------|
| Restaurant/Menu as strings | L | CRITICAL | Menu rec, Restaurant analysis, Analytics | 2-3 days | Requires DB migration, entity creation, service updates |
| No aggregation metrics | H | HIGH | All analytics | 1-2 days | Denormalization or materialized views |
| Duplicate star rating UI | S | MODERATE | Code quality | 2-3 hours | Extract to reusable component |
| Duplicate review form | S | MODERATE | Code maintainability | 2-3 hours | Extract to reusable component |
| No analytics service/API | L | CRITICAL | Analytics dashboard | 2-3 days | Create AnalyticsService + endpoints |
| Raw SQL queries losing types | M | HIGH | Scalability | 1-2 days | Refactor with QueryBuilder typing |
| Inline form state (11 hooks) | M | MODERATE | Form UX | 1-2 days | Migrate to react-hook-form |
| No pagination | M | MODERATE | Large datasets | 1-2 days | Add pagination to list endpoints |
| Validation in services | S | LOW | Maintainability | Few hours | Move business validation to DTOs |
| No repository pattern | M | MODERATE | Code organization | 1-2 days | Create custom repositories |
| No audit logging | M | MODERATE | Analytics completeness | 1 day | Add audit log entity + middleware |

---

## 7. RECOMMENDED FIX PRIORITY

### Phase 1: Data Model (Prerequisite for Analytics)
1. Create Restaurant entity
2. Create Menu entity (with FK to Restaurant)
3. Update Review to reference entities instead of strings
4. Add aggregate metrics to entities
5. Database migration

**Effort**: L-tier, 2-3 days
**Unblocks**: All analytics features

### Phase 2: Backend APIs
1. Create AnalyticsService
2. Add analytics endpoints
3. Add pagination to list endpoints
4. Refactor raw SQL queries

**Effort**: L-tier, 2-3 days
**Unblocks**: Recommendation engine, Analytics dashboard

### Phase 3: Frontend Cleanup
1. Extract StarRating component
2. Extract ReviewEditForm component
3. Migrate to react-hook-form
4. Update queries to use new APIs

**Effort**: M-tier, 2-3 days
**Unblocks**: Better extensibility, easier feature additions

### Phase 4: Code Quality
1. Implement custom repositories
2. Move validation to DTOs
3. Add audit logging
4. Add caching layer

**Effort**: M-tier, 2-3 days
**Unblocks**: Performance, maintainability

---

## 8. CONCRETE EXAMPLE: How Current Architecture Blocks "Menu Recommendations"

**Goal**: Show user "5 most recommended menus in your workspace"

### With Current Data Model:
```typescript
// Service must do this:
async getTopMenus(workspaceId: string) {
  const reviews = await this.reviewRepository.find({
    where: { lunchPost: { workspaceId } },
    relations: ['member', 'lunchPost'],
  });

  // Manual aggregation (string-based, lossy)
  const menuMap = new Map<string, { count: number; avgTaste: number }>();
  for (const review of reviews) {
    const key = `${review.restaurant}|${review.menu}`;
    if (!menuMap.has(key)) {
      menuMap.set(key, { count: 0, avgTaste: 0 });
    }
    const stats = menuMap.get(key)!;
    stats.count++;
    stats.avgTaste = (stats.avgTaste * (stats.count - 1) + review.tasteRating) / stats.count;
  }

  // Return top 5
  return Array.from(menuMap.entries())
    .sort((a, b) => b[1].avgTaste - a[1].avgTaste)
    .slice(0, 5)
    .map(([key, stats]) => ({
      menu: key.split('|')[1],
      restaurant: key.split('|')[0],
      avgRating: stats.avgTaste,
      count: stats.count,
    }));
}
```

**Problems**:
1. Memory inefficient (loads all reviews)
2. Deduplication fragile (typos break grouping)
3. No persistence (recalculated each time)
4. No caching possible
5. Cannot add "filtered by date range" easily
6. Cannot add "by member preference" without full refactor

### With Proper Data Model:
```typescript
@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Menu) private menuRepo: Repository<Menu>,
  ) {}

  async getTopMenus(workspaceId: string, limit = 5) {
    return this.menuRepo
      .createQueryBuilder('menu')
      .leftJoinAndSelect('menu.restaurant', 'restaurant')
      .leftJoinAndSelect('menu.reviews', 'review')
      .leftJoin('review.lunchPost', 'post')
      .where('post.workspaceId = :id', { id: workspaceId })
      .addSelect('AVG(review.tasteRating)', 'avgTaste')
      .addSelect('COUNT(review.id)', 'reviewCount')
      .groupBy('menu.id')
      .groupBy('restaurant.id')
      .orderBy('avgTaste', 'DESC')
      .limit(limit)
      .getRawMany();
  }
}
```

**Benefits**:
1. One database query
2. Database handles aggregation (efficient)
3. Can add filters (date range, rating threshold) in SQL
4. Can cache result
5. Scalable to 10K+ reviews
6. Can later add materialized views if needed

---

## 9. ADDITIONAL NOTES

### Quick Wins (Implement First)
1. Extract StarRating component (2 hours)
2. Extract ReviewEditForm (2 hours)
3. Add pagination (4 hours)
4. Move validation to DTOs (2 hours)

**Total**: ~10 hours, immediate code quality improvement

### Medium-Term Work (Next Sprint)
1. Create Restaurant + Menu entities
2. Create AnalyticsService + endpoints
3. Migrate frontend to use new APIs
4. Migrate form state to react-hook-form

**Total**: ~1 week, unblocks analytics features

### Long-Term Improvements
1. Implement repository pattern
2. Add audit logging
3. Add caching layer (Redis)
4. Add materialized views for expensive aggregations

---

## Conclusion

The lunch app's current architecture will **significantly impede** the three requested features:

- **Menu Recommendations**: Cannot aggregate menu data without entities
- **Restaurant Analysis**: Cannot track restaurant metrics without entity
- **General Analytics**: No analytics service, no proper aggregation layer, no pagination

**Critical blocker**: Restaurant and Menu as strings. This must be fixed first.

**Recommended approach**:
1. Fix data model (Phase 1)
2. Create analytics layer (Phase 2)
3. Refactor frontend components (Phase 3)
4. Improve code quality (Phase 4)

Each phase is a clean L or M-tier task that builds on previous phases.