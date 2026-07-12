/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Skin, WeatherType, LeaderboardEntry, Difficulty } from './types';

export const INITIAL_SKINS: Skin[] = [
  {
    id: 'phoenix',
    name: 'Agni Paravai (Fire Bird)',
    description: 'The legendary fire-born bird of Tamil skies. Emits powerful heat waves.',
    cost: 0,
    unlocked: true,
    color: '#FF4F00',
    trailColor: '#FFA000',
    glowColor: 'rgba(255, 79, 0, 0.7)',
    type: 'phoenix',
    powerName: 'Solar Flare',
    powerDesc: 'Shoots a burst of homing fireballs at the boss.',
  },
  {
    id: 'koel',
    name: 'Asian Koel (Kuyil)',
    description: 'A dark purple-black cuckoo bird native to the Indian subcontinent.',
    cost: 0,
    unlocked: false,
    color: '#AA00FF',
    trailColor: '#E040FB',
    glowColor: 'rgba(170, 0, 255, 0.7)',
    type: 'sparrow',
    powerName: 'Sonic Screech',
    powerDesc: 'A soundwave that slows down incoming boss attacks.',
  },
  {
    id: 'swan',
    name: 'Mute Swan (Annam)',
    description: 'A majestic white swan representing absolute purity and grace.',
    cost: 0,
    unlocked: false,
    color: '#FFFFFF',
    trailColor: '#B2EBF2',
    glowColor: 'rgba(255, 255, 255, 0.7)',
    type: 'phoenix',
    powerName: 'Purifying Shield',
    powerDesc: 'Creates a temporary bubble reflecting boss projectiles.',
  },
  {
    id: 'peacock',
    name: 'Indian Peafowl (Mayil)',
    description: 'The vibrant national bird of India, adorned with iridescent plumage.',
    cost: 25,
    unlocked: false,
    color: '#00E5FF',
    trailColor: '#1DE9B6',
    glowColor: 'rgba(0, 229, 255, 0.7)',
    type: 'peacock',
    powerName: 'Feather Storm',
    powerDesc: 'Unleashes a barrage of sharp metallic feathers.',
  },
  {
    id: 'garuda',
    name: 'Brahminy Kite (Garuda)',
    description: 'A powerful bird of prey with distinctive chestnut plumage and a white head.',
    cost: 50,
    unlocked: false,
    color: '#FFC400',
    trailColor: '#FF6D00',
    glowColor: 'rgba(255, 196, 0, 0.7)',
    type: 'garuda',
    powerName: 'Divine Dive',
    powerDesc: 'Performs a rapid invulnerable dash through the boss.',
  },
  {
    id: 'yali',
    name: 'Yali Griffin',
    description: 'A fierce mythical beast, part lion, part elephant, and part bird.',
    cost: 100,
    unlocked: false,
    color: '#E040FB',
    trailColor: '#FF3D00',
    glowColor: 'rgba(224, 64, 251, 0.7)',
    type: 'yali',
    powerName: 'Roar of the Ancients',
    powerDesc: 'A devastating blast that destroys all boss projectiles.',
  },
  {
    id: 'drone',
    name: 'Siddhar Vaan Pori (Drone)',
    description: 'An ancient Tamil mystical brass machine powered by spiritual alchemical energy.',
    cost: 75,
    unlocked: false,
    color: '#00E5FF',
    trailColor: '#1A237E',
    glowColor: 'rgba(0, 229, 255, 0.7)',
    type: 'drone',
    powerName: 'Laser Beam',
    powerDesc: 'Fires a continuous concentrated beam of spiritual energy.',
  },
  {
    id: 'spirit',
    name: 'Atma Jyoti (Soul Flame)',
    description: 'A floating eternal soul lamp trailing divine cosmic ash across the temple heavens.',
    cost: 150,
    unlocked: false,
    color: '#D500F9',
    trailColor: '#3F51B5',
    glowColor: 'rgba(213, 0, 249, 0.7)',
    type: 'spirit',
    powerName: 'Soul Burn',
    powerDesc: 'Leaves a trail of fire that damages the boss over time.',
  },
  {
    id: 'rudra',
    name: 'Rudra Phoenix (Cosmic Destroyer)',
    description: 'The ultimate avatar of cosmic destruction and rebirth.',
    cost: 250,
    unlocked: false,
    color: '#FF0055',
    trailColor: '#7A00FF',
    glowColor: 'rgba(255, 0, 85, 0.8)',
    type: 'phoenix',
    powerName: 'Apocalypse Nova',
    powerDesc: 'Unleashes a massive screen-clearing explosion.',
  }
];

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: "Arun_The_Titan", score: 95, difficulty: Difficulty.IMPOSSIBLE, date: "2026-07-09" },
  { rank: 2, name: "Shivaya_99", score: 81, difficulty: Difficulty.IMPOSSIBLE, date: "2026-07-10" },
  { rank: 3, name: "NeonSpirit", score: 74, difficulty: Difficulty.HARD, date: "2026-07-08" },
  { rank: 4, name: "FeatherMaster", score: 60, difficulty: Difficulty.HARD, date: "2026-07-10" },
  { rank: 5, name: "GopuramChaser", score: 45, difficulty: Difficulty.EASY, date: "2026-07-07" },
  { rank: 6, name: "Diya_Glow", score: 39, difficulty: Difficulty.EASY, date: "2026-07-10" }
];

export const WEATHER_PRESETS = [
  {
    type: WeatherType.KURINJI,
    name: 'Kurinji (Mountains) குறிஞ்சி',
    icon: '⛰️🌸',
    description: 'Mountainous regions with cool breeze and mystical vibes.',
    colors: {
      skyTop: '#1a0b2e',
      skyBottom: '#4a154b',
      fog: '#8a2be2',
    }
  },
  {
    type: WeatherType.MULLAI,
    name: 'Mullai (Forests) முல்லை',
    icon: '🌲🍃',
    description: 'Lush green forests with dense vegetation and lively atmosphere.',
    colors: {
      skyTop: '#062c16',
      skyBottom: '#2e7d32',
      fog: '#a5d6a7',
    }
  },
  {
    type: WeatherType.MARUTHAM,
    name: 'Marutham (Croplands) மருதம்',
    icon: '🌾🧑‍🌾',
    description: 'Golden croplands with morning mist and peaceful agricultural fields.',
    colors: {
      skyTop: '#2d0d02',
      skyBottom: '#d35400',
      fog: '#f39c12',
    }
  },
  {
    type: WeatherType.NEITHAL,
    name: 'Neithal (Seashore) நெய்தல்',
    icon: '🌊🐟',
    description: 'Coastal seashore with deep blue oceans and sandy beaches.',
    colors: {
      skyTop: '#0d1b2a',
      skyBottom: '#1b263b',
      fog: '#415a77',
    }
  },
  {
    type: WeatherType.PALAI,
    name: 'Palai (Desert) பாலை',
    icon: '☀️🏜️',
    description: 'Dry wasteland with scorching sun and heat waves.',
    colors: {
      skyTop: '#3e1f06',
      skyBottom: '#c66c28',
      fog: '#ffb080',
    }
  }
];
