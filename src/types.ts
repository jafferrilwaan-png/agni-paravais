/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum GameState {
  INTRO = 'INTRO',
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
  SKINS = 'SKINS',
  LEADERBOARD = 'LEADERBOARD',
  STORY_MAP = 'STORY_MAP',
}

export enum Difficulty {
  EASY = 'EASY',
  HARD = 'HARD',
  IMPOSSIBLE = 'IMPOSSIBLE',
}

export enum WeatherType {
  KURINJI = 'KURINJI',
  MULLAI = 'MULLAI',
  MARUTHAM = 'MARUTHAM',
  NEITHAL = 'NEITHAL',
  PALAI = 'PALAI',
  STORY_MODE = 'STORY_MODE',
}

export interface Skin {
  id: string;
  name: string;
  description: string;
  cost: number;
  unlocked: boolean;
  color: string;
  trailColor: string;
  glowColor: string;
  type: 'phoenix' | 'garuda' | 'drone' | 'spirit' | 'peacock' | 'sparrow' | 'yali';
  powerName?: string;
  powerDesc?: string;
}

export interface PlayerState {
  y: number;
  vy: number;
  rotation: number;
  wingAngle: number;
  wingDirection: number;
  radius: number;
  shieldActive: boolean;
  shieldTimeLeft: number;
  slowMoActive: boolean;
  slowMoTimeLeft: number;
  doubleScoreActive: boolean;
  doubleScoreTimeLeft: number;
  boostActive: boolean;
  boostTimeLeft: number;
  lives: number;
  invincibilityTimeLeft: number;
  trail: Array<{ x: number; y: number; alpha: number; scale: number }>;
}

export enum ObstacleType {
  STANDARD_TOWER = 'STANDARD_TOWER',
  GATEWAY = 'GATEWAY',
  MOVING_PILLAR = 'MOVING_PILLAR',
  ROTATING_LASER = 'ROTATING_LASER',
  ELEPHANT = 'ELEPHANT',
  MONKEY = 'MONKEY',
  SNAKE = 'SNAKE',
  BULL = 'BULL',
  CROCODILE = 'CROCODILE',
  CRAB = 'CRAB',
  PLANT = 'PLANT',
}

export interface Obstacle {
  id: string;
  x: number;
  topHeight: number;
  bottomHeight: number;
  gap: number;
  width: number;
  passed: boolean;
  type: ObstacleType;
  speedY: number; // for moving pillars
  currentYOffset: number;
  rangeY: number;
  laserAngle: number; // for rotating laser traps
  laserSpeed: number;
}

export enum PowerUpType {
  SHIELD = 'SHIELD',
  SLOW_MO = 'SLOW_MO',
  DOUBLE_SCORE = 'DOUBLE_SCORE',
  BOOST = 'BOOST',
  SACRED_FEATHER = 'SACRED_FEATHER', // collectible currency
  COIN = 'COIN',
  SOUL_FRAGMENT = 'SOUL_FRAGMENT', // premium collectible currency
  GOLDEN_AURA = 'GOLDEN_AURA', // protects against one collision
  TIME_WARP = 'TIME_WARP', // slows down obstacles
  DIVINE_ORB_SMALL = 'DIVINE_ORB_SMALL',
  DIVINE_ORB_FULL = 'DIVINE_ORB_FULL',
  MAGNET = 'MAGNET',
  WIND_RIDER = 'WIND_RIDER',
}

export interface PowerUp {
  id: string;
  x: number;
  y: number;
  type: PowerUpType;
  radius: number;
  pulseScale: number;
  pulseDirection: number;
  collected: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
  gravity?: number;
  glow?: boolean;
  isFeather?: boolean;
  angle?: number;
  spin?: number;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  difficulty: Difficulty;
  date: string;
  isPlayer?: boolean;
}

export interface AudioSettings {
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
}

export interface GameStats {
  feathersCount: number;
  coinsCount: number;
  selectedSkinId: string;
  unlockedSkins: string[];
  highScoreEasy: number;
  highScoreHard: number;
  highScoreImpossible: number;
  gamesPlayed: number;
  selectedWeather: WeatherType;
  upgradeShieldLevel?: number;
  upgradeBoostLevel?: number;
  upgradeMagnetLevel?: number;
  upgradePassiveLevel?: number;
  upgradeAbilityDuration?: number;
  upgradeAbilityCooldown?: number;
  upgradeHealth?: number;
  storyCheckpoint?: number;
}

export interface DailyMission {
  id: string;
  description: string;
  descriptionTamil: string;
  target: number;
  current: number;
  reward: number;
  completed: boolean;
  claimed: boolean;
  type: 'DISTANCE' | 'FEATHERS_RUN' | 'COMBO_MAX';
}

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

