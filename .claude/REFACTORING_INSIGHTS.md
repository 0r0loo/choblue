# Data Model Refactoring Insights - Quick Reference

## The Core Issue: Menu/Restaurant Duplication

### What You Have Today
```
LunchPost                          Review
├─ menu (required, free text)      ├─ restaurant (required, free text)
├─ restaurant (optional, free text) ├─ menu (required, free text)
└─ Planned/announced intent        └─ Actual experience (can differ)
```

### The Problem
1. **No central repository**: restaurants/menus are raw strings, duplicated in Post and Review
2. **Can diverge**: Planned "Samgyeopsal" but actually went to "Korean BBQ House"
3. **No master data**: No Restaurant or MenuItem entities for aggregation/filtering
4. **Redundant schema**: Same fields exist in two places with different constraints
   - LunchPost.restaurant is nullable
   - Review.restaurant is NOT NULL
5. **Search/filtering spans both**: Menu history queries only Review, but users may want to search Plans too

---

## Entities Summary

| Entity | Purpose | Key Fields |
|--------|---------|-----------|
| **Workspace** | Container for teams | name, slug, inviteCode, adminToken |
| **Member** | Team member | nickname, cookieToken, role, workspaceId |
| **LunchPost** | Lunch gathering announcement | **menu**, **restaurant**, date, time, maxParticipants, status, authorId |
| **Participation** | "I'm joining" - join table | lunchPostId, memberId, unique(both) |
| **Review** | Post-meal feedback | **restaurant**, **menu**, tasteRating, portionRating, content |

---

## Key Constraints

### Foreign Keys & Cascades
- All foreign keys use CASCADE DELETE
- LunchPost.authorId → Member (when member deleted, posts deleted)
- Participation/Review → LunchPost (when post deleted, reviews cascade)

### Unique Constraints
- Workspace: `slug`, `inviteCode`
- Member: `cookieToken`
- Participation: unique(`lunchPostId`, `memberId`) - one join per post
- Review: unique(`lunchPostId`, `memberId`) - one review per post per person

### Special Flags
- LunchPost.isDeleted (boolean, soft delete)
- LunchPost.status (OPEN | CLOSED)
- Member.role (ADMIN | MEMBER)

---

## API Endpoints & Data Flow

### Creating a Lunch Gathering
```
POST /workspaces/:id/posts
├─ menu (required, max 100) ← "팀보수 + 김밥"
├─ restaurant (optional) ← "프랜드마크"
├─ date, time (required)
├─ maxParticipants (2-10)
└─ Auto-add author to Participation
```

### Closing & Reviewing
```
1. Author calls POST /posts/:id/close → status = CLOSED
2. Participants call POST /posts/:id/reviews
   ├─ restaurant (required, max 100) ← Actual place
   ├─ menu (required, max 100) ← What they ate
   ├─ tasteRating (1-5)
   ├─ portionRating (1-5)
   └─ content (optional, max 200)
3. Returns menu history via GET /workspaces/:id/menu-history
```

---

## Why Refactoring Matters

### Current State (String-Based)
- Cannot query "all restaurants" or "top menus"
- No data normalization
- Search is string LIKE matching only
- Hard to enforce consistency
- Difficult to build analytics

### Possible Future State (Master Tables)
- Add Restaurant & MenuItem entities
- Foreign key from Review/LunchPost to these
- Enable: "Show me all times we went to Restaurant X"
- Enable: "What was the average rating for MenuItem Y?"
- Enable: proper dropdowns vs free text

### Decision Points Before Refactoring
1. Should LunchPost.restaurant reference a Restaurant FK, or stay free text?
2. Should Review.restaurant/menu reference master tables or stay independent?
3. Should we backfill existing Posts/Reviews or start fresh?
4. Do we need audit trail if restaurant/menu changes after review is written?

---

## Files to Watch During Refactoring

### Entities
- `/Users/chotaegyu/study/side-project/apps/lunch-api/src/entities/lunch-post.entity.ts`
- `/Users/chotaegyu/study/side-project/apps/lunch-api/src/entities/review.entity.ts`

### Services (Query/Update Logic)
- `/Users/chotaegyu/study/side-project/apps/lunch-api/src/lunch-post/lunch-post.service.ts`
- `/Users/chotaegyu/study/side-project/apps/lunch-api/src/review/review.service.ts`
- Line 173-209 in review.service.ts (getMenuHistory with ILIKE searches)

### DTOs (Validation & API Contract)
- `/Users/chotaegyu/study/side-project/apps/lunch-api/src/lunch-post/dto/create-lunch-post.dto.ts`
- `/Users/chotaegyu/study/side-project/apps/lunch-api/src/lunch-post/dto/update-lunch-post.dto.ts`
- `/Users/chotaegyu/study/side-project/apps/lunch-api/src/review/dto/create-review.dto.ts`
- `/Users/chotaegyu/study/side-project/apps/lunch-api/src/review/dto/update-review.dto.ts`

### Frontend (affected by any API changes)
- All pages in `/Users/chotaegyu/study/side-project/apps/lunch/src/pages/`
- Query hooks in `/Users/chotaegyu/study/side-project/apps/lunch/src/lib/queries.ts`

---

## Impact Analysis Template

If you decide to refactor, plan for:

1. **Entity Changes** → Migration + TypeORM
2. **Service Logic** → Query builder updates
3. **DTOs** → Validation changes
4. **API Response Shape** → Breaking change?
5. **Frontend** → Component updates + query hooks
6. **Tests** → All affected spec files
7. **Database State** → Data migration for existing records