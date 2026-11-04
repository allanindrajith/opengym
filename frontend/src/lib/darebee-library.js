// Comprehensive open workout & program catalog: Workouts, Training Plans, Programs, Challenges, Guides, Collections
// Native OpenGym community fitness routines.

export { DAREBEE_WORKOUTS, DAREBEE_PROGRAMS } from './darebee-data.js'


export const DAREBEE_PLANS = [
  {
    id: 'db-plan-001',
    name: 'Ironborn Weekly Split',
    desc: '4-day dumbbell split focusing on classic progressive overload and balanced hypertrophy.',
    badge: 'Dumbbells Only',
    schedule: [
      { day: 1, name: 'Chest & Triceps', workoutId: 'db-w-001' },
      { day: 2, name: 'Back & Biceps', workoutId: 'db-w-006' },
      { day: 3, name: 'Rest / Active Walk', rest: true },
      { day: 4, name: 'Legs & Core', workoutId: 'db-w-005' },
      { day: 5, name: 'Shoulders & Arms', workoutId: 'db-w-001' },
      { day: 6, name: 'HIIT Conditioning', workoutId: 'db-w-002' },
      { day: 0, name: 'Full Rest Day', rest: true }
    ]
  },
  {
    id: 'db-plan-002',
    name: 'Bodyweight Calisthenics Mastery',
    desc: 'Zero-equipment full body routine alternating strength sessions and combat conditioning.',
    badge: 'No Equipment',
    schedule: [
      { day: 1, name: 'The Threshing (Full Body)', workoutId: 'db-w-002' },
      { day: 2, name: 'Fighter Conditioning', workoutId: 'db-w-003' },
      { day: 3, name: 'Legs of Steel', workoutId: 'db-w-005' },
      { day: 4, name: 'Abs On Fire', workoutId: 'db-w-004' },
      { day: 5, name: 'Total Body HIIT', workoutId: 'db-w-008' },
      { day: 6, name: 'Desk & Posture Relief', workoutId: 'db-w-007' },
      { day: 0, name: 'Recovery Day', rest: true }
    ]
  },
  {
    id: 'db-plan-003',
    name: 'Push / Pull / Legs (Master Split)',
    desc: 'The gold standard 3-day split tuned for home training with dumbbells or bodyweight.',
    badge: 'Split Plan',
    schedule: [
      { day: 1, name: 'Push Focus', workoutId: 'db-w-001' },
      { day: 2, name: 'Rest / Core', workoutId: 'db-w-004' },
      { day: 3, name: 'Pull Focus', workoutId: 'db-w-006' },
      { day: 4, name: 'Rest Day', rest: true },
      { day: 5, name: 'Legs Focus', workoutId: 'db-w-005' },
      { day: 6, name: 'Cardio Engine', workoutId: 'db-w-008' },
      { day: 0, name: 'Rest Day', rest: true }
    ]
  }
]


export const DAREBEE_CHALLENGES = [
  {
    id: 'db-ch-pushups',
    name: '50 Push-ups a Day Challenge',
    desc: 'Complete 50 push-ups every single day for 30 days in as few sets as needed.',
    icon: 'dumbbell',
    targetType: 'reps',
    dailyTarget: 50,
    durationDays: 30
  },
  {
    id: 'db-ch-plank',
    name: '3-Minute Plank Challenge',
    desc: 'Progress from a 20-second elbow plank to a rock-solid 3-minute continuous hold.',
    icon: 'clock',
    targetType: 'seconds',
    dailyTarget: 60,
    durationDays: 30
  },
  {
    id: 'db-ch-squats',
    name: '100 Daily Squats Challenge',
    desc: 'Strengthen quads and glutes with 100 bodyweight squats daily.',
    icon: 'legs',
    targetType: 'reps',
    dailyTarget: 100,
    durationDays: 30
  },
  {
    id: 'db-ch-core',
    name: 'Core Crusher 30-Day',
    desc: 'Daily combination of sit-ups, leg raises, and flutter kicks to build unbreakable abs.',
    icon: 'sparkles',
    targetType: 'reps',
    dailyTarget: 40,
    durationDays: 30
  },
  {
    id: 'db-ch-daily-dare',
    name: 'The Daily Dare Challenge',
    desc: 'A fresh, surprising athletic dare every single day with extra credit for unbroken sets.',
    icon: 'flame',
    targetType: 'dare',
    dailyTarget: 1,
    durationDays: 30
  }
]

export const DAREBEE_GUIDES = [
  {
    id: 'db-guide-warmup',
    title: 'Universal 5-Minute Warm-up',
    category: 'Warmup & Mobility',
    duration: '5 min',
    summary: 'Essential dynamic movements before every resistance or cardio training session.',
    steps: [
      'Neck & Shoulder circles (30 seconds each direction)',
      'Torso twists with loose arms (45 seconds)',
      'Hip circles and shallow leg swings (60 seconds)',
      'Easy marching in place with high knees (60 seconds)',
      '10 light bodyweight squats and 10 arm openers'
    ]
  },
  {
    id: 'db-guide-cooldown',
    title: 'Post-Workout Full Body Cooldown',
    category: 'Recovery & Flexibility',
    duration: '6 min',
    summary: 'Static stretches to lower heart rate, lengthen muscles, and prevent post-exercise stiffness.',
    steps: [
      'Standing Quad Stretch (30 seconds per leg)',
      'Hamstring Forward Fold with relaxed neck (45 seconds)',
      'Cross-body Shoulder & Tricep Stretch (30 seconds each)',
      'Cobra Stretch for abdominal wall (45 seconds)',
      'Child’s Pose with deep belly breathing (60 seconds)'
    ]
  },
  {
    id: 'db-guide-pushup-form',
    title: 'The Perfect Push-up Guide',
    category: 'Technique',
    duration: 'Guide',
    summary: 'Master elbow angle, scapular movement, and core engagement to protect shoulders.',
    steps: [
      'Hands slightly wider than shoulder-width, fingers pointing slightly outwards.',
      'Maintain an arrow shape with elbows (~45° angle from torso, never flaring out at 90°).',
      'Engage glutes and brace abs so your body remains in a rigid plank.',
      'Lower until your chest touches or comes within 1 inch of the floor.',
      'Push through full palms to full extension without locking elbows violently.'
    ]
  },
  {
    id: 'db-guide-squat-form',
    title: 'Deep Squat Mechanics & Knee Safety',
    category: 'Technique',
    duration: 'Guide',
    summary: 'How to achieve full range of motion while maintaining spine neutrality and knee health.',
    steps: [
      'Stand feet shoulder-width apart, toes turned outward 15° to 30°.',
      'Initiate the movement by hinging hips back and simultaneously bending knees.',
      'Keep your chest high and eyes looking slightly ahead, not directly down.',
      'Track knees in the exact same direction as your toes.',
      'Descend until hip crease is below parallel, then drive through mid-foot.'
    ]
  }
]

export const DAREBEE_COLLECTIONS = [
  {
    id: 'db-col-no-equipment',
    title: 'Zero Equipment Heroes',
    desc: 'Workouts you can do anywhere, anytime without a single piece of gym gear.',
    workoutIds: ['db-w-002', 'db-w-003', 'db-w-004', 'db-w-005', 'db-w-008']
  },
  {
    id: 'db-col-heavy-dumbbells',
    title: 'Iron & Dumbbells',
    desc: 'Pure strength and muscle builder routines for home gyms and free weights.',
    workoutIds: ['db-w-001', 'db-w-006']
  },
  {
    id: 'db-col-office-travel',
    title: 'Travel & Desk Relievers',
    desc: 'Short, quiet, zero-sweat mobility routines for busy workdays and hotel stays.',
    workoutIds: ['db-w-007']
  },
  {
    id: 'db-col-combat',
    title: 'Fighter & Martial Arts',
    desc: 'Boxer conditioning, shadowboxing, speed drills, and combat core work.',
    workoutIds: ['db-w-003', 'db-w-002']
  }
]

export const DAILY_DARES = [
  { id: 'dd-1', title: '50 Side Plank Raises', desc: '25 each side. Fire up obliques and hip abductors.', extraCredit: 'In one unbroken set', target: 50, type: 'reps', muscle: 'core' },
  { id: 'dd-2', title: '40 High Knees', desc: 'Drive knees to hip height with quick ground contact.', extraCredit: 'Unbroken with high pace', target: 40, type: 'reps', muscle: 'full body' },
  { id: 'dd-3', title: '2-Minute Wall Sit', desc: 'Thighs parallel to floor, back flat against wall.', extraCredit: 'Without hands touching thighs', target: 120, type: 'seconds', muscle: 'legs' },
  { id: 'dd-4', title: '30 Push-ups', desc: 'Chest to deck, full elbow extension at top.', extraCredit: 'In a single continuous set', target: 30, type: 'reps', muscle: 'chest' },
  { id: 'dd-5', title: '50 Flutter Kicks', desc: 'Legs straight, lower back pressed firmly down.', extraCredit: 'Without feet touching the floor', target: 50, type: 'reps', muscle: 'core' },
  { id: 'dd-6', title: '60-Second Elbow Plank', desc: 'Rigid body line, glutes clamped, elbows under shoulders.', extraCredit: 'With toes together', target: 60, type: 'seconds', muscle: 'core' },
  { id: 'dd-7', title: '40 Jumping Lunges', desc: 'Explosive split switch in the air, landing softly.', extraCredit: '20 each leg unbroken', target: 40, type: 'reps', muscle: 'legs' },
  { id: 'dd-8', title: '100 Speed Punches', desc: 'Rotate hips with snappy jabs and crosses.', extraCredit: 'Max velocity without stopping', target: 100, type: 'reps', muscle: 'arms' },
  { id: 'dd-9', title: '30 Superman Back Extensions', desc: 'Lift chest and thighs simultaneously, squeeze glutes.', extraCredit: '2-second pause at top of each rep', target: 30, type: 'reps', muscle: 'back' },
  { id: 'dd-10', title: '20 Burpees', desc: 'Chest to floor with jump and clap overhead.', extraCredit: 'Under 60 seconds total', target: 20, type: 'reps', muscle: 'full body' },
  { id: 'dd-11', title: '50 Air Squats', desc: 'Hip crease below knees, chest proud, heels grounded.', extraCredit: 'In a single unbroken set', target: 50, type: 'reps', muscle: 'legs' },
  { id: 'dd-12', title: '40 Russian Twists', desc: 'Torso angled back 45°, rotate ribcage side to side.', extraCredit: 'With heels kept elevated in air', target: 40, type: 'reps', muscle: 'core' },
  { id: 'dd-13', title: '60-Second Dead Bug Hold', desc: 'Opposite arm and leg extended, spine glued to floor.', extraCredit: 'Zero arch in lower back throughout', target: 60, type: 'seconds', muscle: 'core' },
  { id: 'dd-14', title: '30 Diamond Push-ups', desc: 'Thumbs and index fingers touching under chest.', extraCredit: 'Full range unbroken set', target: 30, type: 'reps', muscle: 'arms' },
  { id: 'dd-15', title: '40 Side Chops', desc: 'Dynamic torso rotation, swing through hips.', extraCredit: '20 per side continuous', target: 40, type: 'reps', muscle: 'full body' },
  { id: 'dd-16', title: '50 Calf Raises', desc: 'Slow tempo on balls of feet, squeeze at peak.', extraCredit: 'Unbroken with 1-second top squeeze', target: 50, type: 'reps', muscle: 'legs' },
  { id: 'dd-17', title: '40 Bicycle Crunches', desc: 'Armpit toward opposite knee, slow deliberate rhythm.', extraCredit: 'In one unbroken sequence', target: 40, type: 'reps', muscle: 'core' },
  { id: 'dd-18', title: '30 Plank Shoulder Taps', desc: 'Minimize hip sway as hand taps opposite shoulder.', extraCredit: '15 each side without rocking', target: 30, type: 'reps', muscle: 'core' },
  { id: 'dd-19', title: '50 March Steps with High Knees', desc: 'Drive knees high with strong athletic arm swing.', extraCredit: 'With brisk marching cadence', target: 50, type: 'reps', muscle: 'legs' },
  { id: 'dd-20', title: '30 Single-Leg Glute Bridges', desc: '15 per leg. Drive through heel, clamp glute at top.', extraCredit: 'Unbroken with level pelvis', target: 30, type: 'reps', muscle: 'lower body' },
  { id: 'dd-21', title: '40 Mountain Climbers', desc: 'Drive knees directly under chest in athletic plank.', extraCredit: 'Sprint pace unbroken', target: 40, type: 'reps', muscle: 'full body' },
  { id: 'dd-22', title: '20 Squat Jumps', desc: 'Drop deep, explode upward reaching for ceiling.', extraCredit: 'Max height on every repetition', target: 20, type: 'reps', muscle: 'legs' },
  { id: 'dd-23', title: '30 Tricep Bench Dips', desc: 'Lower till elbows reach 90°, press through palms.', extraCredit: 'Feet elevated on chair/stool', target: 30, type: 'reps', muscle: 'arms' },
  { id: 'dd-24', title: '50 Arm Circles', desc: '25 forward, 25 backward. Wide arm wingspan.', extraCredit: 'Without lowering arms between directions', target: 50, type: 'reps', muscle: 'shoulders' },
  { id: 'dd-25', title: '40 Leg Raises', desc: 'Raise to 90°, lower slowly without touching floor.', extraCredit: 'Hands under head, not glutes', target: 40, type: 'reps', muscle: 'core' },
  { id: 'dd-26', title: '30 Jumping Jacks + 30 Seal Claps', desc: 'Full cardiovascular coordination drill.', extraCredit: '60 total unbroken', target: 60, type: 'reps', muscle: 'full body' },
  { id: 'dd-27', title: '2-Minute Horse Stance Hold', desc: 'Wide stance, deep bend, spine upright.', extraCredit: 'Arms held extended forward', target: 120, type: 'seconds', muscle: 'legs' },
  { id: 'dd-28', title: '40 Heel Touches', desc: 'Lie back, reach side to side grazing ankles.', extraCredit: 'Shoulders elevated off floor entire time', target: 40, type: 'reps', muscle: 'core' },
  { id: 'dd-29', title: '30 Incline Push-ups', desc: 'Hands on bench or counter, smooth pumping reps.', extraCredit: 'In one unbroken set', target: 30, type: 'reps', muscle: 'chest' },
  { id: 'dd-30', title: '50 Shadowbox Combos', desc: 'Jab, Cross, Hook, Slip combinations.', extraCredit: 'Full combat intensity', target: 50, type: 'reps', muscle: 'upper body' }
]

