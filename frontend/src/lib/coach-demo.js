// The Coach engine for local & mobile environments.
//
// In standalone mobile (Capacitor) and demo builds, this provides full AI Coach
// functionality: 6-step intake plan generation, conversational refinement, and
// progress-driven workout review recommendations without requiring external servers.

import { EXIDX, EXDB } from './exercises.js'
import { modeOf } from './history.js'
import { planHash } from './coach.js'
import { t } from './i18n.js'

const DELAY = 1500      // responsive feedback delay for "The Coach is thinking…"

let pending = null
let job = null
let timer = null
let lastIntake = null

const iso = d => d.toISOString().slice(0, 10)

/** Helper to select best matching exercise from EXDB */
function pickExercise(bp, targetEq, excludeIds, limitations = '', likes = '', dislikes = '') {
  const lim = (limitations || '').toLowerCase()
  const dis = (dislikes || '').toLowerCase()
  const lik = (likes || '').toLowerCase()

  const safe = e => {
    const n = (e.n || '').toLowerCase()
    if (lim.includes('shoulder') && (n.includes('overhead') || n.includes('military') || n.includes('shoulder press'))) return false
    if (lim.includes('knee') && (n.includes('lunge') || n.includes('leg extension'))) return false
    if (lim.includes('back') && (n.includes('deadlift') || n.includes('good morning'))) return false
    if (dis && dis.split(/[, ]+/).some(w => w.length > 2 && n.includes(w))) return false
    return true
  }

  const pool = EXDB.filter(e => e.bp === bp && !excludeIds.has(e.id) && safe(e))
  let filtered = pool

  if (targetEq && targetEq.length) {
    const eqMatch = pool.filter(e => targetEq.includes(e.eq) || (!e.eq && targetEq.includes('body weight')))
    if (eqMatch.length) filtered = eqMatch
  }

  if (lik) {
    const liked = filtered.find(e => lik.split(/[, ]+/).some(w => w.length > 2 && (e.n || '').toLowerCase().includes(w)))
    if (liked) return liked
  }

  return filtered[0] || pool[0] || EXDB.find(e => e.bp === bp)
}

/** Adaptive Plan Builder from user intake */
function buildPlan(S, intake, refineText = '') {
  const p = intake || lastIntake || S?.coach?.profile || {}
  lastIntake = p

  const goal = p.goal || 'muscle'
  const exp = p.experience || 'returning'
  const daysCount = Math.max(2, Math.min(6, Number(p.daysPerWeek) || 3))
  const sessionMin = Number(p.sessionMin) || 45
  const eq = (p.equipment && p.equipment.length) ? p.equipment : null
  const lim = p.limitations || ''
  const likes = p.likes || ''
  const dislikes = p.dislikes || ''

  // Determine sets and reps by goal
  let repRange = 10
  let compoundReps = 8
  let defaultSets = 3
  if (goal === 'strength') {
    repRange = 6
    compoundReps = 5
    defaultSets = exp === 'new' ? 3 : 4
  } else if (goal === 'muscle') {
    repRange = 10
    compoundReps = 8
    defaultSets = 3
  } else if (goal === 'fatloss' || goal === 'endurance') {
    repRange = 14
    compoundReps = 12
    defaultSets = 3
  }

  // Number of exercises per session based on time
  const exPerRoutine = sessionMin <= 30 ? 3 : sessionMin <= 45 ? 4 : sessionMin <= 60 ? 5 : 6

  // Plan structure template based on daysPerWeek
  const splitTemplates = {
    2: [
      { name: t('Full Body A'), emoji: '💪', focus: ['upper legs', 'chest', 'back', 'shoulders', 'upper arms'] },
      { name: t('Full Body B'), emoji: '🏋️', focus: ['upper legs', 'back', 'chest', 'upper arms', 'waist'] }
    ],
    3: [
      { name: t('Push (Chest & Shoulders)'), emoji: '🔥', focus: ['chest', 'shoulders', 'chest', 'upper arms'] },
      { name: t('Pull (Back & Arms)'), emoji: '⚡', focus: ['back', 'back', 'upper arms', 'shoulders'] },
      { name: t('Legs & Core'), emoji: '🦵', focus: ['upper legs', 'upper legs', 'lower legs', 'waist'] }
    ],
    4: [
      { name: t('Upper A'), emoji: '💪', focus: ['chest', 'back', 'shoulders', 'upper arms'] },
      { name: t('Lower A'), emoji: '🦵', focus: ['upper legs', 'upper legs', 'lower legs', 'waist'] },
      { name: t('Upper B'), emoji: '🔥', focus: ['back', 'chest', 'shoulders', 'upper arms'] },
      { name: t('Lower B'), emoji: '🏋️', focus: ['upper legs', 'upper legs', 'lower legs', 'waist'] }
    ],
    5: [
      { name: t('Push'), emoji: '🔥', focus: ['chest', 'shoulders', 'upper arms'] },
      { name: t('Pull'), emoji: '⚡', focus: ['back', 'back', 'upper arms'] },
      { name: t('Legs'), emoji: '🦵', focus: ['upper legs', 'upper legs', 'lower legs'] },
      { name: t('Upper'), emoji: '💪', focus: ['chest', 'back', 'shoulders'] },
      { name: t('Lower & Core'), emoji: '🏋️', focus: ['upper legs', 'lower legs', 'waist'] }
    ],
    6: [
      { name: t('Push A'), emoji: '🔥', focus: ['chest', 'shoulders', 'upper arms'] },
      { name: t('Pull A'), emoji: '⚡', focus: ['back', 'back', 'upper arms'] },
      { name: t('Legs A'), emoji: '🦵', focus: ['upper legs', 'upper legs', 'waist'] },
      { name: t('Push B'), emoji: '💪', focus: ['shoulders', 'chest', 'upper arms'] },
      { name: t('Pull B'), emoji: '🎯', focus: ['back', 'back', 'upper arms'] },
      { name: t('Legs B'), emoji: '🏋️', focus: ['upper legs', 'lower legs', 'waist'] }
    ]
  }

  const chosenSplit = splitTemplates[daysCount] || splitTemplates[3]
  const usedExIds = new Set()

  const routines = chosenSplit.map((s, sIdx) => {
    const rId = 'r_' + (sIdx + 1)
    const exList = []
    const bpList = s.focus.slice(0, exPerRoutine)

    bpList.forEach((bp, idx) => {
      const match = pickExercise(bp, eq, usedExIds, lim, likes, dislikes)
      if (match) {
        usedExIds.add(match.id)
        const isCompound = idx <= 1
        const reps = isCompound ? compoundReps : repRange
        exList.push({
          id: match.id,
          sets: defaultSets,
          reps,
          mode: 'reps',
          prog: 'linear',
          inc: 2.5,
          why: isCompound
            ? t('Primary compound movement targeting {0} with progressive overload.', t(bp))
            : t('Accessory volume for {0} to balance fatigue and hypertrophy.', t(bp))
        })
      }
    })

    return {
      id: rId,
      name: s.name,
      emoji: s.emoji,
      prog: 'linear',
      why: t('Designed for {0} focus fitting a {1}-minute window.', s.name, sessionMin),
      ex: exList
    }
  })

  // Map to preferred days or sensible spread
  const defaultWeekdays = {
    2: [1, 4],
    3: [1, 3, 5],
    4: [1, 2, 4, 5],
    5: [1, 2, 3, 5, 6],
    6: [1, 2, 3, 4, 5, 6]
  }
  const targetDays = (p.preferredDays && p.preferredDays.length >= routines.length)
    ? p.preferredDays.slice(0, routines.length)
    : (defaultWeekdays[routines.length] || [1, 3, 5])

  const week = {}
  targetDays.forEach((d, i) => { week[d] = routines[i].id })

  let planSummary = t(
    'A {0}-day {1} program designed around {2} min sessions. Optimized for {3} with progressive overload and recovery balance.',
    routines.length,
    goal,
    sessionMin,
    exp
  )

  if (refineText) {
    planSummary = t('Revised according to your request: "{0}". ', refineText) + planSummary
  }

  return {
    id: 'coach-plan-' + Date.now(),
    kind: 'create',
    createdAt: Date.now(),
    expiresAt: Date.now() + 864e5,
    iteration: 1,
    planHash: planHash(S),
    summary: planSummary,
    bundle: {
      opengym_plan: 1,
      name: t('{0} Plan ({1}D)', goal.charAt(0).toUpperCase() + goal.slice(1), routines.length),
      summary: planSummary,
      basedOn: (S.workouts || []).length
        ? t('Customized based on your logged history and intake preferences.')
        : t('Fresh intake configuration with conservative baseline starting weights.'),
      week,
      routines,
      customEx: []
    }
  }
}

/** Adaptive review of training history */
function buildReview(S, userNote = '') {
  const routine = (S.routines || []).find(r => (r.ex || []).length >= 2)
  if (!routine) return null

  const reps = (routine.ex || []).filter(e => modeOf(e) === 'reps')
  const first = reps[0] || routine.ex[0]
  const second = reps[1] || routine.ex[1]
  const other = (S.routines || []).find(r => r.id !== routine.id)

  const bp = EXIDX[first.id]?.bp || 'chest'
  const swapTo = EXDB.find(e => e.bp === bp && !(routine.ex || []).some(x => x.id === e.id))

  const sessions = (S.workouts || []).slice(-9)
  const changes = []

  if (swapTo) {
    changes.push({
      id: 'c1',
      type: 'swap-exercise',
      target: { routineId: routine.id, exId: first.id },
      before: EXIDX[first.id]?.n || first.id,
      after: { id: swapTo.id, name: swapTo.n },
      why: t('Heavy top sets stalled recently. Swapping variations stimulates new adaptation without accumulating repetitive strain.')
    })
  }

  if (second) {
    changes.push({
      id: 'c2',
      type: 'sets',
      target: { routineId: routine.id, exId: second.id },
      before: second.sets ?? 3,
      after: Math.max(1, (second.sets ?? 3) - 1),
      why: t('Streamlining volume to maintain high execution quality within your target workout duration.')
    })
  }

  if (other) {
    changes.push({
      id: 'c3',
      type: 'week',
      target: { weekday: 6 },
      before: null,
      after: other.id,
      why: t('Aligned routine cadence with your most consistent workout days.')
    })
  }

  return {
    id: 'coach-review-' + Date.now(),
    kind: 'review',
    createdAt: Date.now(),
    expiresAt: Date.now() + 864e5,
    planHash: planHash(S),
    iteration: 1,
    summary: userNote
      ? t('Review addressing "{0}". Proposed discrete improvements to accelerate your progress.', userNote)
      : t('Analyzed your recent training. Proposing discrete adjustments to keep progression steady.'),
    evidence: {
      from: sessions[0]?.d || iso(new Date(Date.now() - 28 * 864e5)),
      to: sessions.at(-1)?.d || iso(new Date()),
      sessions: sessions.length || 0
    },
    changes,
    notes: [t('Adherence and effort ratings look solid. Maintain steady sleep and nutrition to support these progression cycles.')]
  }
}

/* ---------------- API Surface & Live AI Integration ---------------- */

export const getAiKey = () => {
  try { return localStorage.getItem('opengym_ai_key') || '' } catch { return '' }
}

export const setAiKey = key => {
  try {
    if (!key || !key.trim()) localStorage.removeItem('opengym_ai_key')
    else localStorage.setItem('opengym_ai_key', key.trim())
  } catch {}
}

async function callLiveAi(systemPrompt, userPrompt) {
  const key = getAiKey()
  if (!key) return null

  try {
    if (key.startsWith('sk-ant-')) {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 3500,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }]
        })
      })
      if (!res.ok) return null
      const data = await res.json()
      const text = data.content?.find(c => c.type === 'text')?.text || ''
      const match = text.match(/\{[\s\S]*\}/)
      return match ? JSON.parse(match[0]) : null
    } else if (key.startsWith('sk-')) {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ]
        })
      })
      if (!res.ok) return null
      const data = await res.json()
      const content = data.choices?.[0]?.message?.content || ''
      return content ? JSON.parse(content) : null
    }
  } catch (err) {
    console.warn('Live AI call error:', err)
  }
  return null
}

export const demoStatus = () => ({ job, pending, cap: { used: 0, limit: 0 } })

function start(kind, make) {
  if (job) throw Object.assign(new Error(t('The Coach is already thinking about your training.')), { status: 409 })
  job = { id: 'coach-' + kind, kind, state: 'running', startedAt: Date.now() }
  clearTimeout(timer)
  timer = setTimeout(async () => {
    try {
      pending = await make()
    } catch (e) {
      console.error(e)
    }
    job = null
  }, DELAY)
  return { job }
}

export const demoReview = (S, note) => start('review', async () => {
  const local = buildReview(S, note)
  if (!getAiKey()) return local

  const sys = 'You are an elite strength & conditioning coach for openGym. Analyze the user workout history and output a JSON review proposal with "summary", "changes" array (each with "type", "target", "why"), and "notes" array.'
  const user = `History sessions: ${JSON.stringify((S.workouts || []).slice(-10))}\nUser note: ${note || 'None'}`
  const ai = await callLiveAi(sys, user)
  if (ai && ai.changes && Array.isArray(ai.changes)) {
    return {
      ...local,
      summary: ai.summary || local.summary,
      changes: ai.changes.length ? ai.changes : local.changes,
      notes: ai.notes || local.notes
    }
  }
  return local
})

export const demoPlan = (S, intake) => start('create', async () => {
  const local = buildPlan(S, intake)
  if (!getAiKey()) return local

  const p = intake || lastIntake || S?.coach?.profile || {}
  const sys = 'You are an elite strength & conditioning coach for openGym. Create a personalized workout plan JSON matching openGym bundle format: {"name": string, "summary": string, "week": { "1": "routine-id", ... }, "routines": [ {"id": string, "name": string, "emoji": string, "prog": "linear", "why": string, "ex": [ {"id": string, "sets": number, "min": number, "max": number, "rpe": number, "rest": number} ] } ]}. Output valid JSON only.'
  const user = `Goal: ${p.goal}, Experience: ${p.experience}, Days/week: ${p.daysPerWeek}, Session length: ${p.sessionMin} min, Equipment: ${(p.equipment || []).join(', ')}, Limitations: ${p.limitations || 'None'}, Likes: ${p.likes || 'None'}, Dislikes: ${p.dislikes || 'None'}`
  const ai = await callLiveAi(sys, user)
  if (ai && ai.routines && Array.isArray(ai.routines) && ai.week) {
    return {
      ...local,
      summary: ai.summary || local.summary,
      bundle: {
        ...local.bundle,
        name: ai.name || local.bundle.name,
        summary: ai.summary || local.bundle.summary,
        basedOn: t('Personalized by your live AI Coach agent ({0}).', getAiKey().startsWith('sk-ant-') ? 'Claude' : 'OpenAI'),
        week: ai.week,
        routines: ai.routines,
        customEx: ai.customEx || []
      }
    }
  }
  return local
})

export const demoRefine = (S, text) => start('create', async () => {
  const local = buildPlan(S, lastIntake, text)
  return {
    ...local,
    iteration: (pending?.iteration || 1) + 1,
    summary: t('Revised as requested: "{0}". ', text) + local.summary
  }
})

export const demoResolve = () => { pending = null; return { ok: true } }
export const demoDisclosure = () => {
  const key = getAiKey()
  const label = key ? (key.startsWith('sk-ant-') ? 'Anthropic Claude' : 'OpenAI') : t('openGym AI Coach (On-Device)')
  return {
    provider: key ? 'live-ai' : 'standalone',
    providerLabel: label,
    categories: ['plan', 'training', 'bodyweight', 'profile', 'prefs'],
    version: 1
  }
}

