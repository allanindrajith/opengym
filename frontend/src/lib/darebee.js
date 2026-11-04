import { uid, todayISO } from './format.js'
import { matchExercise } from './import-csv.js'
import { DAREBEE_WORKOUTS } from './darebee-library.js'

// Convert a curated workout object into an OpenGym standard routine
export function darebeeToRoutine(workout) {
  const ex = (workout.exercises || []).map(item => {
    const rawName = typeof item === 'string' ? item : item.name
    const matchedId = matchExercise(rawName) || '0025'
    return {
      id: matchedId,
      customName: rawName,
      sets: (typeof item === 'object' && item.sets) || workout.sets || 3,
      reps: (typeof item === 'object' && item.reps) || 10,
      weight: (typeof item === 'object' && item.weight) || 0
    }
  })

  return {
    id: uid(),
    name: workout.name,
    emoji: workout.equipment === 'dumbbells' ? 'dumbbell' : 'legs',
    programWorkoutId: workout.id,
    darebeeId: workout.id,
    ex
  }
}

export const workoutToRoutine = darebeeToRoutine


// Convert a specific day of a 30-day program into a runnable workout object
export function programDayToWorkout(program, dayNumber) {
  const day = (program.days || []).find(d => d.day === dayNumber) || program.days?.[0]
  if (!day) return null

  return {
    id: `${program.id}-day-${day.day}`,
    name: `${program.name}: ${day.title}`,
    type: program.difficulty >= 4 ? 'hiit' : 'strength',
    difficulty: program.difficulty || 3,
    bodyLocation: 'full body',
    equipment: program.equipment || 'no-equipment',
    desc: `${program.name} Day ${day.day} workout`,
    sets: 4,
    restSec: 60,
    exercises: (day.exercises || []).map(ex => {
      if (typeof ex === 'string') {
        return { name: ex, reps: 12, sets: 4, weight: 0 }
      }
      return ex
    })
  }
}

// 1-Click Load an entire program or week into user routines & plan
export function loadProgramIntoPlan(program, update) {
  const nextDays = (program.days || []).slice(0, 7)
  const routinesToAdd = []
  const weekMap = {}

  nextDays.forEach((d, idx) => {
    const dayOfWeek = (idx + 1) % 7 // 1 to 6, then 0 for Sunday
    const w = programDayToWorkout(program, d.day)
    if (w) {
      const routine = darebeeToRoutine(w)
      routinesToAdd.push(routine)
      weekMap[dayOfWeek] = routine.id
    }
  })

  update(st => {
    st.routines.push(...routinesToAdd)
    for (const [day, routineId] of Object.entries(weekMap)) {
      st.week[day] = routineId
    }
  })
}


// Convert a Darebee workout into an immediate active workout session fully compliant with Workout.jsx
export function darebeeToActive(workout, st = null) {
  const routine = darebeeToRoutine(workout)
  const entries = routine.ex.map(e => ({
    id: e.id,
    customName: e.customName,
    sg: null,
    target: { id: e.id, sets: e.sets, reps: e.reps, weight: e.weight },
    plan: null,
    sets: Array.from({ length: Math.max(1, e.sets || 1) }).map(() => ({
      w: e.weight || 0,
      r: e.reps || 10,
      done: false
    }))
  }))

  const active = {
    id: uid(),
    d: todayISO(),
    start: Date.now(),
    routineId: routine.id,
    name: routine.name,
    emoji: routine.emoji,
    bw: st?.bodyweight?.length ? st.bodyweight[st.bodyweight.length - 1].w : null,
    cur: 0,
    entries
  }

  // Backwards compatibility alias for tests/components reading active.ex
  Object.defineProperty(active, 'ex', {
    get() {
      return this.entries
    },
    enumerable: true,
    configurable: true
  })

  return active
}

// Apply a Darebee 7-day training plan to the user's weekly schedule
export function applyDarebeePlan(plan, update) {
  const routinesToAdd = []
  const weekMap = {}

  for (const entry of plan.schedule) {
    if (entry.rest) {
      weekMap[entry.day] = null
    } else {
      const wData = DAREBEE_WORKOUTS.find(w => w.id === entry.workoutId)
      if (wData) {
        const routine = darebeeToRoutine(wData)
        routine.name = entry.name || routine.name
        routinesToAdd.push(routine)
        weekMap[entry.day] = routine.id
      }
    }
  }

  update(st => {
    st.routines.push(...routinesToAdd)
    for (const [day, routineId] of Object.entries(weekMap)) {
      st.week[day] = routineId
    }
  })
}

// Track 30-day program / challenge progress in local storage
export function toggleDarebeeDay(progressMap = {}, itemId, dayNum) {
  const copy = { ...progressMap }
  const current = copy[itemId] || { completedDays: [] }
  const set = new Set(current.completedDays || [])

  if (set.has(dayNum)) {
    set.delete(dayNum)
  } else {
    set.add(dayNum)
  }

  copy[itemId] = {
    ...current,
    completedDays: Array.from(set).sort((a, b) => a - b),
    lastUpdated: Date.now()
  }

  return copy
}
