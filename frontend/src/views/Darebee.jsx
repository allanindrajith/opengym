import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore.js'
import { useUI } from '../store/useUI.js'
import Icon from '../components/Icon.jsx'
import { Button } from '../components/ui.jsx'
import { t } from '../lib/i18n.js'
import {
  DAREBEE_WORKOUTS,
  DAREBEE_PLANS,
  DAREBEE_PROGRAMS,
  DAREBEE_CHALLENGES,
  DAREBEE_GUIDES,
  DAREBEE_COLLECTIONS,
  DAILY_DARES
} from '../lib/darebee-library.js'
import {
  darebeeToRoutine,
  darebeeToActive,
  applyDarebeePlan,
  toggleDarebeeDay,
  programDayToWorkout,
  loadProgramIntoPlan
} from '../lib/darebee.js'

const TABS = [
  { id: 'workouts', label: 'Workouts', icon: 'dumbbell' },
  { id: 'programs', label: '30-Day Programs', icon: 'sparkles' },
  { id: 'plans', label: 'Weekly Splits', icon: 'calendar' },
  { id: 'challenges', label: 'Challenges', icon: 'medal' },
  { id: 'guides', label: 'Form Guides', icon: 'info' }
]

const QUICK_FILTERS = [
  { id: 'all', label: 'All', type: 'all' },
  { id: 'dumbbells', label: 'Dumbbells', type: 'equipment', val: 'dumbbells' },
  { id: 'bodyweight', label: 'Bodyweight', type: 'equipment', val: 'no-equipment' },
  { id: 'full-body', label: 'Full Body', type: 'muscle', val: 'full body' },
  { id: 'upper', label: 'Upper Body', type: 'muscle', val: 'upper body' },
  { id: 'lower', label: 'Lower Body', type: 'muscle', val: 'lower body' },
  { id: 'core', label: 'Core', type: 'muscle', val: 'core' },
  { id: 'lvl1', label: 'Beginner', type: 'diff', val: '1' },
  { id: 'lvl3', label: 'Intermediate', type: 'diff', val: '3' },
  { id: 'lvl5', label: 'Advanced', type: 'diff', val: '5' }
]

export default function Darebee() {
  const nav = useNavigate()
  const S = useStore(s => s.S)
  const update = useStore(s => s.update)
  const toast = useUI(s => s.toast)
  const openSheet = useUI(s => s.openSheet)

  const [activeTab, setActiveTab] = useState('workouts')
  const [q, setQ] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')

  const progress = S.programProgress || S.darebeeProgress || {}
  const dailyProgress = S.dailyDareProgress || {}

  // Deterministic daily dare
  const todayDate = new Date()
  const dayOfMonth = todayDate.getDate()
  const todayDare = DAILY_DARES[(dayOfMonth - 1) % DAILY_DARES.length] || DAILY_DARES[0]
  const todayDareKey = `${todayDate.getFullYear()}-${todayDate.getMonth() + 1}-${dayOfMonth}`
  const todayDareDone = !!dailyProgress[todayDareKey]
  const todayDareEC = !!dailyProgress[todayDareKey]?.extraCredit

  const handleStartWorkout = (w, close) => {
    if (close) close()
    const routine = darebeeToRoutine(w)
    update(s => {
      if (!s.routines.some(r => r.id === routine.id)) {
        s.routines.push(routine)
      }
      s.active = darebeeToActive(w, s)
    })
    useUI.getState().stopRest()
    toast(t('Started {0}', w.name))
    nav('/workout')
  }

  const handleSaveRoutine = (w, close) => {
    if (close) close()
    const routine = darebeeToRoutine(w)
    update(s => {
      s.routines.push(routine)
    })
    toast(t('Added “{0}” to your routines', w.name))
  }

  const handleApplyPlan = (plan, close) => {
    if (close) close()
    applyDarebeePlan(plan, update)
    toast(t('Loaded “{0}” into your weekly schedule', plan.name))
    nav('/plan')
  }

  const handleStartProgramToday = (prog, close) => {
    if (close) close()
    const completed = (progress[prog.id] && progress[prog.id].completedDays) || []
    const nextDay = (prog.days || []).find(d => !completed.includes(d.day)) || prog.days?.[0]
    if (!nextDay) return
    const w = programDayToWorkout(prog, nextDay.day)
    if (w) handleStartWorkout(w)
  }

  const handleLoadProgramPlan = (prog, close) => {
    if (close) close()
    loadProgramIntoPlan(prog, update)
    toast(t('Loaded “{0}” into your weekly schedule', prog.name))
    nav('/plan')
  }

  const handleToggleDay = (itemId, dayNum) => {
    update(s => {
      const nextProg = toggleDarebeeDay(s.programProgress || s.darebeeProgress, itemId, dayNum)
      s.programProgress = nextProg
      s.darebeeProgress = nextProg
    })
  }

  const handleToggleDailyDare = (withEC = false) => {
    update(s => {
      if (!s.dailyDareProgress) s.dailyDareProgress = {}
      if (s.dailyDareProgress[todayDareKey]) {
        delete s.dailyDareProgress[todayDareKey]
        toast(t('Daily Challenge reset'))
      } else {
        s.dailyDareProgress[todayDareKey] = {
          date: todayDareKey,
          extraCredit: withEC,
          completedAt: Date.now()
        }
        toast(withEC ? t('Challenge completed with Extra Credit!') : t('Challenge completed!'))
      }
    })
  }

  const handleStartDailyDareWorkout = () => {
    const dareWorkout = {
      id: `daily-dare-${todayDareKey}`,
      name: `Daily Challenge: ${todayDare.title}`,
      type: 'hiit',
      difficulty: 3,
      bodyLocation: todayDare.muscle || 'full body',
      equipment: 'no-equipment',
      desc: `${todayDare.desc} (Extra Credit: ${todayDare.extraCredit})`,
      sets: 1,
      restSec: 60,
      exercises: [
        {
          name: todayDare.title,
          reps: todayDare.target,
          sets: 1,
          weight: 0
        }
      ]
    }
    handleStartWorkout(dareWorkout)
  }

  const openWorkoutDetail = w => {
    openSheet(close => (
      <div className="db-sheet">
        <div className="row between" style={{ alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <div className="row" style={{ gap: 6, marginBottom: 4 }}>
              <span className="pill-badge volt">LVL {w.difficulty}</span>
              <span className="pill-badge">{w.bodyLocation}</span>
            </div>
            <h2 style={{ margin: '4px 0 0', fontSize: 22 }}>{w.name}</h2>
          </div>
          <span className="tag">{w.sets} Sets</span>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <span className="metric-pill">Equipment: {w.equipment}</span>
          <span className="metric-pill">Rest: {w.restSec}s</span>
          <span className="metric-pill">{w.exercises.length} Exercises</span>
        </div>

        <p className="muted" style={{ fontSize: 13, marginBottom: 16, lineHeight: 1.4 }}>{w.desc}</p>

        <div style={{ fontWeight: 600, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--label-3)', marginBottom: 8 }}>
          Exercise Sequence
        </div>

        <div className="list" style={{ marginBottom: 20 }}>
          {w.exercises.map((ex, idx) => (
            <div key={idx} className="item" style={{ padding: '10px 12px' }}>
              <span className="tag" style={{ minWidth: 26, textAlign: 'center' }}>{idx + 1}</span>
              <div className="grow">
                <div className="tt" style={{ fontSize: 14, fontWeight: 600 }}>{ex.name}</div>
                <div className="ss">{ex.reps} Reps {ex.weight > 0 ? `· ${ex.weight} kg` : ''}</div>
              </div>
              <span className="tag acc">{w.sets} sets</span>
            </div>
          ))}
        </div>

        <div className="row" style={{ gap: 10 }}>
          <Button variant="primary" icon="play" onClick={() => handleStartWorkout(w, close)}>
            {t("Start Workout")}
          </Button>
          <Button variant="tinted" icon="plus" onClick={() => handleSaveRoutine(w, close)}>
            {t("Load into My Plan")}
          </Button>
        </div>
      </div>
    ))
  }

  const openProgramDetail = prog => {
    openSheet(close => {
      const progProg = (progress[prog.id] && progress[prog.id].completedDays) || []
      const pct = Math.round((progProg.length / prog.durationDays) * 100)
      return (
        <div className="db-sheet">
          <div className="row between" style={{ alignItems: 'flex-start', marginBottom: 10 }}>
            <div>
              <div className="row" style={{ gap: 6, marginBottom: 4 }}>
                <span className="pill-badge volt">LVL {prog.difficulty}</span>
                <span className="pill-badge">{prog.durationDays} DAYS</span>
              </div>
              <h2 style={{ margin: '4px 0 0', fontSize: 22 }}>{prog.name}</h2>
              <div className="sub">{prog.tagline}</div>
            </div>
            <span className="pill-badge acc">{pct}% DONE</span>
          </div>

          <p className="muted" style={{ fontSize: 13, margin: '8px 0 16px', lineHeight: 1.4 }}>{prog.desc}</p>

          <div className="row" style={{ gap: 8, marginBottom: 16 }}>
            <Button variant="primary" icon="play" size="sm" onClick={() => handleStartProgramToday(prog, close)}>
              {t("Start Next Day")}
            </Button>
            <Button variant="tinted" icon="calendar" size="sm" onClick={() => handleLoadProgramPlan(prog, close)}>
              {t("Load into Weekly Schedule")}
            </Button>
          </div>

          <div style={{ fontWeight: 600, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--label-3)', marginBottom: 8 }}>
            Program Days ({progProg.length}/{prog.durationDays})
          </div>

          <div className="list" style={{ maxHeight: '45vh', overflowY: 'auto' }}>
            {prog.days.map(d => {
              const done = progProg.includes(d.day)
              const dayWorkout = programDayToWorkout(prog, d.day)
              return (
                <div key={d.day} className={'item' + (done ? ' on' : '')} style={{ padding: '8px 10px' }}>
                  <span
                    className={'lrow-i' + (done ? ' acc' : '')}
                    onClick={() => handleToggleDay(prog.id, d.day)}
                    style={{ cursor: 'pointer' }}
                    title={done ? 'Mark incomplete' : 'Mark complete'}
                  >
                    <Icon name={done ? 'check' : 'calendar'} />
                  </span>
                  <div className="grow" onClick={() => handleToggleDay(prog.id, d.day)} style={{ cursor: 'pointer' }}>
                    <div className="tt" style={{ textDecoration: done ? 'line-through' : 'none', fontSize: 14 }}>
                      {d.title}
                    </div>
                    <div className="ss">
                      {d.exercises.map(e => (typeof e === 'string' ? e : e.name)).join(' · ')}
                    </div>
                  </div>
                  {dayWorkout && (
                    <button
                      className="chip small"
                      style={{ background: 'var(--surface-3)', border: 'none', cursor: 'pointer' }}
                      onClick={() => handleStartWorkout(dayWorkout, close)}
                      title={t("Start this workout")}
                    >
                      <Icon name="play" style={{ fontSize: 11 }} />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )
    })
  }

  // Filtered workouts
  const filteredWorkouts = useMemo(() => {
    return DAREBEE_WORKOUTS.filter(w => {
      const ql = q.toLowerCase().trim()
      const matchesQ = !ql || w.name.toLowerCase().includes(ql) || w.bodyLocation.includes(ql) || w.desc.toLowerCase().includes(ql)
      
      const filter = QUICK_FILTERS.find(f => f.id === activeFilter)
      if (!filter || filter.type === 'all') return matchesQ

      if (filter.type === 'equipment') {
        return matchesQ && w.equipment === filter.val
      }
      if (filter.type === 'muscle') {
        return matchesQ && w.bodyLocation.includes(filter.val)
      }
      if (filter.type === 'diff') {
        return matchesQ && String(w.difficulty) === filter.val
      }
      return matchesQ
    })
  }, [q, activeFilter])

  // Filtered programs
  const filteredPrograms = useMemo(() => {
    return DAREBEE_PROGRAMS.filter(p => {
      const ql = q.toLowerCase().trim()
      return !ql || p.name.toLowerCase().includes(ql) || p.desc.toLowerCase().includes(ql)
    })
  }, [q])

  return (
    <div className="narrow" style={{ paddingBottom: 60 }}>
      {/* Sleek Minimal Header */}
      <div className="hdr" style={{ marginBottom: 12 }}>
        <div>
          <h1 style={{ letterSpacing: '-0.02em', fontSize: 26 }}>{t('Workouts & Programs')}</h1>
          <div className="sub" style={{ fontSize: 13 }}>{t('200+ routines, 30-day programs, weekly splits & challenges')}</div>
        </div>
        <button className="iconbtn" onClick={() => nav('/plan')} aria-label={t('Plan')} title={t('Plan')}>
          <Icon name="calendar" />
        </button>
      </div>

      {/* Featured Athletic Hero Card: Today's Daily Dare */}
      <div className="fit-card-hero">
        <div className="row between" style={{ alignItems: 'flex-start', marginBottom: 8 }}>
          <div className="row" style={{ gap: 6 }}>
            <span className="pill-badge volt">DAILY CHALLENGE</span>
            <span className="pill-badge">DAY {dayOfMonth}</span>
          </div>
          <span className={'pill-badge' + (todayDareDone ? ' acc' : '')}>
            {todayDareDone ? (todayDareEC ? t('Done + EC') : t('Done')) : t('Ready')}
          </span>
        </div>

        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, letterSpacing: '-0.01em' }}>
          {todayDare.title}
        </div>
        <div style={{ fontSize: 13, color: 'var(--label-2)', marginBottom: 10, lineHeight: 1.4 }}>
          {todayDare.target} {todayDare.title} · {todayDare.muscle} · {todayDare.type}
        </div>

        <div className="row between" style={{ gap: 8, alignItems: 'center' }}>
          <div className="row" style={{ gap: 8 }}>
            <Button
              size="sm"
              variant="primary"
              icon="play"
              onClick={handleStartDailyDareWorkout}
            >
              {t('Start')}
            </Button>
            <Button
              size="sm"
              variant={todayDareDone ? 'plain' : 'tinted'}
              icon="check"
              onClick={() => handleToggleDailyDare(!todayDareDone)}
            >
              {todayDareDone ? t('Reset') : t('Complete')}
            </Button>
          </div>
          <div style={{ fontSize: 11, color: 'var(--label-3)' }}>
            {Object.keys(dailyProgress).length} challenges done
          </div>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="filter-scroller" style={{ marginBottom: 14 }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={'chip' + (activeTab === tab.id ? ' on' : '')}
            onClick={() => setActiveTab(tab.id)}
            style={{ fontWeight: 600, fontSize: 13, padding: '7px 14px' }}
          >
            <Icon name={tab.icon} style={{ marginRight: 6, fontSize: 13 }} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Input for Workouts & Programs */}
      {(activeTab === 'workouts' || activeTab === 'programs') && (
        <div className="search" style={{ marginBottom: 12 }}>
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
          <input
            className="input"
            placeholder={activeTab === 'workouts' ? t('Search workouts by name or muscle…') : t('Search programs…')}
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>
      )}

      {/* Quick Filter Scroller for Workouts */}
      {activeTab === 'workouts' && (
        <div className="filter-scroller" style={{ marginBottom: 14 }}>
          {QUICK_FILTERS.map(f => (
            <button
              key={f.id}
              className={'chip nocap' + (activeFilter === f.id ? ' on' : '')}
              onClick={() => setActiveFilter(f.id)}
              style={{ fontSize: 12, padding: '5px 12px' }}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* 1. WORKOUTS TAB - Responsive 2-column Fit-Card Grid */}
      {activeTab === 'workouts' && (
        <>
          <div className="row between" style={{ marginBottom: 10, fontSize: 12, color: 'var(--label-3)' }}>
            <span>{filteredWorkouts.length} Workouts</span>
            {(activeFilter !== 'all' || q) && (
              <button
                className="chip small"
                onClick={() => { setActiveFilter('all'); setQ('') }}
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="workout-grid">
            {filteredWorkouts.map(w => (
              <div
                key={w.id}
                className="fit-card"
                onClick={() => openWorkoutDetail(w)}
              >
                <div>
                  <div className="row between" style={{ marginBottom: 8, alignItems: 'center' }}>
                    <span className="pill-badge">{w.bodyLocation}</span>
                    <span className="pill-badge volt">LVL {w.difficulty}</span>
                  </div>

                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, letterSpacing: '-0.01em' }}>
                    {w.name}
                  </div>

                  <div style={{ fontSize: 12, color: 'var(--label-2)', marginBottom: 12, minHeight: 34, lineHeight: 1.35 }}>
                    {w.exercises.map(e => e.name).slice(0, 3).join(' · ')}
                    {w.exercises.length > 3 ? '…' : ''}
                  </div>
                </div>

                <div className="row between" style={{ borderTop: '1px solid var(--sep-op)', paddingTop: 10, marginTop: 4 }}>
                  <span className="metric-pill">
                    {w.sets} sets · {w.exercises.length} ex
                  </span>
                  <div className="row" style={{ gap: 6 }} onClick={e => e.stopPropagation()}>
                    <Button
                      size="sm"
                      variant="tinted"
                      icon="plus"
                      onClick={() => handleSaveRoutine(w)}
                      title={t("Load into My Plan")}
                    />
                    <Button
                      size="sm"
                      variant="primary"
                      icon="play"
                      onClick={() => handleStartWorkout(w)}
                      title={t("Start Workout")}
                    >
                      {t('Start')}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredWorkouts.length === 0 && (
            <div className="empty">
              <div className="ico"><Icon name="magnifier" /></div>
              {t('No matching workouts found')}
            </div>
          )}
        </>
      )}

      {/* 2. PROGRAMS TAB - Visual 30-Day Programs */}
      {activeTab === 'programs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredPrograms.map(prog => {
            const progDone = (progress[prog.id] && progress[prog.id].completedDays) || []
            const pct = Math.round((progDone.length / prog.durationDays) * 100)
            return (
              <div
                key={prog.id}
                className="fit-card"
                style={{ padding: 16 }}
              >
                <div onClick={() => openProgramDetail(prog)} style={{ cursor: 'pointer' }}>
                  <div className="row between" style={{ marginBottom: 6 }}>
                    <div className="row" style={{ gap: 6 }}>
                      <span className="pill-badge volt">LVL {prog.difficulty}</span>
                      <span className="pill-badge">{prog.durationDays} DAYS</span>
                      <span className="pill-badge">{prog.equipment}</span>
                    </div>
                    <span className="pill-badge acc">{pct}% DONE</span>
                  </div>

                  <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 2 }}>{prog.name}</div>
                  <div className="sub" style={{ fontSize: 13, marginBottom: 8 }}>{prog.tagline}</div>
                  <p className="muted" style={{ fontSize: 13, margin: '0 0 12px', lineHeight: 1.4 }}>{prog.desc}</p>
                </div>

                <div className="row between" style={{ borderTop: '1px solid var(--sep-op)', paddingTop: 10 }}>
                  <span className="metric-pill">
                    {progDone.length} of {prog.durationDays} days completed
                  </span>
                  <div className="row" style={{ gap: 8 }}>
                    <Button
                      variant="tinted"
                      size="sm"
                      icon="calendar"
                      onClick={() => handleLoadProgramPlan(prog)}
                    >
                      {t("Schedule")}
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      icon="play"
                      onClick={() => handleStartProgramToday(prog)}
                    >
                      {t("Start Next")}
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 3. WEEKLY SPLITS TAB */}
      {activeTab === 'plans' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {DAREBEE_PLANS.map(plan => (
            <div key={plan.id} className="fit-card">
              <div className="row between" style={{ marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700 }}>{plan.name}</div>
                  <div className="sub" style={{ fontSize: 12 }}>{plan.badge}</div>
                </div>
                <Button size="sm" variant="primary" icon="sparkles" onClick={() => handleApplyPlan(plan)}>
                  {t("Load Plan")}
                </Button>
              </div>
              <p className="muted" style={{ fontSize: 13, margin: '0 0 10px', lineHeight: 1.35 }}>{plan.desc}</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                {plan.schedule.map((d, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '6px 2px',
                      textAlign: 'center',
                      background: d.rest ? 'var(--surface-2)' : 'rgba(255,59,48,0.14)',
                      borderRadius: 6,
                      border: d.rest ? 'none' : '1px solid rgba(255,59,48,0.32)'
                    }}
                  >
                    <div style={{ fontSize: 10, color: 'var(--label-3)' }}>D{i + 1}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: d.rest ? 'var(--label-2)' : 'var(--acc)' }}>
                      {d.rest ? 'Rest' : 'Train'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. CHALLENGES TAB */}
      {activeTab === 'challenges' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {DAREBEE_CHALLENGES.map(ch => {
            const chDone = (progress[ch.id] && progress[ch.id].completedDays) || []
            const isCompleted = chDone.length >= ch.durationDays
            return (
              <div key={ch.id} className="fit-card">
                <div className="row between" style={{ marginBottom: 6 }}>
                  <div className="row" style={{ gap: 8, alignItems: 'center' }}>
                    <span className="lrow-i acc" style={{ fontSize: 16, padding: 6 }}>
                      <Icon name={ch.icon} />
                    </span>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700 }}>{ch.name}</div>
                      <div className="sub" style={{ fontSize: 12 }}>{ch.durationDays} Days · {ch.category || 'Targeted'}</div>
                    </div>
                  </div>
                  <span className={'pill-badge' + (isCompleted ? ' acc' : '')}>
                    {chDone.length}/{ch.durationDays}
                  </span>
                </div>

                <p className="muted" style={{ fontSize: 13, margin: '0 0 10px' }}>{ch.desc}</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 4 }}>
                  {Array.from({ length: ch.durationDays }).map((_, idx) => {
                    const day = idx + 1
                    const done = chDone.includes(day)
                    return (
                      <button
                        key={day}
                        onClick={() => handleToggleDay(ch.id, day)}
                        style={{
                          padding: '6px 0',
                          borderRadius: 6,
                          border: 'none',
                          background: done ? 'var(--acc)' : 'var(--surface-3)',
                          color: done ? 'var(--on-acc)' : 'var(--label-2)',
                          fontWeight: 700,
                          fontSize: 10,
                          cursor: 'pointer'
                        }}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 5. FORM GUIDES TAB - Compact Interactive Accordion Cards */}
      {activeTab === 'guides' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {DAREBEE_GUIDES.map(g => (
            <div key={g.id} className="fit-card" style={{ padding: 14 }}>
              <div className="row between" style={{ marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{g.title}</div>
                  <div className="sub" style={{ fontSize: 12 }}>{g.category} · {g.duration}</div>
                </div>
                <span className="pill-badge">{g.category}</span>
              </div>
              <p className="muted" style={{ fontSize: 13, margin: '0 0 10px', lineHeight: 1.35 }}>{g.summary}</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, background: 'var(--surface-2)', padding: 10, borderRadius: 8 }}>
                {g.steps.map((st, i) => (
                  <div key={i} className="row" style={{ gap: 8, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--acc)', minWidth: 16 }}>{i + 1}.</span>
                    <span style={{ fontSize: 12, color: 'var(--label-2)', lineHeight: 1.35 }}>{st}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
