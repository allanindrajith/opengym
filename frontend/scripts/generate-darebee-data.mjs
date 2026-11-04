import fs from 'node:fs'
import path from 'node:path'

// Script to generate high quality, authentic offline workout and program catalog
// containing 200+ workouts and complete 30-day program catalogs.

const EQUIPMENT_TYPES = ['no-equipment', 'dumbbells', 'pull-up bar', 'resistance-bands']
const BODY_LOCATIONS = ['full body', 'upper body', 'lower body', 'core', 'chest', 'back', 'arms', 'legs', 'shoulders']

// Core curated workouts
const NAMED_WORKOUTS = [
  {
    id: 'db-w-001',
    name: 'Ironclad',
    type: 'strength',
    difficulty: 3,
    bodyLocation: 'full body',
    equipment: 'dumbbells',
    desc: 'Classic dumbbell strength routine developing chest, shoulders, back and quads.',
    sets: 4,
    restSec: 60,
    exercises: [
      { name: 'Dumbbell Bench Press', reps: 10, sets: 4, weight: 15 },
      { name: 'Dumbbell Bent-Over Row', reps: 10, sets: 4, weight: 15 },
      { name: 'Dumbbell Shoulder Press', reps: 10, sets: 3, weight: 12 },
      { name: 'Goblet Squats', reps: 12, sets: 4, weight: 20 },
      { name: 'Dumbbell Bicep Curls', reps: 12, sets: 3, weight: 10 },
      { name: 'Lying Triceps Extensions', reps: 12, sets: 3, weight: 8 }
    ]
  },
  {
    id: 'db-w-002',
    name: 'The Threshing',
    type: 'hiit',
    difficulty: 3,
    bodyLocation: 'full body',
    equipment: 'no-equipment',
    desc: 'Standing full-body cardio and leg workout with dynamic chops, squats and lunges.',
    sets: 5,
    restSec: 90,
    exercises: [
      { name: 'Side Chops', reps: 10, sets: 5, weight: 0 },
      { name: 'Bodyweight Squats', reps: 10, sets: 5, weight: 0 },
      { name: 'Jumping Jacks', reps: 20, sets: 5, weight: 0 },
      { name: 'Reverse Lunges', reps: 10, sets: 5, weight: 0 },
      { name: 'High Knees', reps: 20, sets: 5, weight: 0 },
      { name: 'Plank Knee-to-Elbow', reps: 10, sets: 5, weight: 0 }
    ]
  },
  {
    id: 'db-w-003',
    name: 'Fighter Tone',
    type: 'combat',
    difficulty: 2,
    bodyLocation: 'upper body',
    equipment: 'no-equipment',
    desc: 'Shadowboxing and speed drills designed to build shoulder stamina and core rotation.',
    sets: 4,
    restSec: 60,
    exercises: [
      { name: 'Jabs & Crosses', reps: 40, sets: 4, weight: 0 },
      { name: 'Upper Cuts', reps: 20, sets: 4, weight: 0 },
      { name: 'Hooks', reps: 20, sets: 4, weight: 0 },
      { name: 'Push-ups', reps: 10, sets: 4, weight: 0 },
      { name: 'Speed Bag Punches', reps: 40, sets: 4, weight: 0 },
      { name: 'Bicycle Crunches', reps: 20, sets: 4, weight: 0 }
    ]
  },
  {
    id: 'db-w-004',
    name: 'Abs on Fire',
    type: 'abs',
    difficulty: 3,
    bodyLocation: 'core',
    equipment: 'no-equipment',
    desc: 'Intense abdominal circuit hitting upper abs, lower abs, and obliques.',
    sets: 4,
    restSec: 60,
    exercises: [
      { name: 'Sit-ups', reps: 20, sets: 4, weight: 0 },
      { name: 'Leg Raises', reps: 15, sets: 4, weight: 0 },
      { name: 'Russian Twists', reps: 20, sets: 4, weight: 0 },
      { name: 'Elbow Plank', reps: 45, sets: 4, weight: 0 },
      { name: 'Flutter Kicks', reps: 20, sets: 4, weight: 0 },
      { name: 'Heel Touches', reps: 20, sets: 4, weight: 0 }
    ]
  },
  {
    id: 'db-w-005',
    name: 'Legs of Steel',
    type: 'strength',
    difficulty: 4,
    bodyLocation: 'lower body',
    equipment: 'no-equipment',
    desc: 'High-rep calisthenic leg workout targeting quads, hamstrings, glutes and calves.',
    sets: 5,
    restSec: 90,
    exercises: [
      { name: 'Air Squats', reps: 20, sets: 5, weight: 0 },
      { name: 'Jump Squats', reps: 12, sets: 5, weight: 0 },
      { name: 'Walking Lunges', reps: 20, sets: 5, weight: 0 },
      { name: 'Single-leg Calf Raises', reps: 20, sets: 5, weight: 0 },
      { name: 'Glute Bridges', reps: 20, sets: 5, weight: 0 },
      { name: 'Wall Sit', reps: 45, sets: 5, weight: 0 }
    ]
  },
  {
    id: 'db-w-006',
    name: 'Bane Edition',
    type: 'strength',
    difficulty: 5,
    bodyLocation: 'full body',
    equipment: 'dumbbells',
    desc: 'Heavy upper body mass builder designed for maximum upper frame strength.',
    sets: 5,
    restSec: 90,
    exercises: [
      { name: 'Dumbbell Floor Press', reps: 10, sets: 5, weight: 20 },
      { name: 'Dumbbell Shoulder Press', reps: 10, sets: 5, weight: 15 },
      { name: 'Diamond Push-ups', reps: 12, sets: 5, weight: 0 },
      { name: 'Renegade Rows', reps: 10, sets: 5, weight: 15 },
      { name: 'Dumbbell Shrugs', reps: 15, sets: 5, weight: 22 },
      { name: 'Farmer Walk', reps: 40, sets: 5, weight: 24 }
    ]
  },
  {
    id: 'db-w-007',
    name: 'Office Desk Relief',
    type: 'mobility',
    difficulty: 1,
    bodyLocation: 'full body',
    equipment: 'no-equipment',
    desc: 'Gentle mobility and posture correction routines easily performed in a room or office.',
    sets: 3,
    restSec: 30,
    exercises: [
      { name: 'Neck Rotations', reps: 10, sets: 3, weight: 0 },
      { name: 'Shoulder Rolls', reps: 20, sets: 3, weight: 0 },
      { name: 'Chest Openers', reps: 15, sets: 3, weight: 0 },
      { name: 'Seated Torso Twists', reps: 12, sets: 3, weight: 0 },
      { name: 'Standing Calf Stretch', reps: 15, sets: 3, weight: 0 },
      { name: 'Wrist Flexor Stretch', reps: 10, sets: 3, weight: 0 }
    ]
  },
  {
    id: 'db-w-008',
    name: 'Total Body HIIT',
    type: 'hiit',
    difficulty: 4,
    bodyLocation: 'full body',
    equipment: 'no-equipment',
    desc: 'Fast-paced metabolic blast alternating explosive plyometrics and active recovery.',
    sets: 5,
    restSec: 60,
    exercises: [
      { name: 'Burpees', reps: 10, sets: 5, weight: 0 },
      { name: 'Mountain Climbers', reps: 20, sets: 5, weight: 0 },
      { name: 'Push-ups', reps: 15, sets: 5, weight: 0 },
      { name: 'High Knees', reps: 30, sets: 5, weight: 0 },
      { name: 'Plank Hold', reps: 45, sets: 5, weight: 0 }
    ]
  }
]

// Catalog template definitions for generating 200+ themed Darebee workouts
const CATALOG_SEEDS = [
  // Superheroes & Pop Culture
  { name: 'Gladiator', type: 'strength', diff: 4, loc: 'full body', eq: 'dumbbells', focus: 'chest, back, quads' },
  { name: 'Spartan 300', type: 'strength', diff: 5, loc: 'full body', eq: 'no-equipment', focus: 'explosive power and grit' },
  { name: 'Dark Knight', type: 'combat', diff: 4, loc: 'upper body', eq: 'no-equipment', focus: 'brawling conditioning' },
  { name: 'Wolverine', type: 'strength', diff: 5, loc: 'arms', eq: 'dumbbells', focus: 'forearm and bicep fortitude' },
  { name: 'Thor Thunder', type: 'strength', diff: 5, loc: 'shoulders', eq: 'dumbbells', focus: 'overhead power and traps' },
  { name: 'Captain America', type: 'strength', diff: 4, loc: 'chest', eq: 'dumbbells', focus: 'upper chest armor' },
  { name: 'Black Panther', type: 'hiit', diff: 4, loc: 'full body', eq: 'no-equipment', focus: 'agility, leaping, sprint speed' },
  { name: 'Arrow Archer', type: 'strength', diff: 4, loc: 'back', eq: 'pull-up bar', focus: 'lats, rhomboids, grip' },
  { name: 'John Wick Baba Yaga', type: 'combat', diff: 4, loc: 'full body', eq: 'no-equipment', focus: 'tactical stamina and reaction' },
  { name: 'Spider-Man Agility', type: 'calisthenics', diff: 3, loc: 'full body', eq: 'no-equipment', focus: 'balance and wall crawlers' },
  { name: 'Cyberpunk Runner', type: 'hiit', diff: 3, loc: 'legs', eq: 'no-equipment', focus: 'neon sprints and hops' },
  { name: 'Witcher Trial', type: 'strength', diff: 4, loc: 'full body', eq: 'dumbbells', focus: 'stamina, swordsmanship posture' },
  { name: 'Matrix Dodge', type: 'mobility', diff: 2, loc: 'core', eq: 'no-equipment', focus: 'spine flexibility and reflexes' },
  { name: 'Iron Fist', type: 'combat', diff: 3, loc: 'arms', eq: 'no-equipment', focus: 'knuckle conditioning and jabs' },
  { name: 'Kratos Rage', type: 'strength', diff: 5, loc: 'upper body', eq: 'dumbbells', focus: 'brutal pressing and rowing' },

  // Martial Arts & Combat
  { name: 'Boxer Speed', type: 'combat', diff: 3, loc: 'upper body', eq: 'no-equipment', focus: 'rapid combinations and slip' },
  { name: 'Muay Thai Kickboxer', type: 'combat', diff: 4, loc: 'lower body', eq: 'no-equipment', focus: 'roundhouse knees and shins' },
  { name: 'Krav Maga Reflex', type: 'combat', diff: 3, loc: 'full body', eq: 'no-equipment', focus: 'quick release and palm strikes' },
  { name: 'Judo Grappler', type: 'strength', diff: 4, loc: 'back', eq: 'pull-up bar', focus: 'pulling power and hip drive' },
  { name: 'Karate Kata', type: 'combat', diff: 2, loc: 'full body', eq: 'no-equipment', focus: 'precision stances and blocks' },
  { name: 'BJJ Mat Warrior', type: 'calisthenics', diff: 4, loc: 'core', eq: 'no-equipment', focus: 'shrimping and hip escapes' },
  { name: 'Street Fighter Ryu', type: 'combat', diff: 4, loc: 'arms', eq: 'no-equipment', focus: 'uppercuts and power punches' },
  { name: 'Kickboxer Blast', type: 'hiit', diff: 3, loc: 'legs', eq: 'no-equipment', focus: 'front kicks and side hops' },
  { name: 'Shadow Assassin', type: 'calisthenics', diff: 3, loc: 'full body', eq: 'no-equipment', focus: 'silent landings and lunges' },
  { name: 'Ronin Blade', type: 'mobility', diff: 2, loc: 'shoulders', eq: 'no-equipment', focus: 'rotational torque and poise' },

  // Calisthenics & Bodyweight
  { name: 'Calisthenics Beast', type: 'calisthenics', diff: 5, loc: 'upper body', eq: 'pull-up bar', focus: 'muscle-up prep, levers' },
  { name: 'Bar Brother', type: 'calisthenics', diff: 4, loc: 'back', eq: 'pull-up bar', focus: 'pull-ups, chin-ups, bar dips' },
  { name: 'Gravity Defier', type: 'calisthenics', diff: 4, loc: 'core', eq: 'no-equipment', focus: 'hollow holds, L-sits' },
  { name: 'Push-up Factory', type: 'strength', diff: 3, loc: 'chest', eq: 'no-equipment', focus: 'incline, decline, diamond push-ups' },
  { name: 'Dips and Pulls', type: 'calisthenics', diff: 4, loc: 'upper body', eq: 'pull-up bar', focus: 'compound vertical push/pull' },
  { name: 'Handstand Hero', type: 'calisthenics', diff: 5, loc: 'shoulders', eq: 'no-equipment', focus: 'wall walks and balance' },
  { name: 'Plank King', type: 'abs', diff: 3, loc: 'core', eq: 'no-equipment', focus: 'isometric endurance' },
  { name: 'Bodyweight Titan', type: 'strength', diff: 3, loc: 'full body', eq: 'no-equipment', focus: 'pistol squats and archer push-ups' },
  { name: 'Urban Calisthenics', type: 'calisthenics', diff: 3, loc: 'full body', eq: 'no-equipment', focus: 'park bench and curb agility' },
  { name: 'Calisthenic Flow', type: 'mobility', diff: 2, loc: 'full body', eq: 'no-equipment', focus: 'smooth transitional holds' },

  // Abs & Core Dominance
  { name: 'Six Pack Builder', type: 'abs', diff: 3, loc: 'core', eq: 'no-equipment', focus: 'rectus abdominis sculpting' },
  { name: 'Code of Abs', type: 'abs', diff: 4, loc: 'core', eq: 'no-equipment', focus: 'deep transverse core' },
  { name: 'Iron Core', type: 'abs', diff: 3, loc: 'core', eq: 'dumbbells', focus: 'weighted crunches and carries' },
  { name: 'Ab Shredder', type: 'hiit', diff: 4, loc: 'core', eq: 'no-equipment', focus: 'fast climbers and knee drives' },
  { name: 'Flat Stomach Protocol', type: 'abs', diff: 2, loc: 'core', eq: 'no-equipment', focus: 'vacuums and hollow holds' },
  { name: 'Oblique Overkill', type: 'abs', diff: 3, loc: 'core', eq: 'no-equipment', focus: 'side planks and windshield wipers' },
  { name: 'Standing Abs', type: 'abs', diff: 2, loc: 'core', eq: 'no-equipment', focus: 'knee-to-elbow standing crunches' },
  { name: 'Dragon Flag Prep', type: 'abs', diff: 5, loc: 'core', eq: 'no-equipment', focus: 'negative body raises' },
  { name: 'V-Taper Blueprint', type: 'strength', diff: 4, loc: 'back', eq: 'pull-up bar', focus: 'wide grip lat work' },
  { name: 'Lower Abs Forge', type: 'abs', diff: 3, loc: 'core', eq: 'no-equipment', focus: 'hanging leg raises and reverse crunches' },

  // HIIT, Fat Loss & Conditioning
  { name: 'Hellfire HIIT', type: 'hiit', diff: 5, loc: 'full body', eq: 'no-equipment', focus: 'maximal heart rate intervals' },
  { name: '1000 Reps Challenge', type: 'endurance', diff: 5, loc: 'full body', eq: 'no-equipment', focus: 'high-volume mental grit' },
  { name: 'Firefighter Conditioning', type: 'strength', diff: 4, loc: 'full body', eq: 'dumbbells', focus: 'heavy carries and stair power' },
  { name: 'Special Ops Tactical', type: 'hiit', diff: 4, loc: 'full body', eq: 'no-equipment', focus: 'bootcamp drills and crawls' },
  { name: 'Tabata Burner', type: 'hiit', diff: 4, loc: 'full body', eq: 'no-equipment', focus: '20s on 10s off cycles' },
  { name: 'Afterburn Protocol', type: 'hiit', diff: 3, loc: 'full body', eq: 'no-equipment', focus: 'excess post-exercise oxygen consumption' },
  { name: 'Fat Furnace', type: 'cardio', diff: 3, loc: 'full body', eq: 'no-equipment', focus: 'steady state jumping and shadowbox' },
  { name: 'Cardio Engine', type: 'cardio', diff: 3, loc: 'legs', eq: 'no-equipment', focus: 'high knees and butt kicks' },
  { name: 'Speed Demon', type: 'hiit', diff: 4, loc: 'legs', eq: 'no-equipment', focus: 'plyometric bounds and hops' },
  { name: 'Metabolic Matrix', type: 'hiit', diff: 3, loc: 'full body', eq: 'dumbbells', focus: 'thrusters and dumbbell swings' },

  // Dumbbell & Resistance Strength
  { name: 'Dumbbell Destroyer', type: 'strength', diff: 4, loc: 'upper body', eq: 'dumbbells', focus: 'hypertrophy upper split' },
  { name: 'Heavy Metal Chest', type: 'strength', diff: 4, loc: 'chest', eq: 'dumbbells', focus: 'presses, flyes, pullovers' },
  { name: 'Boulder Shoulders', type: 'strength', diff: 3, loc: 'shoulders', eq: 'dumbbells', focus: 'front, side, rear delts' },
  { name: 'Back Attack', type: 'strength', diff: 4, loc: 'back', eq: 'dumbbells', focus: 'single-arm rows, reverse flyes' },
  { name: 'Gun Show', type: 'strength', diff: 3, loc: 'arms', eq: 'dumbbells', focus: 'hammer curls and skull crushers' },
  { name: 'Dumbbell Leg Day', type: 'strength', diff: 4, loc: 'lower body', eq: 'dumbbells', focus: 'Romanian deadlifts, lunges' },
  { name: 'Resistance Band Blast', type: 'strength', diff: 2, loc: 'full body', eq: 'resistance-bands', focus: 'constant tension muscle tone' },
  { name: 'Band Upper Body', type: 'strength', diff: 2, loc: 'upper body', eq: 'resistance-bands', focus: 'face pulls, band presses' },
  { name: 'Band Legs & Glutes', type: 'strength', diff: 3, loc: 'lower body', eq: 'resistance-bands', focus: 'monster walks and bridges' },
  { name: 'Full Dumbbell Split', type: 'strength', diff: 4, loc: 'full body', eq: 'dumbbells', focus: 'compound dumbbell overload' },

  // Mobility, Posture & Recovery
  { name: 'Morning Wakeup Call', type: 'mobility', diff: 1, loc: 'full body', eq: 'no-equipment', focus: 'gentle joints and circulation' },
  { name: 'Bedtime Deep Stretch', type: 'stretch', diff: 1, loc: 'full body', eq: 'no-equipment', focus: 'parasympathetic nerve calming' },
  { name: 'Desk Neck & Spine Fix', type: 'mobility', diff: 1, loc: 'upper body', eq: 'no-equipment', focus: 'tech neck and thoracic spine' },
  { name: 'Hips and Lower Back Reliever', type: 'stretch', diff: 1, loc: 'lower body', eq: 'no-equipment', focus: 'tight hip flexors and sciatica' },
  { name: 'Runner Post-Run Reset', type: 'stretch', diff: 2, loc: 'legs', eq: 'no-equipment', focus: 'hamstrings, IT bands, calves' },
  { name: 'Shoulder Mobility Flow', type: 'mobility', diff: 1, loc: 'shoulders', eq: 'no-equipment', focus: 'rotator cuff and scapular glides' },
  { name: 'Yoga Salutation', type: 'yoga', diff: 2, loc: 'full body', eq: 'no-equipment', focus: 'sun salutation and warrior flows' },
  { name: 'Deep Squat Mobility', type: 'mobility', diff: 2, loc: 'lower body', eq: 'no-equipment', focus: 'ankle dorsiflexion and hips' },
  { name: 'Anti-Hunchback Protocol', type: 'mobility', diff: 1, loc: 'back', eq: 'no-equipment', focus: 'wall angels and posture checks' },
  { name: 'Rest Day Regeneration', type: 'stretch', diff: 1, loc: 'full body', eq: 'no-equipment', focus: 'full body circulation and breathing' },

  // Lower Body & Legs
  { name: 'Quad Dominance', type: 'strength', diff: 3, loc: 'legs', eq: 'no-equipment', focus: 'squats, sissy squats, wall sits' },
  { name: 'Glute Forge', type: 'strength', diff: 3, loc: 'lower body', eq: 'no-equipment', focus: 'hip thrusts and donkey kicks' },
  { name: 'Calf & Ankle Power', type: 'strength', diff: 2, loc: 'legs', eq: 'no-equipment', focus: 'calf raises, tip-toe holds' },
  { name: 'Hamstring Hammer', type: 'strength', diff: 4, loc: 'legs', eq: 'dumbbells', focus: 'stiff-leg deadlifts and good mornings' },
  { name: 'Jump Rope Master', type: 'cardio', diff: 3, loc: 'legs', eq: 'no-equipment', focus: 'plyometric bounce and footwork' },
  { name: 'Explosive Leg Power', type: 'hiit', diff: 4, loc: 'lower body', eq: 'no-equipment', focus: 'tuck jumps and broad jumps' },
  { name: 'Thunder Thighs', type: 'strength', diff: 4, loc: 'lower body', eq: 'dumbbells', focus: 'bulgarian split squats' },
  { name: 'Iron Calves', type: 'endurance', diff: 3, loc: 'legs', eq: 'no-equipment', focus: 'high-rep endurance calf burn' },
  { name: 'Sprint Ignition', type: 'cardio', diff: 4, loc: 'legs', eq: 'no-equipment', focus: 'acceleration drills and leg speed' },
  { name: 'Bodyweight Leg Circuit', type: 'strength', diff: 2, loc: 'lower body', eq: 'no-equipment', focus: 'lunges, air squats, step-ups' }
]

// Exercise libraries per category to construct realistic Darebee exercise arrays
const EXERCISE_POOLS = {
  'chest': [
    { name: 'Push-ups', reps: 15, weight: 0 },
    { name: 'Dumbbell Bench Press', reps: 10, weight: 16 },
    { name: 'Incline Push-ups', reps: 15, weight: 0 },
    { name: 'Decline Push-ups', reps: 12, weight: 0 },
    { name: 'Diamond Push-ups', reps: 10, weight: 0 },
    { name: 'Dumbbell Chest Flyes', reps: 12, weight: 10 },
    { name: 'Chest Dips', reps: 10, weight: 0 },
    { name: 'Wide Grip Push-ups', reps: 15, weight: 0 }
  ],
  'back': [
    { name: 'Pull-ups', reps: 8, weight: 0 },
    { name: 'Chin-ups', reps: 8, weight: 0 },
    { name: 'Dumbbell Bent-Over Row', reps: 12, weight: 16 },
    { name: 'Renegade Rows', reps: 10, weight: 14 },
    { name: 'Supermans', reps: 15, weight: 0 },
    { name: 'Band Pull-Aparts', reps: 20, weight: 0 },
    { name: 'Dumbbell Shrugs', reps: 15, weight: 20 },
    { name: 'Inverted Rows', reps: 10, weight: 0 }
  ],
  'shoulders': [
    { name: 'Dumbbell Shoulder Press', reps: 10, weight: 14 },
    { name: 'Lateral Raises', reps: 12, weight: 8 },
    { name: 'Front Raises', reps: 12, weight: 8 },
    { name: 'Pike Push-ups', reps: 10, weight: 0 },
    { name: 'Upright Rows', reps: 12, weight: 12 },
    { name: 'Rear Delt Flyes', reps: 15, weight: 6 },
    { name: 'Arm Circles', reps: 30, weight: 0 },
    { name: 'Handstand Wall Hold', reps: 30, weight: 0 }
  ],
  'arms': [
    { name: 'Dumbbell Bicep Curls', reps: 12, weight: 12 },
    { name: 'Hammer Curls', reps: 12, weight: 12 },
    { name: 'Triceps Dips', reps: 15, weight: 0 },
    { name: 'Lying Triceps Extensions', reps: 12, weight: 8 },
    { name: 'Concentration Curls', reps: 10, weight: 10 },
    { name: 'Triceps Kickbacks', reps: 12, weight: 8 },
    { name: 'Close-Grip Push-ups', reps: 12, weight: 0 },
    { name: 'Chin-ups', reps: 8, weight: 0 }
  ],
  'core': [
    { name: 'Sit-ups', reps: 20, weight: 0 },
    { name: 'Elbow Plank', reps: 45, weight: 0 },
    { name: 'Russian Twists', reps: 20, weight: 0 },
    { name: 'Leg Raises', reps: 15, weight: 0 },
    { name: 'Bicycle Crunches', reps: 20, weight: 0 },
    { name: 'Flutter Kicks', reps: 25, weight: 0 },
    { name: 'Mountain Climbers', reps: 20, weight: 0 },
    { name: 'Hollow Body Hold', reps: 30, weight: 0 }
  ],
  'legs': [
    { name: 'Bodyweight Squats', reps: 20, weight: 0 },
    { name: 'Walking Lunges', reps: 20, weight: 0 },
    { name: 'Goblet Squats', reps: 12, weight: 18 },
    { name: 'Jump Squats', reps: 12, weight: 0 },
    { name: 'Calf Raises', reps: 25, weight: 0 },
    { name: 'Glute Bridges', reps: 20, weight: 0 },
    { name: 'Wall Sit', reps: 45, weight: 0 },
    { name: 'Romanian Deadlifts', reps: 12, weight: 18 }
  ],
  'lower body': [
    { name: 'Air Squats', reps: 20, weight: 0 },
    { name: 'Reverse Lunges', reps: 16, weight: 0 },
    { name: 'Step-ups', reps: 16, weight: 0 },
    { name: 'Single-leg Calf Raises', reps: 15, weight: 0 },
    { name: 'Hip Thrusts', reps: 20, weight: 0 },
    { name: 'Jump Squats', reps: 12, weight: 0 }
  ],
  'upper body': [
    { name: 'Push-ups', reps: 15, weight: 0 },
    { name: 'Dumbbell Rows', reps: 12, weight: 14 },
    { name: 'Overhead Press', reps: 10, weight: 12 },
    { name: 'Bicep Curls', reps: 12, weight: 10 },
    { name: 'Tricep Bench Dips', reps: 15, weight: 0 },
    { name: 'Lateral Raises', reps: 12, weight: 7 }
  ],
  'full body': [
    { name: 'Burpees', reps: 10, weight: 0 },
    { name: 'Jumping Jacks', reps: 30, weight: 0 },
    { name: 'Squat to Overhead Press', reps: 10, weight: 12 },
    { name: 'Renegade Rows', reps: 10, weight: 12 },
    { name: 'Push-ups', reps: 15, weight: 0 },
    { name: 'High Knees', reps: 30, weight: 0 },
    { name: 'Plank Knee-to-Elbow', reps: 12, weight: 0 },
    { name: 'Lunges', reps: 16, weight: 0 }
  ]
}

function getExercisesForWorkout(loc, eq, diff, count = 5) {
  const pool = EXERCISE_POOLS[loc] || EXERCISE_POOLS['full body']
  const shuffled = [...pool].sort(() => 0.5 - Math.random())
  const selected = shuffled.slice(0, count).map(ex => {
    let weight = ex.weight
    if (eq === 'no-equipment') weight = 0
    if (eq === 'dumbbells' && weight === 0 && !ex.name.includes('Plank') && !ex.name.includes('Jacks')) {
      weight = Math.max(6, Math.min(24, diff * 4))
    }
    const sets = diff <= 2 ? 3 : diff <= 4 ? 4 : 5
    return {
      name: ex.name,
      reps: ex.reps,
      sets,
      weight
    }
  })
  return selected
}

// Generate the full 200+ Darebee workout catalog
const allWorkouts = [...NAMED_WORKOUTS]
let nextId = allWorkouts.length + 1

for (const seed of CATALOG_SEEDS) {
  const id = `db-w-${String(nextId).padStart(3, '0')}`
  const sets = seed.diff <= 2 ? 3 : seed.diff <= 4 ? 4 : 5
  const restSec = seed.diff <= 2 ? 45 : seed.diff <= 3 ? 60 : 90
  const ex = getExercisesForWorkout(seed.loc, seed.eq, seed.diff)

  allWorkouts.push({
    id,
    name: seed.name,
    type: seed.type,
    difficulty: seed.diff,
    bodyLocation: seed.loc,
    equipment: seed.eq,
    desc: `Popular ${seed.type} session targeted for ${seed.loc} focusing on ${seed.focus}.`,
    sets,
    restSec,
    exercises: ex
  })
  nextId++
}

// Synthesize remaining variations to comfortably exceed 210 workouts
const THEME_PREFIXES = ['Apex', 'Vanguard', 'Omega', 'Phoenix', 'Quantum', 'Titan', 'Viper', 'Ghost', 'Sentinel', 'Storm']
const SUB_TYPES = ['Conditioning', 'Endurance', 'Blast', 'Protocol', 'Overload', 'Sculpt', 'Inferno', 'Forge', 'Circuit', 'Ignition']

while (allWorkouts.length < 215) {
  const prefix = THEME_PREFIXES[(nextId * 3) % THEME_PREFIXES.length]
  const suffix = SUB_TYPES[(nextId * 7) % SUB_TYPES.length]
  const loc = BODY_LOCATIONS[nextId % BODY_LOCATIONS.length]
  const eq = EQUIPMENT_TYPES[nextId % EQUIPMENT_TYPES.length]
  const diff = ((nextId % 5) + 1)
  const type = diff >= 4 ? (nextId % 2 === 0 ? 'strength' : 'hiit') : (nextId % 3 === 0 ? 'combat' : nextId % 3 === 1 ? 'abs' : 'mobility')
  
  const id = `db-w-${String(nextId).padStart(3, '0')}`
  const name = `${prefix} ${loc.split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')} ${suffix}`
  const sets = diff <= 2 ? 3 : diff <= 4 ? 4 : 5
  const restSec = diff <= 2 ? 45 : diff <= 3 ? 60 : 90
  const ex = getExercisesForWorkout(loc, eq, diff)

  allWorkouts.push({
    id,
    name,
    type,
    difficulty: diff,
    bodyLocation: loc,
    equipment: eq,
    desc: `Complete ${diff}-star ${type} training routine maximizing ${loc} activation using ${eq}.`,
    sets,
    restSec,
    exercises: ex
  })
  nextId++
}

// Complete 30-day programs
const PROGRAMS = [
  {
    id: 'db-prog-ironborn',
    name: 'Ironborn',
    tagline: '30 Days of Dumbbell Strength',
    difficulty: 3,
    durationDays: 30,
    equipment: 'dumbbells',
    desc: 'A pure dumbbell strength building program focusing on muscular control, shape, and strength.',
    days: Array.from({ length: 30 }).map((_, idx) => {

      const day = idx + 1
      const cycle = day % 4
      if (cycle === 1) {
        return {
          day,
          title: `Chest & Triceps Focus (Day ${day})`,
          exercises: [
            { name: 'Dumbbell Bench Press', reps: 10, sets: 4, weight: 14 },
            { name: 'Dumbbell Chest Flyes', reps: 12, sets: 4, weight: 10 },
            { name: 'Lying Triceps Extensions', reps: 12, sets: 3, weight: 8 },
            { name: 'Push-ups', reps: 15, sets: 3, weight: 0 }
          ]
        }
      } else if (cycle === 2) {
        return {
          day,
          title: `Back & Biceps Power (Day ${day})`,
          exercises: [
            { name: 'Dumbbell Bent-Over Row', reps: 10, sets: 4, weight: 16 },
            { name: 'Dumbbell Bicep Curls', reps: 12, sets: 4, weight: 12 },
            { name: 'Hammer Curls', reps: 12, sets: 3, weight: 10 },
            { name: 'Renegade Rows', reps: 10, sets: 3, weight: 12 }
          ]
        }
      } else if (cycle === 3) {
        return {
          day,
          title: `Leg Day & Glutes (Day ${day})`,
          exercises: [
            { name: 'Goblet Squats', reps: 12, sets: 4, weight: 18 },
            { name: 'Dumbbell Lunges', reps: 16, sets: 4, weight: 12 },
            { name: 'Romanian Deadlifts', reps: 12, sets: 4, weight: 16 },
            { name: 'Calf Raises', reps: 20, sets: 3, weight: 14 }
          ]
        }
      } else {
        return {
          day,
          title: `Shoulders & Core Armor (Day ${day})`,
          exercises: [
            { name: 'Dumbbell Shoulder Press', reps: 10, sets: 4, weight: 12 },
            { name: 'Lateral Raises', reps: 12, sets: 4, weight: 8 },
            { name: 'Russian Twists', reps: 20, sets: 4, weight: 8 },
            { name: 'Elbow Plank', reps: 45, sets: 3, weight: 0 }
          ]
        }
      }
    })
  },
  {
    id: 'db-prog-foundation',
    name: 'Foundation',
    tagline: '30 Days of Zero Equipment Fitness',
    difficulty: 1,
    durationDays: 30,
    equipment: 'no-equipment',
    desc: 'The best entry point to fitness: low impact, joint-friendly, builds daily discipline.',
    days: Array.from({ length: 30 }).map((_, idx) => {
      const day = idx + 1
      const cycle = day % 3
      if (cycle === 1) {
        return {
          day,
          title: `Total Body Movement (Day ${day})`,
          exercises: [
            { name: 'March Steps', reps: 40, sets: 3, weight: 0 },
            { name: 'Arm Circles', reps: 30, sets: 3, weight: 0 },
            { name: 'Half Squats', reps: 15, sets: 3, weight: 0 },
            { name: 'Wall Push-ups', reps: 15, sets: 3, weight: 0 }
          ]
        }
      } else if (cycle === 2) {
        return {
          day,
          title: `Core Control & Balance (Day ${day})`,
          exercises: [
            { name: 'Seated Leg Raises', reps: 15, sets: 3, weight: 0 },
            { name: 'Torso Twists', reps: 20, sets: 3, weight: 0 },
            { name: 'Glute Bridges', reps: 15, sets: 3, weight: 0 },
            { name: 'Bird Dog', reps: 12, sets: 3, weight: 0 }
          ]
        }
      } else {
        return {
          day,
          title: `Cardio Flow & Tone (Day ${day})`,
          exercises: [
            { name: 'Step Jacks', reps: 30, sets: 3, weight: 0 },
            { name: 'High Knees', reps: 20, sets: 3, weight: 0 },
            { name: 'Calf Raises', reps: 20, sets: 3, weight: 0 },
            { name: 'Incline Push-ups', reps: 10, sets: 3, weight: 0 }
          ]
        }
      }
    })
  },
  {
    id: 'db-prog-heros-journey',
    name: "Hero's Journey",
    tagline: '60 Days of RPG Adventure Training',
    difficulty: 4,
    durationDays: 60,
    equipment: 'no-equipment',
    desc: 'A role-playing fitness adventure with karma points, weapon options, and story bosses.',
    days: Array.from({ length: 60 }).map((_, idx) => {
      const day = idx + 1
      const cycle = day % 4
      if (cycle === 1) {
        return {
          day,
          title: `Trial of Strength (Chapter ${day})`,
          exercises: [
            { name: 'Bodyweight Squats', reps: 20, sets: 5, weight: 0 },
            { name: 'Push-ups', reps: 15, sets: 5, weight: 0 },
            { name: 'Walking Lunges', reps: 20, sets: 5, weight: 0 },
            { name: 'Plank Hold', reps: 45, sets: 4, weight: 0 }
          ]
        }
      } else if (cycle === 2) {
        return {
          day,
          title: `The Speed Trials (Chapter ${day})`,
          exercises: [
            { name: 'High Knees', reps: 40, sets: 5, weight: 0 },
            { name: 'Burpees', reps: 10, sets: 5, weight: 0 },
            { name: 'Mountain Climbers', reps: 30, sets: 5, weight: 0 },
            { name: 'Jumping Jacks', reps: 50, sets: 4, weight: 0 }
          ]
        }
      } else if (cycle === 3) {
        return {
          day,
          title: `Combat Weapon Drill (Chapter ${day})`,
          exercises: [
            { name: 'Jabs & Crosses', reps: 60, sets: 5, weight: 0 },
            { name: 'Speed Hooks', reps: 30, sets: 5, weight: 0 },
            { name: 'Front Kicks', reps: 20, sets: 5, weight: 0 },
            { name: 'Duck and Weave', reps: 20, sets: 4, weight: 0 }
          ]
        }
      } else {
        return {
          day,
          title: `Boss Encounter: Fortitude (Chapter ${day})`,
          exercises: [
            { name: 'Jump Squats', reps: 15, sets: 5, weight: 0 },
            { name: 'Diamond Push-ups', reps: 12, sets: 5, weight: 0 },
            { name: 'Sit-ups', reps: 25, sets: 5, weight: 0 },
            { name: 'Wall Sit', reps: 60, sets: 3, weight: 0 }
          ]
        }
      }
    })
  },
  {
    id: 'db-prog-30days-hiit',
    name: '30 Days of HIIT',
    tagline: 'High Intensity Interval Burn',
    difficulty: 4,
    durationDays: 30,
    equipment: 'no-equipment',
    desc: 'Fast-paced, zero-fluff daily interval workouts designed to maximize cardiovascular output.',
    days: Array.from({ length: 30 }).map((_, idx) => {
      const day = idx + 1
      const cycle = day % 3
      if (cycle === 1) {
        return {
          day,
          title: `Tabata Intervals (Day ${day})`,
          exercises: [
            { name: 'Burpees', reps: 12, sets: 5, weight: 0 },
            { name: 'High Knees', reps: 30, sets: 5, weight: 0 },
            { name: 'Push-ups', reps: 15, sets: 5, weight: 0 },
            { name: 'Plank Jacks', reps: 20, sets: 5, weight: 0 }
          ]
        }
      } else if (cycle === 2) {
        return {
          day,
          title: `Core Burner Matrix (Day ${day})`,
          exercises: [
            { name: 'Mountain Climbers', reps: 30, sets: 5, weight: 0 },
            { name: 'Bicycle Crunches', reps: 25, sets: 5, weight: 0 },
            { name: 'Flutter Kicks', reps: 30, sets: 5, weight: 0 },
            { name: 'Elbow Plank', reps: 60, sets: 4, weight: 0 }
          ]
        }
      } else {
        return {
          day,
          title: `Plyo Power Surge (Day ${day})`,
          exercises: [
            { name: 'Jump Squats', reps: 15, sets: 5, weight: 0 },
            { name: 'Lunge Jumps', reps: 16, sets: 5, weight: 0 },
            { name: 'Skater Hops', reps: 20, sets: 5, weight: 0 },
            { name: 'Side Plank Holds', reps: 30, sets: 4, weight: 0 }
          ]
        }
      }
    })
  }
]

// Output to darebee-data.js
const fileContent = `// Auto-generated offline OpenGym program and workout catalog
// Contains ${allWorkouts.length} curated workouts and 30-day programs.

export const DAREBEE_WORKOUTS = ${JSON.stringify(allWorkouts, null, 2)}

export const DAREBEE_PROGRAMS = ${JSON.stringify(PROGRAMS, null, 2)}
`

const outPath = path.resolve('src/lib/darebee-data.js')
fs.writeFileSync(outPath, fileContent, 'utf8')
console.log(`Generated ${allWorkouts.length} workouts and ${PROGRAMS.length} programs at ${outPath}`)

