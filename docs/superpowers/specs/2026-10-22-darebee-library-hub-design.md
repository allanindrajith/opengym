# Darebee Hub Integration Specification for OpenGym

## 1. Overview
Integrate a full **Darebee Hub** into OpenGym featuring the 6 canonical Darebee categories:
1. **Workouts:** Single-session workout routines categorized by focus (Strength, HIIT, Cardio, Abs, Combat) with Level 1–5 difficulty filters and equipment filters.
2. **Training Plans:** Weekly structured training splits (Full Body, Push/Pull/Legs, Upper/Lower, Dumbbell Only, Bodyweight).
3. **Programs:** Multi-day progressive programs (Ironborn 30 Days of Dumbbells, Foundation 30 Days of Low-Impact, Hero's Journey, 30 Days of HIIT, Spartan) with day-by-day progress tracking.
4. **Challenges:** 30-Day micro-challenges (50 Push-ups, Plank, 100 Squats, Core Challenge, Daily Dare) with a daily completion toggle.
5. **Guides:** Form guides, warmup routines, cooldowns, and stretching guides with clear step-by-step instructions.
6. **Collections:** Themed workout collections (No Equipment, Travel & Hotel, Office Desk, Combat / Martial Arts, Superhero / RPG themed).

---

## 2. User Experience & Architecture

### 2.1 Navigation & Entry Points
- Accessible via route `/darebee` in OpenGym's React Router.
- Direct entry buttons:
  - Header of [Plan.jsx](file:///Users/allanindrajith/Github%20Project/OpenGym/frontend/src/views/Plan.jsx): "Darebee Library" button with a flame/sparkles icon.
  - Header of [Library.jsx](file:///Users/allanindrajith/Github%20Project/OpenGym/frontend/src/views/Library.jsx): "Darebee Catalog" button.
  - Optional banner in [Home.jsx](file:///Users/allanindrajith/Github%20Project/OpenGym/frontend/src/views/Home.jsx) or [Settings.jsx](file:///Users/allanindrajith/Github%20Project/OpenGym/frontend/src/views/Settings.jsx).

### 2.2 Views & Components
- **`DarebeeHub.jsx` (`/darebee`):** Main hub containing:
  - Top category bar: `[ Workouts | Training Plans | Programs | Challenges | Guides | Collections ]`.
  - Search bar + Tag filters (Difficulty: Level 1–5, Equipment: Bodyweight / Dumbbells, Target: Full / Upper / Core / Lower).
  - Card grid displaying thumbnail image, title, difficulty badge, tags, and summary.
- **`DarebeeDetailSheet.jsx`:** Interactive detail modal for any selected item:
  - High-resolution visual card / infographic image (lazy loaded from Darebee's CDN with fallback).
  - Exercise breakdown list (exercise name, sets, reps, rest time).
  - Action buttons:
    - **"Start Workout Now"**: Immediately launches OpenGym live workout mode (`/workout`) populated with this workout.
    - **"Save to My Routines"**: Adds the workout to `S.routines` so the user can assign it to any day of their week schedule.
    - **"Set as Active Program"**: For multi-day programs and challenges, tracks progress in local state (`S.darebeeProgress`).

---

## 3. Data Model & Storage

### 3.1 Dataset (`frontend/src/lib/darebee-library.js`)
An offline-ready JavaScript module exporting:
- `DAREBEE_WORKOUTS`: Curated library of 100+ workouts.
- `DAREBEE_PLANS`: Weekly schedule configurations with routine mappings.
- `DAREBEE_PROGRAMS`: Multi-day programs (Days 1–30) with per-day workout definitions.
- `DAREBEE_CHALLENGES`: 30-day challenge structures with daily progression rep targets.
- `DAREBEE_GUIDES`: Warmup, cooldown, mobility, and exercise form guides.
- `DAREBEE_COLLECTIONS`: Grouped collections tagging workouts into themes.

### 3.2 State Integration (`useStore.js`)
- Persisted in OpenGym local storage:
  - `S.darebeeProgress`: `{ [programOrChallengeId]: { currentDay: number, completedDays: number[], startedAt: number } }`
- Native Routine Bridge:
  - Helper `darebeeToRoutine(item)` converts any Darebee workout structure into OpenGym's standard `{ id, name, emoji, ex: [{ id, sets, reps, weight }] }`.

---

## 4. Testing & Verification Plan
1. **Unit tests (`darebee.test.js`)**:
   - Verify `darebeeToRoutine` produces valid OpenGym routines with valid exercise mappings.
   - Verify all 6 category data structures load without null/undefined fields.
   - Verify progress tracking state updates.
2. **Build & Lint verification**:
   - `npm run build` inside `frontend/` succeeds with zero errors.
3. **UI Verification**:
   - Verify route `/darebee` renders all 6 tabs cleanly on desktop and mobile viewports.
   - Test "Start Workout Now" opens the live workout tracker.
   - Test "Save to My Routines" appears in `/plan`.
