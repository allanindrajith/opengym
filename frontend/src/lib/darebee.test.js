import { describe, it, expect } from 'vitest'
import {
  DAREBEE_WORKOUTS,
  DAREBEE_PLANS,
  DAREBEE_PROGRAMS,
  DAREBEE_CHALLENGES,
  DAREBEE_GUIDES,
  DAREBEE_COLLECTIONS
} from './darebee-library.js'
import {
  darebeeToRoutine,
  darebeeToActive,
  applyDarebeePlan,
  toggleDarebeeDay,
  programDayToWorkout,
  loadProgramIntoPlan
} from './darebee.js'

describe('Darebee Library Data Integrity', () => {
  it('loads offline catalog with 200+ workouts and all 6 categories', () => {
    expect(DAREBEE_WORKOUTS.length).toBeGreaterThanOrEqual(200)
    expect(DAREBEE_PLANS.length).toBeGreaterThan(0)
    expect(DAREBEE_PROGRAMS.length).toBeGreaterThanOrEqual(4)
    expect(DAREBEE_CHALLENGES.length).toBeGreaterThan(0)
    expect(DAREBEE_GUIDES.length).toBeGreaterThan(0)
    expect(DAREBEE_COLLECTIONS.length).toBeGreaterThan(0)
  })

  it('contains top flagship 30-day programs with complete day schedules', () => {
    const programIds = DAREBEE_PROGRAMS.map(p => p.id)
    expect(programIds).toContain('db-prog-ironborn')
    expect(programIds).toContain('db-prog-foundation')
    expect(programIds).toContain('db-prog-heros-journey')
    expect(programIds).toContain('db-prog-30days-hiit')

    const ironborn = DAREBEE_PROGRAMS.find(p => p.id === 'db-prog-ironborn')
    expect(ironborn.days.length).toBe(30)
    expect(ironborn.days[0].exercises.length).toBeGreaterThan(0)
  })

  it('verifies workouts have required fields and exercises', () => {
    for (const w of DAREBEE_WORKOUTS) {
      expect(w.id).toBeDefined()
      expect(w.name).toBeDefined()
      expect(w.exercises.length).toBeGreaterThan(0)
      expect(w.difficulty).toBeGreaterThanOrEqual(1)
      expect(w.difficulty).toBeLessThanOrEqual(5)
      expect(w.equipment).toBeDefined()
      expect(w.bodyLocation).toBeDefined()
    }
  })

  it('converts a Darebee workout into an OpenGym routine', () => {
    const w = DAREBEE_WORKOUTS[0]
    const routine = darebeeToRoutine(w)

    expect(routine.id).toBeDefined()
    expect(routine.name).toBe(w.name)
    expect(routine.ex.length).toBe(w.exercises.length)
    expect(routine.ex[0].id).toBeDefined()
    expect(routine.ex[0].sets).toBeGreaterThan(0)
  })

  it('converts a Darebee workout into an immediate active session', () => {
    const w = DAREBEE_WORKOUTS[1]
    const active = darebeeToActive(w)

    expect(active.name).toBe(w.name)
    expect(active.start).toBeGreaterThan(0)
    expect(active.cur).toBe(0)
    expect(active.entries).toBeDefined()
    expect(active.entries.length).toBe(w.exercises.length)
    expect(active.entries[0].target).toBeDefined()
    expect(active.entries[0].sets[0].done).toBe(false)
    // Backwards compatibility alias
    expect(active.ex).toBe(active.entries)
  })

  it('converts a 30-day program day into a runnable workout with 1-click support', () => {
    const ironborn = DAREBEE_PROGRAMS.find(p => p.id === 'db-prog-ironborn')
    const workoutDay1 = programDayToWorkout(ironborn, 1)

    expect(workoutDay1).toBeDefined()
    expect(workoutDay1.name).toContain('Ironborn')
    expect(workoutDay1.exercises.length).toBeGreaterThan(0)

    const activeSession = darebeeToActive(workoutDay1)
    expect(activeSession.name).toBe(workoutDay1.name)
    expect(activeSession.ex.length).toBe(workoutDay1.exercises.length)
  })

  it('loads 30-day program into user weekly schedule with 1-click', () => {
    const foundation = DAREBEE_PROGRAMS.find(p => p.id === 'db-prog-foundation')
    const mockStore = { routines: [], week: {} }
    const update = fn => fn(mockStore)

    loadProgramIntoPlan(foundation, update)
    expect(mockStore.routines.length).toBe(7)
    expect(Object.keys(mockStore.week).length).toBe(7)
  })

  it('applies a Darebee plan to store', () => {
    const plan = DAREBEE_PLANS[0]
    const mockStore = {
      routines: [],
      week: {}
    }
    const update = fn => fn(mockStore)

    applyDarebeePlan(plan, update)
    expect(mockStore.routines.length).toBeGreaterThan(0)
    expect(Object.keys(mockStore.week).length).toBe(7)
  })

  it('toggles challenge progress correctly', () => {
    let progress = {}
    progress = toggleDarebeeDay(progress, 'challenge-1', 1)
    expect(progress['challenge-1'].completedDays).toEqual([1])

    progress = toggleDarebeeDay(progress, 'challenge-1', 2)
    expect(progress['challenge-1'].completedDays).toEqual([1, 2])

    // Toggle off
    progress = toggleDarebeeDay(progress, 'challenge-1', 1)
    expect(progress['challenge-1'].completedDays).toEqual([2])
  })
})

