# Lunch App - Complete Data Model Analysis

## Summary
The lunch app is a workplace meal coordination system with entities for workspaces, members, lunch posts (meal gathering announcements), participation tracking, and reviews.

---

## ENTITY DEFINITIONS

### 1. WORKSPACE
**File**: `/Users/chotaegyu/study/side-project/apps/lunch-api/src/entities/workspace.entity.ts`

**Columns**:
- `id` (UUID, PK) - Primary Key
- `name` (VARCHAR 100) - Workspace name
- `slug` (VARCHAR, unique) - URL-friendly identifier
- `inviteCode` (VARCHAR, unique) - Code for member invitations
- `adminToken` (VARCHAR) - Admin authentication token
- `description` (VARCHAR, nullable) - Optional description
- `createdAt` (TIMESTAMP) - Creation timestamp
- `updatedAt` (TIMESTAMP) - Last update timestamp

**Relations**:
- `1:N` → Members (OneToMany)
- `1:N` → LunchPosts (OneToMany)

**Unique Constraints**:
- `slug` (unique)
- `inviteCode` (unique)

---

### 2. MEMBER
**File**: `/Users/chotaegyu/study/side-project/apps/lunch-api/src/entities/member.entity.ts`

**Columns**:
- `id` (UUID, PK) - Primary Key
- `nickname` (VARCHAR 50) - Display name
- `cookieToken` (VARCHAR, unique) - Authentication token
- `role` (ENUM: ADMIN | MEMBER, default: MEMBER) - User role
- `workspaceId` (UUID, FK) - Foreign Key to Workspace
- `createdAt` (TIMESTAMP) - Joined timestamp
- `updatedAt` (TIMESTAMP) - Last update timestamp

**Relations**:
- `N:1` ← Workspace (ManyToOne, CASCADE delete)
- `1:N` → LunchPosts as author (OneToMany)
- `1:N` → Participations (OneToMany)
- `1:N` → Reviews (OneToMany)

**Unique Constraints**:
- `cookieToken` (unique)

**Enum**:
```typescript
enum MemberRole {
  ADMIN = 'admin',
  MEMBER = 'member',
}
```

---

### 3. LUNCH_POST
**File**: `/Users/chotaegyu/study/side-project/apps/lunch-api/src/entities/lunch-post.entity.ts`

**Columns**:
- `id` (UUID, PK) - Primary Key
- `menu` (VARCHAR 100, NOT NULL) - Menu/meal description
- `restaurant` (VARCHAR, nullable) - Restaurant/location name
- `date` (DATE) - Date of the meal
- `time` (TIME) - Time of the meal
- `maxParticipants` (INT) - Maximum number of participants
- `status` (ENUM: OPEN | CLOSED, default: OPEN) - Post status
- `isDeleted` (BOOLEAN, default: false) - Soft delete flag
- `workspaceId` (UUID, FK) - Foreign Key to Workspace
- `authorId` (UUID, FK) - Foreign Key to Member (creator)
- `createdAt` (TIMESTAMP) - Creation timestamp
- `updatedAt` (TIMESTAMP) - Last update timestamp

**Relations**:
- `N:1` ← Workspace (ManyToOne, CASCADE delete)
- `N:1` ← Member as author (ManyToOne, CASCADE delete)
- `1:N` → Participations (OneToMany)
- `1:N` → Reviews (OneToMany)

**Enum**:
```typescript
enum LunchPostStatus {
  OPEN = 'open',
  CLOSED = 'closed',
}
```

**Key Fields for Refactoring Context**:
- `menu` (string) - What they're eating (free text)
- `restaurant` (string | null) - Where they're eating (optional, free text)

---

### 4. PARTICIPATION
**File**: `/Users/chotaegyu/study/side-project/apps/lunch-api/src/entities/participation.entity.ts`

**Columns**:
- `id` (UUID, PK) - Primary Key
- `lunchPostId` (UUID, FK) - Foreign Key to LunchPost
- `memberId` (UUID, FK) - Foreign Key to Member
- `createdAt` (TIMESTAMP) - Join timestamp

**Relations**:
- `N:1` ← LunchPost (ManyToOne, CASCADE delete)
- `N:1` ← Member (ManyToOne, CASCADE delete)

**Unique Constraints**:
- Composite unique on (`lunchPostId`, `memberId`) - One member per post

**Purpose**: Join table tracking who participated in which lunch post.

---

### 5. REVIEW
**File**: `/Users/chotaegyu/study/side-project/apps/lunch-api/src/entities/review.entity.ts`

**Columns**:
- `id` (UUID, PK) - Primary Key
- `lunchPostId` (UUID, FK) - Foreign Key to LunchPost
- `memberId` (UUID, FK) - Foreign Key to Member
- `tasteRating` (INT) - Taste/flavor rating
- `portionRating` (INT) - Portion/quantity rating
- `restaurant` (VARCHAR 100, NOT NULL) - Restaurant name (from review)
- `menu` (VARCHAR 100, NOT NULL) - Menu/dish name (from review)
- `content` (VARCHAR 200, nullable) - Optional comment/review text
- `createdAt` (TIMESTAMP) - Review creation timestamp
- `updatedAt` (TIMESTAMP) - Last review update timestamp

**Relations**:
- `N:1` ← LunchPost (ManyToOne, CASCADE delete)
- `N:1` ← Member (ManyToOne, CASCADE delete)

**Unique Constraints**:
- Composite unique on (`lunchPostId`, `memberId`) - One review per participant per post

**Key Fields for Refactoring Context**:
- `restaurant` (string, NOT NULL) - What restaurant was visited (potentially different from LunchPost.restaurant)
- `menu` (string, NOT NULL) - What was ordered/eaten (potentially different from LunchPost.menu)

---

## DATA FLOW: "RESTAURANT" AND "MENU" STRINGS

### POST CREATION FLOW
```
User creates LunchPost via POST /workspaces/:id/posts
├─ CreateLunchPostDto
│  ├─ menu (required, string, max 100) ← Where are we going + what time
│  ├─ restaurant (optional, string) ← Location/place (optional)
│  ├─ date (required)
│  ├─ time (required)
│  └─ maxParticipants (required)
└─ Saved to LunchPost entity
   ├─ menu: string ← As provided
   ├─ restaurant: string | null ← As provided (can be null)
   └─ author participates automatically (Participation created)
```

### REVIEW CREATION FLOW
```
User creates Review via POST /posts/:id/reviews
├─ CreateReviewDto
│  ├─ restaurant (required, string, max 100) ← Where they actually went
│  ├─ menu (required, string, max 100) ← What they actually ate
│  ├─ tasteRating (required, 1-5)
│  ├─ portionRating (required, 1-5)
│  └─ content (optional, string, max 200)
└─ Saved to Review entity
   ├─ restaurant: string ← As provided (REQUIRED, NOT NULL)
   ├─ menu: string ← As provided (REQUIRED, NOT NULL)
   ├─ Linked to LunchPost.id ← Constrains review to specific post
   └─ Linked to Member.id ← Tracks who reviewed

PRECONDITIONS:
- LunchPost.status === CLOSED (must be closed)
- User must have Participation for this LunchPost
- User cannot review twice (unique constraint)
```

### MENU HISTORY QUERY
```
ReviewService.getMenuHistory(workspaceId, filters)
├─ JOINs: Review ← LunchPost, Member
├─ Returns:
│  ├─ review.restaurant (VARCHAR 100)
│  ├─ review.menu (VARCHAR 100)
│  ├─ review.tasteRating (INT)
│  ├─ review.portionRating (INT)
│  ├─ lunchPost.date (DATE)
│  └─ member.nickname (VARCHAR 50)
├─ Filters:
│  ├─ date range (lunchPost.date >= dateFrom, <= dateTo)
│  ├─ search text (review.menu ILIKE, review.restaurant ILIKE)
│  └─ workspaceId (lunchPost.workspaceId)
└─ Order: lunchPost.date DESC
```

---

## CRITICAL OBSERVATIONS FOR REFACTORING

### 1. SEPARATION OF CONCERNS
- **LunchPost**: Contains the planned/announced menu & restaurant (user's intention)
- **Review**: Contains the actual experienced menu & restaurant (reality check)
  - These can DIFFER from LunchPost values
  - Example: Planned "Korean BBQ at Lotte", but actually went to "Samgyeopsal House" and ate "ribeye"

### 2. RESTAURANT/MENU DUPLICATION
- `LunchPost.menu` + `LunchPost.restaurant` → what was planned
- `Review.menu` + `Review.restaurant` → what actually happened
- Both are **independent freetext fields** with no foreign key constraints
- No master restaurant/menu table exists

### 3. REVIEW UNIQUENESS
- Composite unique constraint on (`lunchPostId`, `memberId`)
- This prevents multiple reviews per person per post
- Reviews are tied to specific posts, not universally

### 4. DELETION BEHAVIOR
- All CASCADE on foreign keys
- Soft delete via `isDeleted` flag on LunchPost (hard delete on Review)
- When LunchPost deleted, all Participations & Reviews cascade delete

### 5. API ENDPOINTS USING RESTAURANT/MENU
- **LunchPost**:
  - `POST /workspaces/:id/posts` → Create with menu + optional restaurant
  - `PATCH /posts/:id` → Update menu/restaurant
  - `GET /posts/:id` → Returns post with menu + restaurant
- **Review**:
  - `POST /posts/:id/reviews` → Create with required restaurant + menu
  - `PATCH /reviews/:id` → Update restaurant/menu/ratings
  - `GET /posts/:id/reviews` → Lists all reviews for a post
  - `GET /workspaces/:id/menu-history` → Lists restaurant+menu from reviews with filters

---

## DATABASE CONFIGURATION

**TypeORM Setup** (app.module.ts):
- Type: PostgreSQL
- Synchronize: `true` (in non-production)
- Entities: Auto-discovered from `/entities/*.entity.ts`
- No explicit migrations (relies on synchronize)

---

## ENTITY RELATIONSHIPS DIAGRAM

```
Workspace (1)
  ├─ (1:N) Members
  │  ├─ (1:N) LunchPosts (as author)
  │  └─ (1:N) Participations
  │
  └─ (1:N) LunchPosts
     ├─ (1:N) Participations
     └─ (1:N) Reviews

Participation:
  N:1 ← LunchPost
  N:1 ← Member
  Unique(lunchPostId, memberId)

Review:
  N:1 ← LunchPost
  N:1 ← Member
  Unique(lunchPostId, memberId)
```

---

## SUMMARY TABLE

| Entity | PK | Parent FKs | Child Relations | Key Fields |
|--------|----|-----------|----|--------------|
| **Workspace** | UUID | - | Member(1:N), LunchPost(1:N) | name, slug, inviteCode |
| **Member** | UUID | workspaceId | LunchPost(1:N), Participation(1:N), Review(1:N) | nickname, cookieToken, role |
| **LunchPost** | UUID | workspaceId, authorId | Participation(1:N), Review(1:N) | **menu**, **restaurant**, date, time, status |
| **Participation** | UUID | lunchPostId, memberId | - | - |
| **Review** | UUID | lunchPostId, memberId | - | **restaurant**, **menu**, tasteRating, portionRating, content |