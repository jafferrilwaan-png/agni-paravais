/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { 
  GameState, 
  Difficulty, 
  WeatherType, 
  Skin, 
  Obstacle, 
  ObstacleType, 
  PowerUp, 
  PowerUpType, 
  Particle,
  GameStats
} from '../types';
import { AudioEngine } from '../audio';
import { WEATHER_PRESETS } from '../gameConfig';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Shield, Eye, Flame, Compass, Sparkles, Timer, Heart, Trophy } from 'lucide-react';

import kurinjiBg from '../assets/images/kurinji_bg_1783843688465.jpg';
import mullaiBg from '../assets/images/mullai_bg_1783843701035.jpg';
import maruthamBg from '../assets/images/marutham_bg_1783843712358.jpg';
import neithalBg from '../assets/images/neithal_bg_1783843723561.jpg';
import palaiBg from '../assets/images/palai_bg_1783843735587.jpg';

interface GameCanvasProps {
  gameState: GameState;
  difficulty: Difficulty;
  weather: WeatherType;
  selectedSkin: Skin;
  isMuted: boolean;
  stats: GameStats;
  onGameOver: (finalScore: number, feathersEarned: number, maxCombo: number, distanceMeters: number) => void;
  onStateChange: (state: GameState) => void;
  onFeatherCollect: (count: number) => void;
  onCoinCollect?: (count: number) => void;
  isStoryMode?: boolean;
  storyLevel?: number;
  onStoryLevelComplete?: (level: number, bonus: number) => void;
  selectedPerk?: string;
}



export const getWeatherType = (distance: number, startWeather: WeatherType = WeatherType.KURINJI): WeatherType => {
  const lands = [
    WeatherType.KURINJI,
    WeatherType.MULLAI,
    WeatherType.MARUTHAM,
    WeatherType.NEITHAL,
    WeatherType.PALAI
  ];
  const startIdx = lands.indexOf(startWeather) !== -1 ? lands.indexOf(startWeather) : 0;
  const cycleIdx = Math.floor(distance / 400);
  return lands[(startIdx + cycleIdx) % lands.length];
};

export const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  difficulty,
  weather,
  selectedSkin,
  isMuted,
  stats,
  onGameOver,
  onStateChange,
  onFeatherCollect,
  onCoinCollect,
  isStoryMode = false,
  storyLevel = 1,
  onStoryLevelComplete,
  selectedPerk,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // States exposed to React for HUD rendering
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [activeShield, setActiveShield] = useState(false);
  const [activeSlowMo, setActiveSlowMo] = useState(false);
  const [activeDoubleScore, setActiveDoubleScore] = useState(false);
  const [activeBoost, setActiveBoost] = useState(false);
  const [activeGoldenAura, setActiveGoldenAura] = useState(false);
  const [activeTimeWarp, setActiveTimeWarp] = useState(false);
  const [shieldTimer, setShieldTimer] = useState(0);
  const [slowMoTimer, setSlowMoTimer] = useState(0);
  const [doubleScoreTimer, setDoubleScoreTimer] = useState(0);
  const [boostTimer, setBoostTimer] = useState(0);
  const [goldenAuraTimer, setGoldenAuraTimer] = useState(0);
  const [timeWarpTimer, setTimeWarpTimer] = useState(0);
  const [activeMagnet, setActiveMagnet] = useState(false);
  const [activeWindRider, setActiveWindRider] = useState(false);
  const [magnetTimer, setMagnetTimer] = useState(0);
  const [windRiderTimer, setWindRiderTimer] = useState(0);
  const [isGamePaused, setIsGamePaused] = useState(false);
  const [cssShake, setCssShake] = useState(false);
  const [milestoneNotification, setMilestoneNotification] = useState<{meters: number, label: string, labelTamil: string} | null>(null);
  
  // Sanctum Blessing Upgrades State
  const [showUpgradeSelection, setShowUpgradeSelection] = useState(false);
  const [upgrades, setUpgrades] = useState({
    attack: 1,
    life: 1,
    durability: 1,
  });

  const triggerCssShake = () => {
    setCssShake(true);
    setTimeout(() => {
      setCssShake(false);
    }, 400);
  };

  // Exposed React states for Agni Rage & AI Adaptive Difficulty HUD
  const [rageCharge, setRageCharge] = useState(0);
  const [bossPowerFeathers, setBossPowerFeathers] = useState(0);
  const [isBossPowerActive, setIsBossPowerActive] = useState(false);
  const [isRageActive, setIsRageActive] = useState(false);
  const [aiRating, setAiRating] = useState('BENEVOLENT SPIRIT');
  const [weatherPhase, setWeatherPhase] = useState<'CLEAR SKY' | 'SACRED FOG' | 'THUNDER SHIELD' | 'EMBER STORM'>('CLEAR SKY');
  const [bossDistance, setBossDistance] = useState<number | null>(null);

  // Persistent game state in refs to run smoothly at 60fps
  const stateRef = useRef({
    player: {
      y: 250,
      vy: 0,
      rotation: 0,
      radius: 18,
      wingAngle: 0,
      wingDirection: 1,
      // Powerups
      shieldTimeLeft: 0,
      slowMoTimeLeft: 0,
      doubleScoreTimeLeft: 0,
      boostTimeLeft: 0,
      goldenAuraTimeLeft: 0,
      timeWarpTimeLeft: 0,
      magnetTimeLeft: 0,
      windRiderTimeLeft: 0,
      lives: 3,
      invincibilityTimeLeft: 0,
      healCharge: 0,
      trail: [] as Array<{ x: number; y: number; alpha: number; scale: number; color?: string }>,
    },
    obstacles: [] as Obstacle[],
    powerUps: [] as PowerUp[],
    particles: [] as Particle[],
    weatherParticles: [] as any[],
    bgParallax: [
      { x: 0, speed: 0.15 }, // Sky detail/clouds
      { x: 0, speed: 0.4 },  // Distant temple towers
      { x: 0, speed: 0.8 },  // Midground details
    ],
    gameSpeed: 3.5,
    baseSpeed: 3.5,
    distanceRun: 0,
    currentScore: 0,
    feathersEarned: 0,
    coinsEarned: 0,
    currentCombo: 0,
    comboTimer: 0,
    screenShake: 0,
    nearMissAlerts: [] as Array<{ x: number; y: number; text: string; alpha: number; isTamil?: boolean; customColor?: string; sizeScale?: number; scale?: number; vx?: number; vy?: number; wiggleSpeed?: number; wiggleAmount?: number; seed?: number }>,
    timeScale: 1.0, // For slow-motion transitions
    slowMoTarget: 1.0,
    frameCount: 0,
    playTimeSeconds: 0,
    nextBossTriggerTime: 420,
    dimensions: { width: 800, height: 500 },
    lastSpawnX: 400,
    lightningTimer: 0,
    lightningStrike: null as null | { x: number; branches: Array<{ sx: number; sy: number; ex: number; ey: number }> },
    gameActive: false,
    bellSwingAngle: 0,
    isDying: false,
    deathTimer: 0,
    autoPilotTimeLeft: 0,
    screenFlashAlpha: 0,
    lastLand: WeatherType.KURINJI,
    currentLand: WeatherType.KURINJI,
    landTransitionAlpha: 1.0,
    lastLandBeforeTransition: WeatherType.KURINJI,
    obstaclesSpawnedCount: 0,

    // NEW ADVANCED IMMERSIVE SYSTEMS
    rageChargeVal: 0,
    rageActive: false,
    rageTimeLeft: 0,
    sanjeeviniUsed: false,
    sanjeeviniActive: false, bossPowerFeathers: 0, bossPowerActive: false, bossPowerTimeLeft: 0,
    sanjeeviniTimeLeft: 0,
    aiPerformanceScore: 50, // 0 to 100
    aiDifficultyRating: 'BENEVOLENT SPIRIT',
    currentWeatherPhase: 'clear', // 'clear' | 'fog' | 'thunder' | 'ember'
    weatherPhaseTimer: 300, // phase duration in frames
    cameraZoom: 1.0,
    cameraY: 250,
    highScoreToBeat: 0,
    highScorePassed: false,
    
    highScoreCloseAlertTriggered: false,
    nextBossTriggerDistance: isStoryMode ? (storyLevel * 100000) : 100000,

    upgrades: {
      attack: 1,
      life: 1,
      durability: 1,
    },

    distanceMilestonesReached: [] as number[],
    // BOSS ENCOUNTER STATE
    bossEncounterActive: false,
    bossDefeated: false,
    bossIntroActive: false,
    bossIntroTimer: 0,
    bossIntroMax: 360,
    boss: {
      x: 900,
      y: 250,
      targetY: 250,
      health: 100, // we will use 30 hits to defeat
      maxHealth: 200,
      phase: 0,
      attackTimer: 0,
      wobbleTimer: 0,
      alpha: 0
    },
    bossProjectiles: [] as Array<{ x: number; y: number; vx: number; vy: number; radius: number; type: string }>,
    playerProjectiles: [] as Array<{ x: number; y: number; vx: number; vy: number; radius: number }>,
  });

  // Keep references to values needed in the dynamic input loop
  const inputRef = useRef({
    jump: false,
  });

  useEffect(() => {
    stateRef.current.upgrades = upgrades;
  }, [upgrades]);

  // Helper to prevent radial gradient crashes with invalid/NaN dimensions
  const safeRadialGradient = (
    ctx: CanvasRenderingContext2D,
    x0: number,
    y0: number,
    r0: number,
    x1: number,
    y1: number,
    r1: number
  ) => {
    // Ensure inputs are finite and r > 0.
    // If invalid, fallback to a tiny, safe gradient to avoid crashing.
    const safeR0 = Math.max(0.1, isFinite(r0) ? r0 : 0.1);
    const safeR1 = Math.max(0.2, isFinite(r1) ? r1 : 0.2);
    const safeX0 = isFinite(x0) ? x0 : 0;
    const safeY0 = isFinite(y0) ? y0 : 0;
    const safeX1 = isFinite(x1) ? x1 : 0;
    const safeY1 = isFinite(y1) ? y1 : 0;
    
    return ctx.createRadialGradient(safeX0, safeY0, safeR0, safeX1, safeY1, safeR1);
  };

  const BACKGROUND_IMAGES = {
    [WeatherType.KURINJI]: kurinjiBg,
    [WeatherType.MULLAI]: mullaiBg,
    [WeatherType.MARUTHAM]: maruthamBg,
    [WeatherType.NEITHAL]: neithalBg,
    [WeatherType.PALAI]: palaiBg,
    [WeatherType.STORY_MODE]: neithalBg
  };

  const bgImagesRef = useRef<Record<string, HTMLImageElement>>({});

  const manageBackgroundImageCache = (currentLand: WeatherType, lastLand: WeatherType) => {
    const cache = bgImagesRef.current;
    const landsToKeep = [currentLand, lastLand];

    // 1. Unload unused backgrounds to conserve memory (Keep only 2 backgrounds active at a time)
    Object.keys(cache).forEach((key) => {
      const l = key as WeatherType;
      if (!landsToKeep.includes(l)) {
        if (cache[l]) {
          cache[l].src = ""; // Stop loading/unload memory
          delete cache[l];
        }
      }
    });

    // 2. Load required backgrounds
    landsToKeep.forEach((l) => {
      if (!cache[l]) {
        const img = new Image();
        img.src = BACKGROUND_IMAGES[l];
        cache[l] = img;
      }
    });
  };

  // Configure Difficulty Speeds and Spaces (AI Adaptive Difficulty!)
  const getDifficultySettings = (diff: Difficulty, score: number = 0) => {
    // Read performance score from state: 0 to 100.
    // Base is 50. Performance factor: maps 50 -> 1.0, 100 -> 1.35, 0 -> 0.65
    const perfScore = stateRef.current ? stateRef.current.aiPerformanceScore : 50;
    const perfFactor = 0.65 + (perfScore / 50) * 0.35;

    // Story Mode dynamic difficulty progression
    if (isStoryMode) {
      // storyLevel scales from 1 to 5
      const levelMultiplier = 0.75 + (storyLevel - 1) * 0.17; // maps level 1->0.75, 5->1.43
      const baseSpeed = Math.min(6.5, (2.6 + score * 0.08) * levelMultiplier * perfFactor);
      const pipeGap = Math.max(125, (210 - score * 1.2 - (storyLevel - 1) * 12) / perfFactor);
      const spawnGap = Math.max(220, (390 - score * 2.5 - (storyLevel - 1) * 25) / perfFactor);
      return { baseSpeed, pipeGap, spawnGap };
    }

    switch (diff) {
      case Difficulty.EASY: {
        const baseSpeed = Math.min(5.2, (2.8 + score * 0.04) * perfFactor);
        const pipeGap = Math.max(150, (195 - score * 0.8) / perfFactor);
        const spawnGap = Math.max(270, (380 - score * 1.5) / perfFactor);
        return { baseSpeed, pipeGap, spawnGap };
      }
      case Difficulty.HARD: {
        const baseSpeed = Math.min(6.8, (3.6 + score * 0.08) * perfFactor);
        const pipeGap = Math.max(130, (165 - score * 1.2) / perfFactor);
        const spawnGap = Math.max(230, (320 - score * 2.5) / perfFactor);
        return { baseSpeed, pipeGap, spawnGap };
      }
      case Difficulty.IMPOSSIBLE: {
        const baseSpeed = Math.min(8.8, (4.6 + score * 0.12) * perfFactor);
        const pipeGap = Math.max(110, (140 - score * 1.5) / perfFactor);
        const spawnGap = Math.max(180, (270 - score * 4) / perfFactor);
        return { baseSpeed, pipeGap, spawnGap };
      }
      default: {
        const baseSpeed = Math.min(5.2, (2.8 + score * 0.07) * perfFactor);
        const pipeGap = Math.max(150, (195 - score * 1.2) / perfFactor);
        const spawnGap = Math.max(270, (380 - score * 2) / perfFactor);
        return { baseSpeed, pipeGap, spawnGap };
      }
    }
  };

  const getActiveWeatherColors = () => {
    const preset = WEATHER_PRESETS.find(w => w.type === weather);
    const baseColors = preset ? preset.colors : { skyTop: '#1a0b2e', skyBottom: '#d35400', fog: '#f39c12' };
    
    // Dynamic ratio based on the player's score up to 15
    const scoreVal = stateRef.current?.currentScore || 0;
    const ratio = Math.min(1.0, scoreVal / 15);
    
    // Simple color interpolation helper
    const lerpColor = (color1: string, color2: string, factor: number) => {
      const parseHex = (hex: string) => {
        let h = hex.replace('#', '');
        if (h.length === 3) h = h.split('').map(x => x + x).join('');
        const num = parseInt(h, 16);
        return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
      };
      try {
        const c1 = parseHex(color1);
        const c2 = parseHex(color2);
        const r = Math.round(c1.r + (c2.r - c1.r) * factor);
        const g = Math.round(c1.g + (c2.g - c1.g) * factor);
        const b = Math.round(c1.b + (c2.b - c1.b) * factor);
        return `rgb(${r}, ${g}, ${b})`;
      } catch (e) {
        return color2;
      }
    };

    // Dark ruined/ashy base colors
    const ruinedTop = '#0b080c';
    const ruinedBottom = '#1c1613';
    const ruinedFog = '#2c2522';

    return {
      skyTop: lerpColor(ruinedTop, baseColors.skyTop, ratio),
      skyBottom: lerpColor(ruinedBottom, baseColors.skyBottom, ratio),
      fog: lerpColor(ruinedFog, baseColors.fog, ratio),
    };
  };

  // Triggers when player makes a leap
  const triggerFlap = () => {
    if (gameState !== GameState.PLAYING || isGamePaused || stateRef.current.isDying || stateRef.current.autoPilotTimeLeft > 0 || stateRef.current.bossIntroActive) return;
    const { player, boostTimeLeft } = stateRef.current;
    
    // Different jump heights based on boost state or wind rider
    const jumpStrength = player.windRiderTimeLeft > 0 ? -4.2 : (boostTimeLeft > 0 ? -4.5 : -6.5);
    player.vy = jumpStrength;
    player.wingDirection = -1; // Force visual wing flap down
    
    AudioEngine.playFlap();
    
    // Spawn subtle wind particles at bird feet
    const cColors = getActiveWeatherColors();
    for (let i = 0; i < 5; i++) {
      stateRef.current.particles.push({
        x: 100 - player.radius,
        y: player.y + 10,
        vx: -2 - Math.random() * 3,
        vy: (Math.random() - 0.5) * 2,
        radius: 2 + Math.random() * 3,
        color: selectedSkin.trailColor,
        alpha: 0.8,
        decay: 0.04,
      });
    }

    if (stateRef.current.bossEncounterActive && !stateRef.current.bossDefeated) {
      const currentAttackLvl = stateRef.current.upgrades?.attack || 1;
      const bulletColor = currentAttackLvl === 6 ? '#FF2200' : (currentAttackLvl >= 2 ? '#FFCC33' : '#FFFFFF');
      stateRef.current.playerProjectiles.push({
        x: 100 + player.radius,
        y: player.y,
        vx: 11, // Faster projectile for extremely crisp responsive gameplay
        vy: 0,
        radius: 6 + (currentAttackLvl - 1) * 1.5,
        color: bulletColor
      } as any);
      AudioEngine.playCollect(); // Use collect or something as shoot sound
    }
  };

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        triggerFlap();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, isGamePaused]);

  // Touch/Mouse click handler
  const handleCanvasClick = (e: React.MouseEvent) => {
    e.preventDefault();
    triggerFlap();
  };

  const handlePauseToggle = () => {
    if (isGamePaused) {
      setIsGamePaused(false);
      stateRef.current.gameActive = true;
      AudioEngine.startMusic();
    } else {
      setIsGamePaused(true);
      stateRef.current.gameActive = false;
      AudioEngine.stopMusic();
    }
    AudioEngine.playButton();
  };

  const handleRestart = () => {
    initGame();
    setIsGamePaused(false);
    AudioEngine.playButton();
  };

  // Initialize Game Loop state variables
  const initGame = () => {
    setUpgrades({ attack: 1, life: 1, durability: 1 });
    setShowUpgradeSelection(false);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const diffSettings = getDifficultySettings(difficulty, 0);
    const canvasW = canvas.width || 800;
    const canvasH = canvas.height || 500;

    const isEasyOrStory = difficulty === Difficulty.EASY || isStoryMode;
    const hasSanjeevini = isEasyOrStory && selectedPerk === 'sanjeevini';
    const hasMagnet = isEasyOrStory && selectedPerk === 'magnet';
    const hasRage = isEasyOrStory && selectedPerk === 'rage';

    const startingLives = hasSanjeevini ? 4 : 3;
    const startingShield = hasSanjeevini ? 360 : 0;
    const startingMagnet = hasMagnet ? 1000000 : 0;
    const startingRage = hasRage ? 50 : 0;
    
    stateRef.current = {
      player: {
        y: canvasH / 2,
        vy: 0,
        rotation: 0,
        radius: selectedSkin.id === 'sparrow' ? 11 : 17,
        wingAngle: 0,
        wingDirection: 1,
        shieldTimeLeft: startingShield,
        slowMoTimeLeft: 0,
        doubleScoreTimeLeft: 0,
        boostTimeLeft: 0,
        goldenAuraTimeLeft: 0,
        timeWarpTimeLeft: 0,
        magnetTimeLeft: startingMagnet,
        windRiderTimeLeft: 0,
        lives: startingLives,
        invincibilityTimeLeft: 0,
        trail: [],
      },
      obstacles: [],
      powerUps: [],
      particles: [],
      weatherParticles: [],
      bgParallax: [
        { x: 0, speed: 0.15 },
        { x: 0, speed: 0.4 },
        { x: 0, speed: 0.8 },
      ],
      gameSpeed: diffSettings.baseSpeed,
      baseSpeed: diffSettings.baseSpeed,
      distanceRun: 0,
      currentScore: 0,
      feathersEarned: 0,
        coinsEarned: 0,
      currentCombo: 0,
      comboTimer: 0,
      comboStreakTimer: 0,
      maxComboReached: 0,
      screenShake: 0,
      nearMissAlerts: [],
      timeScale: 1.0,
      slowMoTarget: 0.65, // Start with slow-mo during autopilot!
      frameCount: 0,
      playTimeSeconds: 0,
      nextBossTriggerTime: 420,
      dimensions: { width: canvasW, height: canvasH },
      lastSpawnX: canvasW / 2,
      lightningTimer: 0,
      lightningStrike: null,
      gameActive: true,
      bellSwingAngle: 0,
      isDying: false,
      deathTimer: 0,
      autoPilotTimeLeft: 3.0, // Start with 3 seconds of autopilot!
      screenFlashAlpha: 0,
      lastLand: WeatherType.KURINJI,
      currentLand: WeatherType.KURINJI,
      landTransitionAlpha: 1.0,
      lastLandBeforeTransition: WeatherType.KURINJI,
      obstaclesSpawnedCount: 0,

      // BOSS ENCOUNTER STATE
      bossEncounterActive: false,
      bossDefeated: false,
      bossIntroActive: false,
      bossIntroTimer: 0,
      bossIntroMax: 360,
      boss: {
        x: canvasW + 100,
        y: canvasH / 2,
        targetY: canvasH / 2,
        health: 200,
        maxHealth: 200,
        phase: 0,
        attackTimer: 0,
        wobbleTimer: 0,
        alpha: 0
      },
      bossProjectiles: [],
      playerProjectiles: [],
      nextBossTriggerDistance: isStoryMode ? (storyLevel * 100000) : 100000,
      upgrades: {
        attack: 1,
        life: 1,
        durability: 1,
      },

      // PERFORMANCE & PROTECTION ENGINE
      lastFrameTime: performance.now(),
      fps: 60,
      timeSinceLastSpawn: 0,
      lastDistanceRun: 0,
      stuckFramesCount: 0,

      // ADVANCED IMMERSIVE SYSTEMS RESET
      rageChargeVal: startingRage,
      rageActive: false,
      rageTimeLeft: 0,
      sanjeeviniUsed: false,
      sanjeeviniActive: false, bossPowerFeathers: 0, bossPowerActive: false, bossPowerTimeLeft: 0,
      sanjeeviniTimeLeft: 0,
      aiPerformanceScore: 50,
      aiDifficultyRating: 'BENEVOLENT SPIRIT',
      currentWeatherPhase: 'clear',
      weatherPhaseTimer: 450,
      cameraZoom: 1.0,
      cameraY: canvasH / 2 || 250,
      highScoreToBeat: difficulty === Difficulty.EASY ? stats.highScoreEasy : (difficulty === Difficulty.HARD ? stats.highScoreHard : stats.highScoreImpossible),
      highScorePassed: false,
      highScoreCloseAlertTriggered: false,
      distanceMilestonesReached: [],
    };

    setScore(0);
    setLives(startingLives);
    setCombo(0);
    setActiveShield(hasSanjeevini);
    setActiveSlowMo(false);
    setActiveDoubleScore(false);
    setActiveBoost(false);
    setActiveGoldenAura(false);
    setActiveTimeWarp(false);
    setActiveMagnet(hasMagnet);
    setShieldTimer(startingShield);
    setSlowMoTimer(0);
    setDoubleScoreTimer(0);
    setBoostTimer(0);
    setGoldenAuraTimer(0);
    setMagnetTimer(startingMagnet ? 99999 : 0);
    setTimeWarpTimer(0);

    // Advanced HUD reset
    setRageCharge(0);
    setIsRageActive(false);
    setAiRating('BENEVOLENT SPIRIT');
    setWeatherPhase('CLEAR SKY');

    // Seed initial simple obstacle safely ahead of player's initial position
    spawnObstacle(canvasW + 350);

    AudioEngine.startMusic();
    AudioEngine.updateScore(0);
  };

  // Spawn dynamic elements
  const spawnObstacle = (spawnX: number) => {
    stateRef.current.timeSinceLastSpawn = 0;
    console.log(`[Spawn Event] Spawning obstacle at X: ${spawnX}, score: ${stateRef.current.currentScore}`);
    const { dimensions } = stateRef.current;
    const currentScoreVal = stateRef.current.currentScore;
    const diffSettings = getDifficultySettings(difficulty, currentScoreVal);
    const distanceMeters = Math.floor(stateRef.current.distanceRun / 10);
    const currentLand = stateRef.current.currentLand;

    // Increase obstacle spawned count
    stateRef.current.obstaclesSpawnedCount = (stateRef.current.obstaclesSpawnedCount || 0) + 1;

    // Height ratios
    const minHeight = 60;
    let pipeGap = diffSettings.pipeGap;
    
    // --- GAP DYNAMICALLY INCREASES WITH SPEED (FAIR GAMEPLAY) ---
    const speedFactor = Math.max(0, (stateRef.current.gameSpeed - 3.5) * 6);
    pipeGap = Math.round(pipeGap + speedFactor);

    // --- FLOW ZONE SYSTEM ---
    // Every 4th obstacle is a Flow Zone (wider gap, centered, standard, no hazards) for recovery
    const isFlowZone = stateRef.current.obstaclesSpawnedCount % 4 === 0;
    if (isFlowZone) {
      pipeGap = Math.round(pipeGap * 1.35); // 35% wider
    }

    const maxHeight = dimensions.height - pipeGap - minHeight;
    let topHeight = minHeight + Math.random() * (maxHeight - minHeight);
    let bottomHeight = dimensions.height - topHeight - pipeGap;

    // Obstacle types depending on difficulty level
    let type = ObstacleType.STANDARD_TOWER;
    let speedY = 0;
    
    if (isFlowZone) {
      // Centered simple tower gap
      topHeight = dimensions.height / 2 - pipeGap / 2;
      bottomHeight = dimensions.height / 2 - pipeGap / 2;
      type = ObstacleType.STANDARD_TOWER;
      speedY = 0;
    } else {
      // Standard spawning checks
      if (difficulty === Difficulty.EASY) {
        if (currentScoreVal > 15 && Math.random() > 0.75) {
          type = ObstacleType.GATEWAY;
        } else if (currentScoreVal > 8 && Math.random() > 0.8) {
          type = ObstacleType.MOVING_PILLAR;
          speedY = (Math.random() > 0.5 ? 1 : -1) * (0.4 + Math.random() * 0.4);
        }
      } else if (difficulty === Difficulty.HARD) {
        const rand = Math.random();
        if (currentScoreVal > 12 && rand > 0.82) {
          type = ObstacleType.ROTATING_LASER;
        } else if (rand > 0.55) {
          type = ObstacleType.MOVING_PILLAR;
          speedY = (Math.random() > 0.5 ? 1 : -1) * (1.0 + Math.random() * 1.0);
        } else if (rand > 0.35 && currentScoreVal > 4) {
          type = ObstacleType.GATEWAY;
        }
      } else if (difficulty === Difficulty.IMPOSSIBLE) {
        const rand = Math.random();
        if (rand > 0.65) {
          type = ObstacleType.ROTATING_LASER;
        } else if (rand > 0.3) {
          type = ObstacleType.MOVING_PILLAR;
          speedY = (Math.random() > 0.5 ? 1 : -1) * (1.6 + Math.random() * 1.6);
        } else {
          type = ObstacleType.GATEWAY;
        }
      }

      // --- THEMATIC ANIMAL OBSTACLES (Ainthinai Landscapes integration) ---
      if ((true) && Math.random() > 0.65 && currentScoreVal > 4) {
        if (currentLand === WeatherType.KURINJI) {
          // Elephant block on ground
          type = ObstacleType.ELEPHANT;
          speedY = 0;
          topHeight = 0;
          bottomHeight = 120;
          pipeGap = dimensions.height - bottomHeight;
        } else if (currentLand === WeatherType.MULLAI) {
          // Monkey hanging from top branch or snake slithering
          if (Math.random() > 0.5) {
            type = ObstacleType.MONKEY;
            speedY = 1.0;
            topHeight = 150;
            bottomHeight = 0;
            pipeGap = dimensions.height - topHeight;
          } else {
            type = ObstacleType.SNAKE;
            speedY = 0;
            topHeight = 80;
            bottomHeight = 80;
            pipeGap = dimensions.height - 160;
          }
        } else if (currentLand === WeatherType.MARUTHAM) {
          // Charging Bull on ground or Elephant
          if (Math.random() > 0.5) {
            type = ObstacleType.BULL;
            speedY = 0;
            topHeight = 0;
            bottomHeight = 90;
            pipeGap = dimensions.height - bottomHeight;
          } else {
            type = ObstacleType.ELEPHANT;
            speedY = 0;
            topHeight = 0;
            bottomHeight = 120;
            pipeGap = dimensions.height - bottomHeight;
          }
        } else if (currentLand === WeatherType.NEITHAL) {
          const randObs = Math.random();
          if (randObs < 0.35) {
            type = ObstacleType.CROCODILE;
            speedY = 0;
            topHeight = 0;
            bottomHeight = 50;
            pipeGap = dimensions.height - bottomHeight;
          } else if (randObs < 0.7) {
            type = ObstacleType.CRAB;
            speedY = 0;
            topHeight = 0;
            bottomHeight = 45;
            pipeGap = dimensions.height - bottomHeight;
          } else {
            type = ObstacleType.PLANT;
            speedY = 0;
            topHeight = 0;
            bottomHeight = 40;
            pipeGap = dimensions.height - bottomHeight;
          }
        } else if (currentLand === WeatherType.PALAI) {
          // Desert viper slithering
          type = ObstacleType.SNAKE;
          speedY = 0;
          topHeight = 80;
          bottomHeight = 80;
          pipeGap = dimensions.height - 160;
        }
      }
    }

    const newObstacle: Obstacle = {
      id: `obs_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      x: spawnX,
      topHeight,
      bottomHeight,
      gap: pipeGap,
      width: 65,
      passed: false,
      type,
      speedY,
      currentYOffset: 0,
      rangeY: 60,
      laserAngle: 0,
      laserSpeed: 0.01 + Math.random() * 0.02,
    };

    stateRef.current.obstacles.push(newObstacle);

    // Spawn high-value floating collectibles or powerups inside gaps
    if (Math.random() > 0.3) {
      // Place items perfectly centered in the gap for reachable and fair placement
      const pY = topHeight + pipeGap / 2 + (Math.random() - 0.5) * 15;
      let pType: PowerUpType = Math.random() > 0.5 ? PowerUpType.SACRED_FEATHER : PowerUpType.COIN;

      // Spawning odds of premium item
      if (Math.random() > 0.8) {
        const r = Math.random();
        if (r < 0.11) pType = PowerUpType.SHIELD;
        else if (r < 0.22) pType = PowerUpType.SLOW_MO;
        else if (r < 0.33) pType = PowerUpType.DOUBLE_SCORE;
        else if (r < 0.44) pType = PowerUpType.BOOST;
        else if (r < 0.55) pType = PowerUpType.GOLDEN_AURA;
        else if (r < 0.66) pType = PowerUpType.TIME_WARP;
        else if (r < 0.77) pType = PowerUpType.MAGNET;
        else if (r < 0.88) pType = PowerUpType.WIND_RIDER;
        else if (r < 0.94) pType = PowerUpType.DIVINE_ORB_SMALL;
        else pType = PowerUpType.DIVINE_ORB_FULL;
      } else if (Math.random() > 0.75) {
        pType = PowerUpType.SOUL_FRAGMENT;
      }

      stateRef.current.powerUps.push({
        id: `pw_${Date.now()}`,
        x: spawnX + 150 + Math.random() * 80,
        y: pY,
        type: pType,
        // Feather/Soul fragment hitbox increased from 10 to 18 for satisfying collection feel!
        radius: (pType === PowerUpType.SACRED_FEATHER || pType === PowerUpType.COIN || pType === PowerUpType.SOUL_FRAGMENT) ? 18 : 20,
        pulseScale: 1.0,
        pulseDirection: 1,
        collected: false,
      });
    }
  };

  // Manage responsive Canvas scaling
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const rect = container.getBoundingClientRect();
      canvas.width = rect.width || 800;
      canvas.height = rect.height || 500;
      
      stateRef.current.dimensions = { width: canvas.width, height: canvas.height };
    };

    handleResize();
    const observer = new ResizeObserver(() => handleResize());
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  // Main high-frame-rate rendering and game state updater loop
  useEffect(() => {
    let animationId: number;
    AudioEngine.setTheme(weather);
    initGame();

    const updateAndRender = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx || !stateRef.current.gameActive) {
        animationId = requestAnimationFrame(updateAndRender);
        return;
      }

      const state = stateRef.current;

      if (isGamePaused || showUpgradeSelection) {
        state.lastFrameTime = performance.now();
        animationId = requestAnimationFrame(updateAndRender);
        return;
      }

      const { player, obstacles, powerUps, particles, dimensions } = state;

      // Accumulator fixed-time-step physics engine:
      const now = performance.now();
      let delta = now - (state.lastFrameTime || now);
      state.lastFrameTime = now;

      // Calculate smoothed FPS outside of the loop
      if (delta > 0) {
        const currentFps = 1000 / delta;
        state.fps = Math.round(state.fps * 0.95 + currentFps * 0.05);
      }

      // Cap delta time to prevent spiral of death
      if (delta < 0) delta = 0;
      if (delta > 250) delta = 250;

      state.accumulator = (state.accumulator || 0) + delta;
      const fixedTimeStep = 1000 / 60; // 60 updates/sec simulation
      let loops = 0;
      const maxLoops = 10;

      let isGameTerminatedThisFrame = false;

      while (state.accumulator >= fixedTimeStep && loops < maxLoops && !isGameTerminatedThisFrame && state.gameActive) {
        state.accumulator -= fixedTimeStep;
        loops++;

        state.frameCount++;

        if (state.landTransitionAlpha < 1.0) {
          state.landTransitionAlpha += 0.015;
          if (state.landTransitionAlpha > 1.0) {
            state.landTransitionAlpha = 1.0;
          }
        }

        // Handle death sequence frame-by-frame
        if (state.isDying) {
          state.deathTimer -= 1;
          if (state.deathTimer <= 0) {
            state.gameActive = false;
            onGameOver(
              state.currentScore, 
              state.feathersEarned, 
              state.maxComboReached, 
              Math.floor(state.distanceRun / 10)
            );
            isGameTerminatedThisFrame = true;
            break;
          }
        }

        // Adjust timescales smoothly
        state.timeScale += (state.slowMoTarget - state.timeScale) * 0.1;
        const ts = state.timeScale;

        // Track time since last spawn for fail-safe
        if (!state.isDying && !state.bossEncounterActive) {
          state.timeSinceLastSpawn += (1 / 60) * ts;
        }

        // Track active gameplay time in seconds
        if (!state.isDying) {
          state.playTimeSeconds = (state.playTimeSeconds || 0) + (1 / 60) * ts;
        }

        // Watchdog Freeze Protection System
        if (state.gameActive && !state.isDying) {
          if (Math.abs(state.distanceRun - state.lastDistanceRun) < 0.1) {
            state.stuckFramesCount++;
            if (state.stuckFramesCount >= 120) { // 2 seconds of zero movement
              console.warn("[Watchdog] Game stasis detected! Triggering seamless recovery.");
              state.timeScale = 1.0;
              state.slowMoTarget = 1.0;
              state.stuckFramesCount = 0;
              state.timeSinceLastSpawn = 0;

              // Clear NaNs or extreme obstacles
              state.obstacles = state.obstacles.filter(obs => !isNaN(obs.x) && obs.x < state.dimensions.width + 1000);
              
              // Force spawn a fresh obstacle ahead if empty
              if (state.obstacles.length === 0) {
                spawnObstacle(state.dimensions.width + 50);
              } else {
                // Unstuck and push existing obstacles
                state.obstacles.forEach(obs => {
                  if (obs.x > state.dimensions.width) {
                    obs.x = state.dimensions.width - 100;
                  }
                });
              }

              // Force player to safety if they went out of bounds or glitched
              if (isNaN(state.player.y) || state.player.y < 0 || state.player.y > state.dimensions.height) {
                state.player.y = state.dimensions.height / 2;
                state.player.vy = 0;
              }

              state.nearMissAlerts.push({
                x: state.dimensions.width / 2,
                y: state.dimensions.height / 4,
                text: "⚡ பாதுகாப்பு இயக்கம் (WATCHDOG ACTIVE) ⚡",
                alpha: 2.0,
                isTamil: true,
                customColor: '#ff1744',
                sizeScale: 1.0
              });
            }
          } else {
            state.stuckFramesCount = 0;
          }
          state.lastDistanceRun = state.distanceRun;
        }

        // 1. UPDATE PHYSICS
      
      // Update score difficulty scaling dynamically over time
      const diffSettings = getDifficultySettings(difficulty, state.currentScore);
      const skinSpeedMultiplier = selectedSkin.id === 'garuda' ? 1.25 : 1.0;
      state.baseSpeed = diffSettings.baseSpeed * skinSpeedMultiplier;
      state.gameSpeed = state.baseSpeed * ts;
      state.distanceRun += (state.bossEncounterActive && !state.bossDefeated ? 0 : state.gameSpeed) * 10;

      // Boost mechanics: rapid movement forward, invincibility, gravity suspended
      if (player.boostTimeLeft > 0) {
        player.boostTimeLeft -= ts;
        player.vy = 0; // suspend gravity
        state.gameSpeed = state.baseSpeed * 2.5 * ts; // blast speed!
        
        // Push trailing wind lines
        if (state.frameCount % 2 === 0) {
          particles.push({
            x: 100,
            y: player.y + (Math.random() - 0.5) * 20,
            vx: -15,
            vy: 0,
            radius: 1 + Math.random() * 2,
            color: 'rgba(255, 255, 255, 0.7)',
            alpha: 0.8,
            decay: 0.05,
          });
        }
      } else if (state.bossIntroActive) {
        // Suspend standard gravity, hover smoothly near center
        const targetHeight = dimensions.height / 2;
        player.vy += (targetHeight - player.y) * 0.04 * ts;
        player.vy *= Math.pow(0.85, ts); // heavy damping for cinematic stability
      } else {
        // Normal or Wind Rider Gravity application (Wind Rider makes bird glide with smooth physics)
        let gravity = 0.35 * ts;
        if (player.windRiderTimeLeft > 0) {
          gravity = 0.18 * ts;
          // Apply realistic air resistance/drag for a gorgeous gliding feel
          if (player.vy > 0) {
            player.vy *= Math.pow(0.85, ts); // Glide down slowly
          } else if (player.vy < 0) {
            player.vy *= Math.pow(0.92, ts); // Rise smoothly
          }
        }
        player.vy += gravity;
        // Terminate dive acceleration
        player.vy = Math.max(-10, Math.min(12, player.vy));
      }

      player.y += player.vy * ts;

      // Boss cinematic intro logic
      if (state.bossIntroActive) {
        state.bossIntroTimer -= 1 * ts;
        if (state.bossIntroTimer <= 0) {
          state.bossIntroActive = false;
          state.bossIntroTimer = 0;
          state.nearMissAlerts.push({
            x: dimensions.width / 2,
            y: dimensions.height / 2,
            text: "⚔️ DEFEND THE TEMPLE / திணையைக் காப்போம்! ⚔️",
            alpha: 3.5,
            customColor: '#ffea00',
            sizeScale: 1.15,
          });
          AudioEngine.playTempleBellMilestone();
        }

        // Spawn beautiful land-specific particles continuously from the boss!
        if (state.frameCount % 2 === 0) {
          const land = state.currentLand;
          if (land === WeatherType.KURINJI) {
            particles.push({
              x: state.boss.x + (Math.random() - 0.5) * 100,
              y: state.boss.y + (Math.random() - 0.5) * 100,
              vx: -3 - Math.random() * 4,
              vy: -2 + Math.random() * 4,
              radius: 2 + Math.random() * 4,
              color: Math.random() > 0.5 ? '#a5f3fc' : '#4b5563',
              alpha: 1.0,
              decay: 0.02
            });
            if (Math.random() > 0.96) {
              state.lightningTimer = 15;
              state.screenShake = 15;
              AudioEngine.playCrash();
            }
          } else if (land === WeatherType.MULLAI) {
            particles.push({
              x: state.boss.x + (Math.random() - 0.5) * 80,
              y: state.boss.y + (Math.random() - 0.5) * 80,
              vx: -2 - Math.random() * 3,
              vy: -1 + Math.random() * 2,
              radius: 3 + Math.random() * 3,
              color: Math.random() > 0.6 ? '#4ade80' : '#22c55e',
              alpha: 0.9,
              decay: 0.015
            });
          } else if (land === WeatherType.MARUTHAM) {
            particles.push({
              x: state.boss.x + (Math.random() - 0.5) * 90,
              y: state.boss.y + (Math.random() - 0.5) * 90,
              vx: -4 - Math.random() * 3,
              vy: (Math.random() - 0.5) * 3,
              radius: 2 + Math.random() * 3,
              color: Math.random() > 0.5 ? '#fbbf24' : '#78350f',
              alpha: 0.95,
              decay: 0.02
            });
          } else if (land === WeatherType.NEITHAL) {
            particles.push({
              x: state.boss.x + (Math.random() - 0.5) * 100,
              y: state.boss.y + (Math.random() - 0.5) * 100,
              vx: -5 - Math.random() * 4,
              vy: -3 + Math.random() * 6,
              radius: 2 + Math.random() * 5,
              color: Math.random() > 0.5 ? '#38bdf8' : '#0284c7',
              alpha: 0.9,
              decay: 0.025
            });
          } else if (land === WeatherType.PALAI) {
            particles.push({
              x: state.boss.x + (Math.random() - 0.5) * 80,
              y: state.boss.y + (Math.random() - 0.5) * 80,
              vx: -3 - Math.random() * 4,
              vy: -2 - Math.random() * 2,
              radius: 2 + Math.random() * 4,
              color: Math.random() > 0.4 ? '#f97316' : '#ea580c',
              alpha: 1.0,
              decay: 0.02
            });
          }
        }
      }

      // Autopilot Auto-flying controls (watches bird and flaps automatically to hover near center)
      if (state.autoPilotTimeLeft > 0) {
        state.autoPilotTimeLeft -= (1 / 60) * ts;
        if (state.autoPilotTimeLeft < 0) state.autoPilotTimeLeft = 0;

        // Keep bird floating beautifully near the center height
        const targetHeight = dimensions.height / 2;
        if (player.y > targetHeight + 15 && player.vy > 0.3) {
          player.vy = -6.2; // simulated flap strength
          player.wingDirection = -1;
          AudioEngine.playFlap();

          // Spawn flight particles
          for (let i = 0; i < 5; i++) {
            particles.push({
              x: 100 - player.radius,
              y: player.y + 10,
              vx: -2 - Math.random() * 3,
              vy: (Math.random() - 0.5) * 2,
              radius: 2 + Math.random() * 3,
              color: selectedSkin.trailColor,
              alpha: 0.8,
              decay: 0.04,
            });
          }
        }
      }

      // Restrain bird in boundaries
      if (player.y - player.radius < 0) {
        player.y = player.radius;
        player.vy = 0;
      }
      if (player.y + player.radius > dimensions.height) {
        player.y = dimensions.height - player.radius;
        player.vy = 0;
        if (!state.isDying) {
          // Landed on floor - CRASH!
          triggerGameOver();
        }
      }

      // Rotate bird: Spin rapidly when dying, otherwise align with velocity
      if (state.isDying) {
        player.rotation += 0.22; // Dramatic tumble spin!
      } else {
        // Rotate bird based on velocity
        const targetRotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 6, player.vy * 0.06));
        player.rotation += (targetRotation - player.rotation) * 0.2;
      }

      // Animate wings
      const wingSpeed = player.boostTimeLeft > 0 ? 0.6 : (0.15 + Math.abs(player.vy) * 0.04);
      player.wingAngle += wingSpeed * player.wingDirection * ts;
      if (player.wingAngle > Math.PI / 4) {
        player.wingAngle = Math.PI / 4;
        player.wingDirection = -1;
      } else if (player.wingAngle < -Math.PI / 6) {
        player.wingAngle = -Math.PI / 6;
        player.wingDirection = 1;
      }

      // Update dynamic camera zoom and Y-tracking (lerp for cinematic buttery smoothness)
      const targetZoom = state.rageActive ? 1.15 : 1.00;
      state.cameraZoom += (targetZoom - state.cameraZoom) * 0.08 * ts;

      // Keep the camera vertically stable within the screen dimensions
      const targetCameraY = Math.max(150, Math.min(dimensions.height - 150, player.y));
      state.cameraY += (targetCameraY - state.cameraY) * 0.08 * ts;

      // Decrement timers
      if (player.shieldTimeLeft > 0) player.shieldTimeLeft -= ts;
      if (player.invincibilityTimeLeft > 0) player.invincibilityTimeLeft -= ts;
      if (player.slowMoTimeLeft > 0) {
        player.slowMoTimeLeft -= ts;
        if (player.slowMoTimeLeft <= 0 && player.timeWarpTimeLeft <= 0) state.slowMoTarget = 1.0;
      }
      if (player.doubleScoreTimeLeft > 0) player.doubleScoreTimeLeft -= ts;
      if (player.goldenAuraTimeLeft > 0) player.goldenAuraTimeLeft -= ts;
      if (player.timeWarpTimeLeft > 0) {
        player.timeWarpTimeLeft -= ts;
        if (player.timeWarpTimeLeft <= 0 && player.slowMoTimeLeft <= 0) state.slowMoTarget = 1.0;
      }
      if (player.magnetTimeLeft > 0) player.magnetTimeLeft -= ts;
      if (player.windRiderTimeLeft > 0) player.windRiderTimeLeft -= ts;

      // Combo streak decay
      if (state.currentCombo > 0) {
        state.comboStreakTimer -= ts;
        if (state.comboStreakTimer <= 0) {
          state.currentCombo = 0;
          setCombo(0);
        }
      }

      // Generate flight dust particle trails
      if (state.frameCount % 2 === 0) {
        player.trail.push({
          x: 100 - player.radius,
          y: player.y + (Math.random() - 0.5) * 8,
          alpha: 1.0,
          scale: 1.0,
        });
      }
      player.trail.forEach(t => {
        t.alpha -= 0.04 * ts;
        t.scale -= 0.02 * ts;
      });
      player.trail = player.trail.filter(t => t.alpha > 0);

      // Spawn beautiful, realistic trailing feathers in the wind occasionally!
      if (state.frameCount % 8 === 0 && (selectedSkin.type === 'phoenix' || selectedSkin.type === 'garuda' || selectedSkin.type === 'peacock')) {
        state.particles.push({
          x: 100 - player.radius,
          y: player.y + (Math.random() - 0.5) * 12,
          vx: -2.0 - Math.random() * 2.5,
          vy: -0.5 + Math.random() * 1.5,
          radius: 3 + Math.random() * 4,
          color: selectedSkin.trailColor,
          alpha: 1.0,
          decay: 0.02,
          isFeather: true,
          angle: Math.random() * Math.PI * 2,
          spin: -0.05 + Math.random() * 0.1,
          gravity: 0.01
        });
      }

      // Handle parallax background positions
      state.bgParallax.forEach(layer => {
        // Base movement + game speed factor for more dynamic feel
        const effectiveSpeed = (0.2 + state.gameSpeed * 0.1) * layer.speed;
        layer.x -= effectiveSpeed * ts;
        if (layer.x <= -dimensions.width) {
          layer.x = 0;
        }
      });

      // Update Obstacles & handle collisions
      let triggerNearMiss = false;
      let passOccurred = false;

      obstacles.forEach(obs => {
        obs.x -= state.gameSpeed;

        // Dynamic jumpscare behavior for CROCODILE, CRAB, and PLANT
        if (obs.type === ObstacleType.CROCODILE) {
          if (obs.x < 360 && obs.x > 100) {
            const distRatio = (360 - obs.x) / (360 - 100);
            const jumpOffset = Math.sin(distRatio * Math.PI) * 110;
            obs.bottomHeight = 50 + jumpOffset;
          } else {
            obs.bottomHeight = 50;
          }
        } else if (obs.type === ObstacleType.CRAB) {
          if (obs.x < 330 && obs.x > 100) {
            const distRatio = (330 - obs.x) / (330 - 100);
            const attackOffset = Math.pow(distRatio, 2.0) * 85;
            obs.bottomHeight = 45 + attackOffset;
          } else {
            obs.bottomHeight = 45;
          }
        } else if (obs.type === ObstacleType.PLANT) {
          if (obs.x < 350 && obs.x > 100) {
            const distRatio = (350 - obs.x) / (350 - 100);
            const stretchOffset = Math.sin(distRatio * Math.PI) * 125; // stretches up and shrinks back down
            obs.bottomHeight = 40 + stretchOffset;
          } else {
            obs.bottomHeight = 40;
          }
        }

        // Moving pillars up/down simulation
        if (obs.type === ObstacleType.MOVING_PILLAR) {
          obs.currentYOffset += obs.speedY * ts;
          if (Math.abs(obs.currentYOffset) > obs.rangeY) {
            obs.speedY = -obs.speedY; // bounce back
          }
        }

        // Rotating lasers simulation
        if (obs.type === ObstacleType.ROTATING_LASER) {
          obs.laserAngle += obs.laserSpeed * ts;
        }

        // Hit tests (Circle-to-Box or complex bounding geometries)
        const topBox = {
          x: obs.x,
          y: 0,
          w: obs.width,
          h: obs.topHeight + obs.currentYOffset,
        };
        const bottomBox = {
          x: obs.x,
          y: dimensions.height - obs.bottomHeight + obs.currentYOffset,
          w: obs.width,
          h: obs.bottomHeight - obs.currentYOffset,
        };

        const checkCollision = (box: typeof topBox) => {
          const closestX = Math.max(box.x, Math.min(100, box.x + box.w));
          const closestY = Math.max(box.y, Math.min(player.y, box.y + box.h));
          const distanceX = 100 - closestX;
          const distanceY = player.y - closestY;
          const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
          return distanceSquared < (player.radius * player.radius);
        };

        const getDistanceToObstacle = (box: typeof topBox) => {
          const closestX = Math.max(box.x, Math.min(100, box.x + box.w));
          const closestY = Math.max(box.y, Math.min(player.y, box.y + box.h));
          const distanceX = 100 - closestX;
          const distanceY = player.y - closestY;
          return Math.sqrt((distanceX * distanceX) + (distanceY * distanceY));
        };

        // Determine if player passed near obstacle edges (NEAR MISS / JUICE system)
        if (!obs.passed && obs.x < 100 && state.autoPilotTimeLeft <= 0) {
          const distTop = getDistanceToObstacle(topBox);
          const distBottom = getDistanceToObstacle(bottomBox);
          const minSafeDist = player.radius + 18;

          if ((distTop < minSafeDist || distBottom < minSafeDist) && player.boostTimeLeft <= 0) {
            // Near-miss triggers close combo multipliers
            if (state.comboTimer === 0) {
              triggerNearMiss = true;
              state.comboTimer = 45; // Cool-down frames
              state.currentCombo++;
              state.comboStreakTimer = 240; // 4 seconds window
              state.maxComboReached = Math.max(state.maxComboReached, state.currentCombo);
              setCombo(state.currentCombo);

              // Yali spirit bird near-miss shield activate
              if (selectedSkin.id === 'yali') {
                player.shieldTimeLeft = 90; // 1.5 seconds of protective shield burst!
                AudioEngine.playShieldActivate();
                state.nearMissAlerts.push({
                  x: 100,
                  y: player.y - 30,
                  text: 'யாழி காப்பு! (YALI SHIELD)',
                  alpha: 1.5,
                  isTamil: true,
                  customColor: '#E040FB',
                  sizeScale: 1.25,
                });
              }
            }
          }
        }

        const collided = (state.isDying || state.autoPilotTimeLeft > 0) ? false : (checkCollision(topBox) || checkCollision(bottomBox));

        // Check laser collision specifically
        let laserCollided = false;
        if (!state.isDying && state.autoPilotTimeLeft <= 0 && obs.type === ObstacleType.ROTATING_LASER && obs.x < dimensions.width && obs.x > -100) {
          // A laser beam rotates outward from the center of the gap
          const centerY = obs.topHeight + obs.currentYOffset + obs.gap / 2;
          const laserLength = 150;
          const endX = obs.x + obs.width / 2 + Math.cos(obs.laserAngle) * laserLength;
          const endY = centerY + Math.sin(obs.laserAngle) * laserLength;

          // Simple segment to point collision approximation
          const lX1 = obs.x + obs.width / 2;
          const lY1 = centerY;
          const lX2 = endX;
          const lY2 = endY;

          const pX = 100;
          const pY = player.y;

          const A = pX - lX1;
          const B = pY - lY1;
          const C = lX2 - lX1;
          const D = lY2 - lY1;

          const dot = A * C + B * D;
          const lenSq = C * C + D * D;
          let param = -1;
          if (lenSq !== 0) param = dot / lenSq;

          let xx, yy;
          if (param < 0) {
            xx = lX1;
            yy = lY1;
          } else if (param > 1) {
            xx = lX2;
            yy = lY2;
          } else {
            xx = lX1 + param * C;
            yy = lY1 + param * D;
          }

          const dx = pX - xx;
          const dy = pY - yy;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < player.radius + 3) {
            laserCollided = true;
          }
        }

        if (collided || laserCollided) {
          if (player.boostActive || player.boostTimeLeft > 0) {
            // Smash through obstacles under celestial boost!
            shatterObstacle(obs);
            obstacles.splice(obstacles.indexOf(obs), 1);
          } else if (player.goldenAuraTimeLeft > 0) {
            // Deflected by Golden Aura shield!
            player.goldenAuraTimeLeft = 0;
            state.screenShake = 22;
            AudioEngine.playCrash();
            triggerCssShake();
            
            // Golden Aura deflects with absolute brilliance - spawn gorgeous golden particles
            for (let i = 0; i < 22; i++) {
              const angle = Math.random() * Math.PI * 2;
              const speed = 3 + Math.random() * 5;
              state.particles.push({
                x: 100,
                y: player.y,
                vx: Math.cos(angle) * speed - 1.5,
                vy: Math.sin(angle) * speed,
                radius: 3 + Math.random() * 4,
                color: '#ffd700',
                alpha: 1.0,
                decay: 0.02,
                glow: true,
              });
            }

            // Keep half of combo streak as a reward for Golden Aura!
            state.currentCombo = Math.floor(state.currentCombo / 2);
            state.comboStreakTimer = state.currentCombo > 0 ? 240 : 0;
            setCombo(state.currentCombo);

            state.nearMissAlerts.push({
              x: 100,
              y: player.y - 25,
              text: '✨ கவசம் தகர்ந்தது (AURA BROKEN) ✨',
              alpha: 1.5,
              isTamil: true,
              customColor: '#ffd700',
              sizeScale: 1.1,
            });

            AudioEngine.speakSpiritual("The Golden Aura has absorbed the collision impact.");

            // Shatter visual feedback
            shatterObstacle(obs);
            obstacles.splice(obstacles.indexOf(obs), 1);
          } else if (player.shieldTimeLeft > 0) {
            // Deflected by sacred shield
            player.shieldTimeLeft = 0;
            state.screenShake = 15;
            AudioEngine.playCrash();
            triggerCssShake();
            
            // Reset combo streak on shield break
            state.currentCombo = 0;
            state.comboStreakTimer = 0;
            setCombo(0);

            // Shatter visual feedback
            shatterObstacle(obs);
            obstacles.splice(obstacles.indexOf(obs), 1);
          } else if (player.invincibilityTimeLeft <= 0) {
            // Check life
            if (player.lives > 1) {
              player.lives -= 1;
              setLives(player.lives);
              const currentDurabilityLvl = state.upgrades?.durability || 1;
              player.invincibilityTimeLeft = 90 + (currentDurabilityLvl - 1) * 30; // Extended i-frames based on durability level!
              state.screenShake = 20;
              state.screenFlashAlpha = 0.65; // Trigger red impact flash!
              state.timeScale = 0.45; // Slow motion feel on impact
              state.slowMoTarget = 0.6; // Keep it slightly slower
              setTimeout(() => {
                state.slowMoTarget = 1.0; // Return to normal speed after 500ms
              }, 500);
              AudioEngine.playCrash();
              triggerCssShake();
            } else {
              // Crash and game over
              triggerGameOver();
            }
          }
        }

        // Detect successful passing
        if (!obs.passed && obs.x + obs.width < 100) {
          obs.passed = true;
          passOccurred = true;

          // Increment Combo Streak on successful gate pass!
          state.currentCombo++;
          state.comboStreakTimer = 240; // 4 seconds window
          state.maxComboReached = Math.max(state.maxComboReached, state.currentCombo);
          setCombo(state.currentCombo);

          // Peacock speed boost on pass!
          if (selectedSkin.id === 'peacock' && player.boostTimeLeft <= 0) {
            player.boostTimeLeft = 45; // 45 frames (0.75 seconds) of celestial fast swift boost!
            AudioEngine.playBoost();
            state.nearMissAlerts.push({
              x: 100,
              y: player.y - 25,
              text: 'மயில் வேகம்! (PEACOCK SWIFT)',
              alpha: 1.5,
              isTamil: true,
              customColor: '#00E676',
              sizeScale: 1.2,
            });
          }
        }
      });

      // Filter out offscreen obstacles and cap active obstacles count to 10 for performance pooling
      state.obstacles = obstacles.filter(obs => obs.x + obs.width > -150).slice(0, 10);

      // Handle passed score triggers
      if (passOccurred) {
        const comboMultiplier = state.currentCombo >= 15 ? 5 : (state.currentCombo >= 10 ? 3 : (state.currentCombo >= 5 ? 2 : 1));
        const passPoints = (player.doubleScoreTimeLeft > 0 ? 2 : 1) * comboMultiplier;
        const previousScore = state.currentScore;
        state.currentScore += passPoints;
        setScore(state.currentScore);


        // Periodically show milestone or level up of combo
        if (state.currentCombo % 5 === 0 && state.currentCombo > 0) {
          state.nearMissAlerts.push({
            x: 100,
            y: player.y - 30,
            text: `🔥 STREAK COMBO: ${state.currentCombo} (x${comboMultiplier} Multiplier) 🔥`,
            alpha: 1.5,
            customColor: '#ffcc33',
            sizeScale: 1.1,
          });
        }

        // AI Performance adaptive increase!
        state.aiPerformanceScore = Math.min(100, state.aiPerformanceScore + 3);

        // Standard passing charges Agni Rage too!
        if (!state.rageActive) {
          state.rageChargeVal = Math.min(100, state.rageChargeVal + 5);
          setRageCharge(state.rageChargeVal);
        setBossPowerFeathers(state.bossPowerFeathers);
        setIsBossPowerActive(state.bossPowerActive);
          if (state.rageChargeVal >= 100) {
            triggerAgniRageMode();
          }
        }

        // Play sustained golden Temple Bell resonance every 50 points
        const reachedMilestone50 = Math.floor(state.currentScore / 50) > Math.floor(previousScore / 50);
        if (reachedMilestone50 && state.currentScore > 0) {
          AudioEngine.playTempleBellMilestone();
          state.screenShake = 16;
          
          // Show grand on-screen gold announcement
          state.nearMissAlerts.push({
            x: dimensions.width / 2,
            y: dimensions.height / 3,
            text: `🔔 TEMPLE BELL RESONANCE! +50 PTS 🔔`,
            alpha: 2.0,
            customColor: '#ffd700',
            sizeScale: 1.2,
          });

          // Play spiritual audio milestone narration
          AudioEngine.speakSpiritual(`Milestone ${state.currentScore} points. Temple restoration growing.`);
        } else {
          AudioEngine.playScore();
        }
        
        AudioEngine.updateScore(state.currentScore);

        // Score milestones trigger visual fireworks/confetti
        if (state.currentScore % 10 === 0) {
          triggerScoreCelebration();
        }
      }

      // Near-miss triggers dynamic slow-motion zoom & sound
      if (triggerNearMiss) {
        state.slowMoTarget = 0.35; // Go slow-mo!
        state.screenShake = 8;
        AudioEngine.playNearMiss();

        // AI performance bump
        state.aiPerformanceScore = Math.min(100, state.aiPerformanceScore + 6);

        // Charge Rage!
        if (!state.rageActive) {
          state.rageChargeVal = Math.min(100, state.rageChargeVal + 16);
          setRageCharge(state.rageChargeVal);
          if (state.rageChargeVal >= 100) {
            triggerAgniRageMode();
          }
        }
        
        const nearMissPhrases = [
          `Veera! (வீரா!) +${state.currentCombo}x`,
          `Amazing! (அற்புதம்!) +${state.currentCombo}x`,
          `Gethu! (கெத்து!) +${state.currentCombo}x`,
          `Sabaash! (சபாஷ்!) +${state.currentCombo}x`,
          `Dheeran! (தீரன்!) +${state.currentCombo}x`,
          `Sakthi! (சக்தி!) +${state.currentCombo}x`
        ];
        const chosenPhrase = nearMissPhrases[Math.floor(Math.random() * nearMissPhrases.length)];

        // Choose a random glorious accent color
        const alertColors = ['#ffd700', '#ff6a00', '#ff3d00', '#ff007f', '#00f6ff'];
        const chosenColor = alertColors[Math.floor(Math.random() * alertColors.length)];

        state.nearMissAlerts.push({
          x: 140,
          y: player.y - 20,
          text: chosenPhrase,
          alpha: 1.5, // Start with a slight overshoot for extended brightness
          isTamil: true,
          customColor: chosenColor,
          scale: 0.1, // Scale up from tiny to full size!
          sizeScale: 1.25, // Base size scale
          vx: 0.5 + Math.random() * 1.0, // Float slightly forward
          vy: -1.8 - Math.random() * 1.2, // Float upwards smoothly
          wiggleSpeed: 0.04 + Math.random() * 0.04,
          wiggleAmount: 1.0 + Math.random() * 1.5,
          seed: Math.random() * 100,
        });

        // Spawn a glorious burst of sparkles / sacred embers around the near-miss spot
        for (let i = 0; i < 15; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 2 + Math.random() * 4;
          state.particles.push({
            x: 100,
            y: player.y,
            vx: Math.cos(angle) * speed - 1.5, // slightly drift leftward in the wind
            vy: Math.sin(angle) * speed,
            radius: 2 + Math.random() * 3,
            color: i % 3 === 0 ? '#ffd700' : (i % 3 === 1 ? '#ff6a00' : '#ff3d00'),
            alpha: 1.0,
            decay: 0.03 + Math.random() * 0.03,
            glow: true,
          });
        }
        
        // Push near-miss bonus points
        state.currentScore += state.currentCombo;
        setScore(state.currentScore);

        // Sacred feathers award
        state.feathersEarned += 1;
        onFeatherCollect(1);
      } else if (state.comboTimer > 0) {
        state.comboTimer -= ts;
        if (state.comboTimer <= 0) {
          state.slowMoTarget = 1.0; // Return to standard speed
        }
      }

      
      // Boss Power Update
      if (state.bossPowerActive) {
        state.bossPowerTimeLeft -= ts;
        if (state.bossPowerTimeLeft <= 0) {
          state.bossPowerActive = false;
          setIsBossPowerActive(false);
        } else {
          if (selectedSkin.id === 'agni') {
             // Flame burst: continuous damage
             if (state.frameCount % 5 === 0) state.boss.health = Math.max(0, state.boss.health - 2);
             state.particles.push({
                x: player.x + player.radius,
                y: player.y + (Math.random()-0.5)*10,
                vx: 15,
                vy: 0,
                radius: 10 + Math.random()*10,
                color: '#ff3d00',
                alpha: 1,
                decay: 0.05,
                glow: true
             });
             // Destroy incoming obstacles handled by boost (I will add boost to Agni)
             player.boostTimeLeft = Math.max(player.boostTimeLeft, 2);
          } else if (selectedSkin.id === 'garuda') {
             // Sky Dash
             if (state.frameCount % 10 === 0) state.boss.health = Math.max(0, state.boss.health - 5);
             player.boostTimeLeft = Math.max(player.boostTimeLeft, 2);
             state.screenShake = 5;
          } else if (selectedSkin.id === 'mayil') {
             // Shield
             player.shieldTimeLeft = Math.max(player.shieldTimeLeft, 2);
          } else if (selectedSkin.id === 'koel') {
             // Shadow phase (boss stops attacking - handled in boss fire logic)
             player.invincibilityTimeLeft = Math.max(player.invincibilityTimeLeft, 2);
          } else if (selectedSkin.id === 'swan') {
             // Healing aura
             player.goldenAuraTimeLeft = Math.max(player.goldenAuraTimeLeft, 2);
          }
        }
      }
      
      // Rage & Weather Phase updates in main loop!
      if (state.rageActive) {
        state.rageTimeLeft -= ts;
        if (state.rageTimeLeft <= 0) {
          state.rageActive = false;
          state.slowMoTarget = 1.0;
          setIsRageActive(false);
          player.boostTimeLeft = 0; state.rageChargeVal = 0;
        } else {
          // Keep boost active and draw extra epic trails
          player.boostTimeLeft = Math.max(player.boostTimeLeft, 2);
          state.screenShake = Math.max(state.screenShake, 3);
          
          // Spawn massive fire particles from the player bird!
          if (state.frameCount % 2 === 0) {
            for (let i = 0; i < 3; i++) {
              state.particles.push({
                x: 100 - player.radius,
                y: player.y + (Math.random() - 0.5) * 16,
                vx: -6 - Math.random() * 5,
                vy: (Math.random() - 0.5) * 4,
                radius: 2 + Math.random() * 4,
                color: Math.random() > 0.4 ? '#ff3d00' : '#ffcc33',
                alpha: 0.9,
                decay: 0.04,
                glow: true,
              });
            }
          }
        }
      } else {
        // Slow decay of rage value when not active
        if (state.rageChargeVal > 0 && state.frameCount % 8 === 0) {
          state.rageChargeVal = Math.max(0, state.rageChargeVal - 0.3);
          setRageCharge(state.rageChargeVal);
        }
      }

      // Weather dynamic phases update!
      state.weatherPhaseTimer -= ts;
      if (state.weatherPhaseTimer <= 0) {
        state.weatherPhaseTimer = 650 + Math.random() * 450; // ~11 to 18 seconds
        const phases = ['clear', 'fog', 'thunder', 'ember'];
        const currentIdx = phases.indexOf(state.currentWeatherPhase);
        const nextIdx = (currentIdx + 1) % phases.length;
        state.currentWeatherPhase = phases[nextIdx];

        // Trigger visual alerts & narration
        let alertText = '';
        let tamilText = '';
        let voiceNarration = '';
        
        if (state.currentWeatherPhase === 'clear') {
          alertText = '☀️ CLEAR SKIES: THE DIVINE SHINES ☀️';
          tamilText = 'தெளிவான வானம்: அருள் ஒளி வீசுகிறது';
          voiceNarration = 'The divine sun shines. Sky is clear.';
          setWeatherPhase('CLEAR SKY');
        } else if (state.currentWeatherPhase === 'fog') {
          alertText = '🌫️ SACRED TEMPLE FOG: VISIBILITY REDUCED 🌫️';
          tamilText = 'புனித பனிமூட்டம்: விழிப்புடன் பறக்கவும்';
          voiceNarration = 'Sacred fog approaches. fly carefully.';
          setWeatherPhase('SACRED FOG');
        } else if (state.currentWeatherPhase === 'thunder') {
          alertText = '⚡ THUNDER SHIELD ACTIVATED: STORM WRATH ⚡';
          tamilText = 'மின்னல் சீற்றம்: அஞ்சாமல் முன்னேறு';
          voiceNarration = 'Monsoon thunder strikes! Feel the energy.';
          setWeatherPhase('THUNDER SHIELD');
        } else if (state.currentWeatherPhase === 'ember') {
          alertText = '🔥 EMBER STORM: SACRED ASH AND FLAME 🔥';
          tamilText = 'அக்னி புயல்: சிறகுகள் தீப்பற்றின';
          voiceNarration = 'Ember storm rises. Agni wings ignited.';
          setWeatherPhase('EMBER STORM');
        }

        AudioEngine.speakSpiritual(voiceNarration);

        state.nearMissAlerts.push({
          x: dimensions.width / 2,
          y: dimensions.height / 3,
          text: alertText,
          alpha: 1.8,
          customColor: '#ffcc33',
          sizeScale: 1.15,
        });

        state.nearMissAlerts.push({
          x: dimensions.width / 2,
          y: dimensions.height / 3 + 25,
          text: tamilText,
          alpha: 1.8,
          isTamil: true,
          customColor: '#ff6600',
          sizeScale: 1.0,
        });
      }

      // Update Floating Powerups
      powerUps.forEach(pw => {
        // Collision check metrics
        let dx = 100 - pw.x;
        let dy = player.y - pw.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        // Magnetic Attraction: Active under magnet power-up, or passively within 250px for feathers and health refill items
        const isFeatherOrOrb = pw.type === PowerUpType.SACRED_FEATHER || pw.type === PowerUpType.COIN || 
                               pw.type === PowerUpType.SOUL_FRAGMENT || 
                               pw.type === PowerUpType.DIVINE_ORB_SMALL || 
                               pw.type === PowerUpType.DIVINE_ORB_FULL;
                               
        if (player.magnetTimeLeft > 0 || (isFeatherOrOrb && dist < 250)) {
          // Attract smoothly to player coordinates (x = 100, y = player.y)
          const pullStrength = 0.12 * ts;
          pw.x += (100 - pw.x) * pullStrength;
          pw.y += (player.y - pw.y) * pullStrength;
          
          // Re-calculate distance after pulling
          dx = 100 - pw.x;
          dy = player.y - pw.y;
          dist = Math.sqrt(dx * dx + dy * dy);
        } else {
          // Normal horizontal scroll
          pw.x -= state.gameSpeed;
        }

        // Pulsing scale
        pw.pulseScale += 0.03 * pw.pulseDirection * ts;
        if (pw.pulseScale > 1.25) pw.pulseDirection = -1;
        if (pw.pulseScale < 0.85) pw.pulseDirection = 1;

        // Hitbox collision check (expanded by +15px for feathers and orbs for extremely fair & smooth collection!)
        const effectiveRadius = isFeatherOrOrb ? pw.radius + 15 : pw.radius;

        if (dist < player.radius + effectiveRadius) {
          pw.collected = true;
          activatePowerUp(pw);
        }
      });
      state.powerUps = powerUps.filter(pw => !pw.collected && pw.x + pw.radius > -50);

      // Procedural weather updates
      if (weather === WeatherType.MARUTHAM) {
        state.lightningTimer -= ts;
        if (state.lightningTimer <= 0) {
          // Trigger lightning strikes
          triggerLightning();
          state.lightningTimer = 200 + Math.random() * 400;
        }
      }

      // Clean lightning trails
      if (state.lightningStrike) {
        state.screenShake = Math.max(state.screenShake, 5);
        if (Math.random() > 0.85) {
          state.lightningStrike = null;
        }
      }

      // Handle Near Miss alerts fading out and floating dynamically with pop animation
      state.nearMissAlerts.forEach(alert => {
        const vy = alert.vy !== undefined ? alert.vy : -1.2;
        const vx = alert.vx !== undefined ? alert.vx : 0;
        const wiggleSpeed = alert.wiggleSpeed !== undefined ? alert.wiggleSpeed : 0.05;
        const wiggleAmount = alert.wiggleAmount !== undefined ? alert.wiggleAmount : 0;
        const seed = alert.seed !== undefined ? alert.seed : 0;

        alert.y += vy * ts;
        alert.x += vx * ts;
        if (wiggleAmount > 0) {
          alert.x += Math.sin(state.frameCount * wiggleSpeed + seed) * wiggleAmount * ts;
        }

        // Pop scaling animation
        if (alert.scale !== undefined && alert.scale < 1.0) {
          alert.scale += (1.0 - alert.scale) * 0.15 * ts;
        }

        // Slower decay or custom decay
        alert.alpha -= 0.015 * ts;
      });
      state.nearMissAlerts = state.nearMissAlerts.filter(a => a.alpha > 0);

      // Process Particles (physics, drag, gravity)
      particles.forEach(p => {
        if (p.gravity) p.vy += p.gravity * ts;
        p.x += p.vx * ts;
        p.y += p.vy * ts;
        p.alpha -= p.decay * ts;
        if (p.isFeather && p.angle !== undefined && p.spin !== undefined) {
          p.angle += p.spin * ts;
          p.vx += -0.02 * ts; // Slowly drift backward in the headwind
        }
      });
      // Cap standard particles to max 150 to maintain solid 60fps performance
      state.particles = particles.filter(p => p.alpha > 0).slice(0, 150);

      // Weather-based particle system (embers and ash)
      let maxWeatherParticles = 25;
      let spawnChance = 0.05;
      let minSpeedX = -1.2;
      let maxSpeedX = -0.5;
      let maxSpeedY = 0.2;
      
      if (difficulty === Difficulty.HARD) {
        maxWeatherParticles = 60;
        spawnChance = 0.18;
        minSpeedX = -2.8;
        maxSpeedX = -1.5;
        maxSpeedY = 0.5;
      } else if (difficulty === Difficulty.IMPOSSIBLE) {
        maxWeatherParticles = 110;
        spawnChance = 0.45;
        minSpeedX = -6.0;
        maxSpeedX = -3.5;
        maxSpeedY = 1.2;
      }

      // Spawning new weather particles
      if (state.weatherParticles.length < maxWeatherParticles && Math.random() < spawnChance) {
        const isInitial = state.weatherParticles.length === 0;
        const x = isInitial ? Math.random() * dimensions.width : dimensions.width + 10;
        const y = Math.random() * dimensions.height;
        const isEmber = Math.random() > 0.4; // 60% embers, 40% ash
        
        const vx = minSpeedX + Math.random() * (maxSpeedX - minSpeedX);
        const vy = (Math.random() - 0.5) * maxSpeedY * 2;
        const radius = isEmber ? (1 + Math.random() * 2) : (1.5 + Math.random() * 2.5);
        
        // Embers are fiery orange/yellow; ash is grey/white
        const color = isEmber 
          ? (Math.random() > 0.5 ? '#ff4d00' : '#ffaa00') 
          : (Math.random() > 0.5 ? 'rgba(200, 200, 200, 0.45)' : 'rgba(150, 150, 150, 0.3)');

        state.weatherParticles.push({
          x,
          y,
          vx,
          vy,
          radius,
          color,
          alpha: 0.1 + Math.random() * 0.8,
          decay: 0.001 + Math.random() * 0.003, // slow decay for long life
          glow: isEmber,
          wiggleSpeed: 0.03 + Math.random() * 0.05,
          wiggleAmplitude: 0.3 + Math.random() * 0.7,
          wiggleOffset: Math.random() * Math.PI * 2
        });
      }

      // Update weather particles
      state.weatherParticles.forEach((p: any) => {
        p.x += p.vx * ts;
        const wiggle = Math.sin(state.frameCount * p.wiggleSpeed + p.wiggleOffset) * p.wiggleAmplitude;
        p.y += (p.vy + wiggle) * ts;
        p.alpha -= p.decay * ts;
      });
      // Cap weather particles to maximum limit to prevent CPU/GPU rendering load
      state.weatherParticles = state.weatherParticles.filter((p: any) => p.alpha > 0).slice(0, maxWeatherParticles);

      const distanceMeters = Math.floor(state.distanceRun / 10);
      
      // Smooth Land Transition Check (Time/Distance/Score based)
      let distanceLand = getWeatherType(distanceMeters, weather);
      if (isStoryMode) {
        const lands = [WeatherType.KURINJI, WeatherType.KURINJI, WeatherType.MULLAI, WeatherType.MARUTHAM, WeatherType.NEITHAL, WeatherType.PALAI];
        distanceLand = lands[storyLevel] || WeatherType.KURINJI;
      } else {
        const lands = [
          WeatherType.KURINJI,
          WeatherType.MULLAI,
          WeatherType.MARUTHAM,
          WeatherType.NEITHAL,
          WeatherType.PALAI
        ];
        const startIdx = lands.indexOf(weather) !== -1 ? lands.indexOf(weather) : 0;
        const cycleIdx = Math.floor((state.playTimeSeconds || 0) / 300); // Shift every 5 minutes of active play
        distanceLand = lands[(startIdx + cycleIdx) % lands.length];
      }

      if (distanceLand !== state.currentLand) {
        state.lastLandBeforeTransition = state.currentLand;
        state.currentLand = distanceLand;
        state.landTransitionAlpha = 0.0; // trigger crossfade fade-in
        
        if (true) {
          AudioEngine.setLand(distanceLand);
          state.nearMissAlerts.push({
            x: dimensions.width / 2,
            y: dimensions.height / 3,
            text: `🌌 SHIFTING TO ${distanceLand} LANDSCAPE 🌌`,
            alpha: 2.2,
            customColor: '#ffcc33',
            sizeScale: 1.3,
          });
        }
      }
      
      // Boss triggers after every 1000m of distance run
      const isBossTime = distanceMeters >= state.nextBossTriggerDistance;
      
      if (isBossTime && !state.bossEncounterActive && !state.bossDefeated) {
        state.bossEncounterActive = true;
        state.bossIntroActive = true;
        state.bossIntroTimer = state.bossIntroMax;
        state.obstacles = [];
        state.powerUps = [];
        state.boss.x = dimensions.width + 200;
        state.boss.y = dimensions.height / 2;
        state.boss.targetY = dimensions.height / 2;
        state.boss.alpha = 0;
        
        let headerText = "⚠️ GUARDIAN OF THE TEMPLE AWAKENS ⚠️";
        let subText = "கோயில் பாதுகாவலர் விழித்துக் கொண்டார்! (Cleanse the shadow!)";
        let spokenText = "The ancient guardian awakens. Cleanse its shadow.";
        
        if (isStoryMode) {
          if (storyLevel === 1) {
            headerText = "⛰️ MOUNTAIN GUARDIAN: CORRUPTED YALI ⛰️";
            subText = "மலைக் காவலர் யாழி வந்துவிட்டது! (Purify Mount Yali!)";
            spokenText = "The sacred mountain guardian, Yali, approaches! Restore its ancient balance!";
            state.boss.maxHealth = 25;
            state.boss.health = 25;
          } else if (storyLevel === 2) {
            headerText = "🌳 FOREST GUARDIAN: SHADOW KOEL 🌳";
            subText = "காட்டுக் காவலர் குயில் வந்துவிட்டது! (Purify the Forest Koel!)";
            spokenText = "The mystic forest guardian, Koel, approaches! Guide it back to the light!";
            state.boss.maxHealth = 30;
            state.boss.health = 30;
          } else if (storyLevel === 3) {
            headerText = "🌾 TERRAIN GUARDIAN: RAGING BULL 🌾";
            subText = "நிலக் காவலர் சீறும் காளை வந்துவிட்டது! (Calm the Raging Bull!)";
            spokenText = "The farmland guardian, the Raging Bull, approaches! Soften its wrath!";
            state.boss.maxHealth = 35;
            state.boss.health = 35;
          } else if (storyLevel === 4) {
            headerText = "🌊 DEEP ABYSS: CORRUPTED SEA SERPENT 🌊";
            subText = "கடல் காவலர் பெருநாகம் வந்துவிட்டது! (Cleanse the Sea Serpent!)";
            spokenText = "The deep sea guardian, the Sea Serpent, rises! Calibrate its ancient currents!";
            state.boss.maxHealth = 40;
            state.boss.health = 40;
          } else if (storyLevel === 5) {
            headerText = "🔥 SCORCHED DESOLATION: SAND DEMON 🔥";
            subText = "பாலைவனக் காவலர் மணல் பேய் வந்துவிட்டது! (Overcome the Sand Demon!)";
            spokenText = "The scorched desert guardian, the Sand Demon, rises! Cool down its burning furnace!";
            state.boss.maxHealth = 45;
            state.boss.health = 45;
          }
        }
        
        state.nearMissAlerts.push({
          x: dimensions.width / 2,
          y: dimensions.height / 3 - 35,
          text: headerText,
          alpha: 3.0,
          customColor: '#ff3d00',
          sizeScale: 1.3,
        });
        state.nearMissAlerts.push({
          x: dimensions.width / 2,
          y: dimensions.height / 3,
          text: subText,
          alpha: 3.0,
          isTamil: true,
          customColor: '#ffffff',
          sizeScale: 1.0,
        });
        AudioEngine.speakSpiritual(spokenText);
        AudioEngine.playCrash(); // dramatic intro
      }
 
      if (!state.bossEncounterActive) {
        const stopObstacleSpawn = isStoryMode && (distanceMeters >= state.nextBossTriggerDistance - 100);
        if (!stopObstacleSpawn) {
          const lastObstacle = obstacles[obstacles.length - 1];
          const spatialCondition = !lastObstacle || (dimensions.width - lastObstacle.x >= diffSettings.spawnGap);
          // Fail-safe: Force spawn if no obstacle spawned in last 6 seconds (e.g., in case of extreme lag or edge cases)!
          const failSafeCondition = state.timeSinceLastSpawn >= 6.0;

          if (spatialCondition || failSafeCondition) {
            spawnObstacle(dimensions.width + 50);
            state.timeSinceLastSpawn = 0; // reset
          }
        }
      }

      // Track distance milestones (3000m interval as requested)
      const dist = Math.floor(distanceMeters);
      if (dist >= 3000 && dist % 3000 === 0) {
        const m = dist;
        if (!state.distanceMilestonesReached.includes(m)) {
          state.distanceMilestonesReached.push(m);
          
          // Trigger subtle milestone notification
          setMilestoneNotification({
            meters: m,
            label: `${m} METERS SOARED`,
            labelTamil: `${m} மீட்டர் கடந்துவிட்டீர்கள்`,
          });
          setTimeout(() => {
            setMilestoneNotification(null);
          }, 4500); // More time to read

          AudioEngine.playScore();
          // Spawn cool celebration sparks around the bird
          for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 6;
            state.particles.push({
              x: 100,
              y: player.y,
              vx: Math.cos(angle) * speed - 1.0,
              vy: Math.sin(angle) * speed,
              radius: 2 + Math.random() * 3.5,
              color: '#00e5ff',
              alpha: 1.0,
              decay: 0.02,
              glow: true,
            });
          }
          AudioEngine.speakSpiritual(`Wonderful! You have covered a sacred distance of ${m} meters.`);
        }
      }

      // Track High Score Milestones
      if (state.highScoreToBeat > 0) {
        // Close to high score
        if (!state.highScoreCloseAlertTriggered && state.currentScore >= state.highScoreToBeat - 2 && state.currentScore < state.highScoreToBeat) {
          state.highScoreCloseAlertTriggered = true;
          state.nearMissAlerts.push({
            x: dimensions.width / 2,
            y: dimensions.height / 3 - 30,
            text: `⚠️ APPROACHING SACRED RECORD: ${state.highScoreToBeat} PTS! ⚠️`,
            alpha: 2.2,
            customColor: '#ff9100',
            sizeScale: 1.1,
          });
          state.nearMissAlerts.push({
            x: dimensions.width / 2,
            y: dimensions.height / 3,
            text: `சாதனை எல்லை நெருங்குகிறது! கவனம்!`,
            alpha: 2.2,
            isTamil: true,
            customColor: '#ffea00',
            sizeScale: 0.95,
          });
          AudioEngine.speakSpiritual("Approach the threshold of destiny! The ancient high score gates await!");
        }

        // Exceeded high score
        if (!state.highScorePassed && state.currentScore > state.highScoreToBeat) {
          state.highScorePassed = true;
          state.screenShake = 22;
          AudioEngine.playTempleBellMilestone();
          triggerScoreCelebration();

          state.nearMissAlerts.push({
            x: dimensions.width / 2,
            y: dimensions.height / 3 - 35,
            text: `🏆 NEW HIGHEST ALTITUDE RECORD: ${state.currentScore} PTS! 🏆`,
            alpha: 2.8,
            customColor: '#ffd700',
            sizeScale: 1.25,
          });
          state.nearMissAlerts.push({
            x: dimensions.width / 2,
            y: dimensions.height / 3 - 5,
            text: `புதிய சாதனையை எட்டினீர்கள்! (New Personal Best)`,
            alpha: 2.8,
            isTamil: true,
            customColor: '#00e5ff',
            sizeScale: 1.0,
          });
          AudioEngine.speakSpiritual("Spectacular ascension! You have exceeded your previous high score and established a new divine realm!");
        }
      }

      // BOSS ENCOUNTER LOGIC
      if (state.bossEncounterActive && !state.bossDefeated) {
        // Move boss to target pos
        const bossTargetX = Math.min(800, dimensions.width - 150);
        state.boss.x += (bossTargetX - state.boss.x) * 0.05 * ts;
        state.boss.wobbleTimer += 0.05 * ts;
        state.boss.y = state.boss.targetY + Math.sin(state.boss.wobbleTimer) * 40;
        
        if (state.boss.alpha < 1) state.boss.alpha += 0.02 * ts;

        // Rhythmic attack - Optimized non-blocking single discrete spread trigger
        state.boss.attackTimer += 1 * ts;
        const phase = state.boss.health > 15 ? 0 : 1;
        const attackCycle = phase === 0 ? 150 : 100;
        
        if (state.boss.attackTimer > attackCycle) {
          // Trigger spread shot only once exactly as we cross attackCycle
          if (state.boss.attackTimer >= attackCycle && state.boss.attackTimer < attackCycle + ts * 1.5 && !(state.bossPowerActive && selectedSkin.id === 'koel')) {
            AudioEngine.playCollect(); 
            const projectileCount = phase === 0 ? 3 : 5;
            const startAng = phase === 0 ? -0.3 : -0.5;
            const endAng = phase === 0 ? 0.3 : 0.5;
            const stepAng = (endAng - startAng) / (projectileCount - 1);

            for(let ang = startAng; ang <= endAng + 0.01; ang += stepAng) {
              state.bossProjectiles.push({
                x: state.boss.x - 40,
                y: state.boss.y,
                vx: -7 * Math.cos(ang),
                vy: 7 * Math.sin(ang),
                radius: phase === 0 ? 8 : 12,
                type: 'shadow'
              });
            }
          }
          
          if (state.boss.attackTimer >= attackCycle + 30) {
             state.boss.attackTimer = 0;
             state.boss.targetY = 100 + Math.random() * 300;
             if (Math.random() > 0.7) {
                AudioEngine.speakSpiritual("You cannot escape the shadow!");
             }
          }
        }

        // Update Boss Projectiles
        for (let i = state.bossProjectiles.length - 1; i >= 0; i--) {
          const bp = state.bossProjectiles[i];
          bp.x += bp.vx * ts;
          bp.y += bp.vy * ts;
          
          if (bp.x < -50) {
            state.bossProjectiles.splice(i, 1);
            continue;
          }

          // Check collision with player
          const dx = bp.x - 100;
          const dy = bp.y - player.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < player.radius + bp.radius) {
            // Ignore collision if player has active invincibility frames
            if (player.invincibilityTimeLeft > 0) {
              state.bossProjectiles.splice(i, 1);
              continue;
            }

            if (state.bossPowerActive && selectedSkin.id === 'swan') {
              state.bossProjectiles.splice(i, 1);
              state.currentScore += 5;
              setScore(state.currentScore);
              const maxLives = 3 + (state.upgrades?.life - 1 || 0);
              if (player.lives < maxLives) {
                 player.lives++;
                 setLives(player.lives);
              }
              AudioEngine.playBoost();
              for (let k = 0; k < 10; k++) {
                state.particles.push({
                  x: bp.x, y: bp.y,
                  vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10,
                  radius: 2 + Math.random() * 4,
                  color: '#ffffff', alpha: 1, decay: 0.05, glow: true
                });
              }
              continue;
            }

            // Player hit by shadow projectile
            if (player.shieldTimeLeft > 0 || player.goldenAuraTimeLeft > 0 || state.sanjeeviniActive || state.rageActive) {
              // Protected
              if (player.shieldTimeLeft > 0) {
                const currentDurabilityLvl = state.upgrades?.durability || 1;
                const shieldDeduct = Math.max(10, 60 - (currentDurabilityLvl - 1) * 10); // Durability decreases shield wear on impact!
                player.shieldTimeLeft = Math.max(0, player.shieldTimeLeft - shieldDeduct);
              }
              if (player.goldenAuraTimeLeft > 0) player.goldenAuraTimeLeft -= 60;
              
              if (state.bossPowerActive && selectedSkin.id === 'mayil') {
                state.boss.health = Math.max(0, state.boss.health - 25);
                state.screenShake = 15;
              }

              state.bossProjectiles.splice(i, 1);
              AudioEngine.playCrash();
              triggerCssShake();
            } else {
              // Deduct life correctly instead of instant game over
              state.bossProjectiles.splice(i, 1);
              console.log(`[Collision Event] Player hit by boss shadow projectile. Lives before: ${player.lives}`);
              if (player.lives > 1) {
                player.lives -= 1;
                setLives(player.lives);
                const currentDurabilityLvl = state.upgrades?.durability || 1;
                player.invincibilityTimeLeft = 90 + (currentDurabilityLvl - 1) * 30; // Extended i-frames based on durability level!
                state.screenShake = 20;
                state.screenFlashAlpha = 0.65;
                state.timeScale = 0.45;
                state.slowMoTarget = 0.6;
                setTimeout(() => {
                  state.slowMoTarget = 1.0;
                }, 500);
                AudioEngine.playCrash();
                triggerCssShake();
              } else {
                player.lives = 0;
                setLives(0);
                state.isDying = true;
                state.deathTimer = 180;
                AudioEngine.playCrash();
                triggerGameOver();
              }
            }
          }
        }

        // Update Player Projectiles
        for (let i = state.playerProjectiles.length - 1; i >= 0; i--) {
          const pp = state.playerProjectiles[i];
          pp.x += pp.vx * ts;
          pp.y += pp.vy * ts;
          
          if (pp.x > dimensions.width + 50) {
            state.playerProjectiles.splice(i, 1);
            continue;
          }

          // Check collision with Boss
          const dx = pp.x - state.boss.x;
          const dy = pp.y - state.boss.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 50 + pp.radius) { // Boss radius approx 50
            const currentAttackLvl = state.upgrades?.attack || 1;
            // Base damage is 3. Level 2=5, Level 3=7, Level 4=9, Level 5=11, Level 6=15!
            const hitDamage = currentAttackLvl === 6 ? 15 : (3 + (currentAttackLvl - 1) * 2);
            state.boss.health = Math.max(0, state.boss.health - hitDamage);
            
            // Skill-based healing mechanics (every 15 hits restores 1 life if below max)
            player.healCharge = (player.healCharge || 0) + 1;
            if (player.healCharge >= 15) {
              player.healCharge = 0;
              const maxLives = 3 + (state.upgrades?.life - 1 || 0);
              if (player.lives < maxLives) {
                player.lives += 1;
                setLives(player.lives);
                
                // Visual heal effect
                for(let h=0; h<20; h++) {
                  state.particles.push({
                    x: player.x + (Math.random() - 0.5) * 40,
                    y: player.y + (Math.random() - 0.5) * 40,
                    vx: 0,
                    vy: -2 - Math.random() * 2,
                    radius: 3 + Math.random() * 3,
                    color: '#4ade80',
                    alpha: 1,
                    decay: 0.02
                  });
                }
              }
            }
            state.playerProjectiles.splice(i, 1);
            
            // Hit sparks
            for (let j = 0; j < 5; j++) {
              state.particles.push({
                x: state.boss.x,
                y: state.boss.y,
                vx: -2 + Math.random() * 4,
                vy: -2 + Math.random() * 4,
                radius: 2 + Math.random() * 4,
                color: '#fff',
                alpha: 1,
                decay: 0.05
              });
            }
            
            if (state.boss.health <= 0) {
              state.bossDefeated = true;
              AudioEngine.playTempleBellMilestone();
              state.screenShake = 30;
              state.currentScore += 500; // Big reward!
              state.nearMissAlerts.push({
                x: dimensions.width / 2,
                y: dimensions.height / 3 - 35,
                text: `✨ GUARDIAN CLEANSED! ✨ (+500 PTS)`,
                alpha: 3.0,
                customColor: '#ffd700',
                sizeScale: 1.4,
              });
              AudioEngine.speakSpiritual("The ancient guardian is cleansed. The shadow is lifted from the tower.");
              // Boss explode particles
              for (let j = 0; j < 50; j++) {
                state.particles.push({
                  x: state.boss.x,
                  y: state.boss.y,
                  vx: (Math.random() - 0.5) * 15,
                  vy: (Math.random() - 0.5) * 15,
                  radius: 3 + Math.random() * 5,
                  color: '#ffd700',
                  alpha: 1,
                  decay: 0.02,
                  glow: true
                });
              }

              // Infinite Mode and Story Mode progression check
              // Clear out current projectiles immediately
              state.bossProjectiles = [];
              const currentDistMeters = Math.floor(state.distanceRun / 10);
              
              if (!isStoryMode) {
                // Trigger the next boss at the next 20000m mark!
                state.nextBossTriggerDistance = Math.ceil((currentDistMeters + 10) / 20000) * 20000;
                
                // Increase next boss HP progressively
                const nextHp = 200 + Math.floor(currentDistMeters / 10);
                state.boss = {
                  x: dimensions.width + 100,
                  y: dimensions.height / 2,
                  targetY: dimensions.height / 2,
                  health: nextHp,
                  maxHealth: nextHp,
                  phase: 0,
                  attackTimer: 0,
                  wobbleTimer: 0,
                  alpha: 0
                };
              }
              
              // Wait for victory explosion, then open the Sanctum Blessing Upgrade choice!
              setTimeout(() => {
                setShowUpgradeSelection(true);
              }, 2500);
            }
          }
        }
      }

      // Sync React state periodically for timers & new HUD elements
      if (state.frameCount % 5 === 0) {
        setActiveShield(player.shieldTimeLeft > 0);
        setActiveSlowMo(player.slowMoTimeLeft > 0);
        setActiveDoubleScore(player.doubleScoreTimeLeft > 0);
        setActiveBoost(player.boostTimeLeft > 0);
        setActiveGoldenAura(player.goldenAuraTimeLeft > 0);
        setActiveTimeWarp(player.timeWarpTimeLeft > 0);
        setActiveMagnet(player.magnetTimeLeft > 0);
        setActiveWindRider(player.windRiderTimeLeft > 0);
        
        setShieldTimer(Math.max(0, Math.ceil(player.shieldTimeLeft / 60)));
        setSlowMoTimer(Math.max(0, Math.ceil(player.slowMoTimeLeft / 60)));
        setDoubleScoreTimer(Math.max(0, Math.ceil(player.doubleScoreTimeLeft / 60)));
        setBoostTimer(Math.max(0, Math.ceil(player.boostTimeLeft / 60)));
        setGoldenAuraTimer(Math.max(0, Math.ceil(player.goldenAuraTimeLeft / 60)));
        setTimeWarpTimer(Math.max(0, Math.ceil(player.timeWarpTimeLeft / 60)));
        setMagnetTimer(Math.max(0, Math.ceil(player.magnetTimeLeft / 60)));
        setWindRiderTimer(Math.max(0, Math.ceil(player.windRiderTimeLeft / 60)));

        // ADVANCED HUD SYNCS
        const distM = Math.floor(state.distanceRun / 10);
        if (state.bossEncounterActive && !state.bossDefeated) {
          setBossDistance(null);
        } else {
          const diff = state.nextBossTriggerDistance - distM;
          setBossDistance(diff > 0 ? diff : 0);
        }
        setRageCharge(state.rageChargeVal);
        setIsRageActive(state.rageActive);
        
        let rating = 'BENEVOLENT SPIRIT';
        if (state.aiPerformanceScore >= 80) rating = 'WRATH OF AGNI';
        else if (state.aiPerformanceScore >= 60) rating = 'SPIRIT DESTINY';
        else if (state.aiPerformanceScore < 40) rating = 'COMPASSIONATE SPIRIT';
        setAiRating(rating);
        state.aiDifficultyRating = rating;
      }
      } // End of fixed-time-step physics update loop

      if (isGameTerminatedThisFrame) {
        return;
      }

      // 2. RENDERING CANVAS LAYERS
      ctx.save();
      
      // Apply screen shake viewport offset
      if (state.screenShake > 0.1) {
        const shakeX = (Math.random() - 0.5) * state.screenShake;
        const shakeY = (Math.random() - 0.5) * state.screenShake;
        ctx.translate(shakeX, shakeY);
        state.screenShake *= 0.88; // Decay shake
      }

      drawBackground(ctx, dimensions);
      
      if (state.bossEncounterActive && !state.bossDefeated) {
        ctx.save();
        ctx.fillStyle = `rgba(150, 0, 0, ${0.15 + Math.sin(state.frameCount * 0.05) * 0.05})`;
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillRect(0, 0, dimensions.width, dimensions.height);
        ctx.restore();
      }

      // --- DYNAMIC CAMERA SYSTEM START ---
      ctx.save();
      
      let focalX = 150;
      let focalY = state.cameraY;
      let cameraZoom = state.cameraZoom;
      
      if (state.bossIntroActive) {
        // Linear cinematic focus transition:
        // First 20% of intro: Pan from player to boss
        // 20% to 85% of intro: Stay locked on boss as they make an epic entrance
        // 85% to 100% of intro: Pan back smoothly to player
        const progress = (state.bossIntroMax - state.bossIntroTimer) / state.bossIntroMax;
        let t = 0;
        if (progress < 0.2) {
          t = progress / 0.2; // 0 -> 1
        } else if (progress < 0.85) {
          t = 1.0;
        } else {
          t = Math.max(0, 1.0 - (progress - 0.85) / 0.15); // 1 -> 0
        }
        
        focalX = 150 + (state.boss.x - 150) * t;
        focalY = state.cameraY + (state.boss.y - state.cameraY) * t;
        cameraZoom = 1.0 + 0.35 * Math.sin(progress * Math.PI); // peak zoom of 1.35x
      }
      
      if (cameraZoom > 1.001 || state.bossIntroActive) {
        ctx.translate(focalX, focalY);
        ctx.scale(cameraZoom, cameraZoom);
        ctx.translate(-focalX, -focalY);
      }

      drawWeatherParticles(ctx);
      drawObstacles(ctx);
      drawPowerUps(ctx);
      if (state.bossEncounterActive && !state.bossDefeated) {
        drawBossEncounter(ctx);
      }
      drawPlayerTrail(ctx);
      drawPlayer(ctx);
      drawParticles(ctx);
      drawLightningStrike(ctx);

      ctx.restore();
      // --- DYNAMIC CAMERA SYSTEM END ---

      drawOverlayFeedback(ctx, dimensions);
      
      // Cinematic death sequence black overlay fade-out
      if (state.isDying) {
        ctx.save();
        const fadeAmount = Math.min(1.0, (45 - state.deathTimer) / 45); // smoothly fade to 1.0
        ctx.fillStyle = `rgba(0, 0, 0, ${fadeAmount})`;
        ctx.fillRect(0, 0, dimensions.width, dimensions.height);

        ctx.font = 'bold 24px "Mukta Malar", "Latha", "Tamil", serif';
        ctx.fillStyle = `rgba(255, 102, 0, ${fadeAmount * 0.95})`;
        ctx.textAlign = 'center';
        ctx.fillText('அக்னி சாம்பல்', dimensions.width / 2, dimensions.height / 2);
        ctx.font = 'italic 12px sans-serif';
        ctx.fillStyle = `rgba(255, 255, 255, ${fadeAmount * 0.6})`;
        ctx.fillText('To ashes we return...', dimensions.width / 2, dimensions.height / 2 + 25);
        ctx.restore();
      }

      ctx.restore();

      animationId = requestAnimationFrame(updateAndRender);
    };

    animationId = requestAnimationFrame(updateAndRender);
    return () => {
      cancelAnimationFrame(animationId);
      AudioEngine.stopMusic();
    };
  }, [gameState, difficulty, weather, selectedSkin, isGamePaused]);

  // Activate power-ups gathered
  const activatePowerUp = (pw: PowerUp) => {
    const { player } = stateRef.current;
    AudioEngine.playCollect();

    // Spawn rich shiny burst particles
    const particleColor = pw.type === PowerUpType.SACRED_FEATHER 
      ? '#FFD700' 
      : pw.type === PowerUpType.SOUL_FRAGMENT ? '#d500f9' 
      : pw.type === PowerUpType.GOLDEN_AURA ? '#ffd700'
      : pw.type === PowerUpType.TIME_WARP ? '#00e5ff'
      : pw.type === PowerUpType.DIVINE_ORB_SMALL ? '#00E676'
      : pw.type === PowerUpType.DIVINE_ORB_FULL ? '#00FF87'
      : pw.type === PowerUpType.MAGNET ? '#E040FB'
      : pw.type === PowerUpType.WIND_RIDER ? '#00e5ff' : selectedSkin.color;
    
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      stateRef.current.particles.push({
        x: pw.x,
        y: pw.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: pw.type === PowerUpType.SOUL_FRAGMENT ? 3 + Math.random() * 5 : 2 + Math.random() * 4,
        color: particleColor,
        alpha: 1.0,
        decay: 0.03,
        glow: true,
      });
    }

    // AI Performance Adaptivity boost
    if (stateRef.current) {
      stateRef.current.aiPerformanceScore = Math.min(100, stateRef.current.aiPerformanceScore + 4);
    }

    if (pw.type === PowerUpType.SACRED_FEATHER) {
      if (stateRef.current.boss.active && !stateRef.current.bossPowerActive) {
        stateRef.current.bossPowerFeathers = Math.min(3, stateRef.current.bossPowerFeathers + 1);
      }
      stateRef.current.feathersEarned += 1;
      onFeatherCollect(1);

      // Increment Combo Streak on feather collect!
      stateRef.current.currentCombo++;
      stateRef.current.comboStreakTimer = 240; // 4 seconds
      stateRef.current.maxComboReached = Math.max(stateRef.current.maxComboReached, stateRef.current.currentCombo);
      setCombo(stateRef.current.currentCombo);
      return;
    }

    if (pw.type === PowerUpType.SOUL_FRAGMENT) {
      stateRef.current.feathersEarned += 3;
      onFeatherCollect(3);

      // Increment Combo Streak on soul fragment collect (adds +2 combo!)
      stateRef.current.currentCombo += 2;
      stateRef.current.comboStreakTimer = 240; // 4 seconds
      stateRef.current.maxComboReached = Math.max(stateRef.current.maxComboReached, stateRef.current.currentCombo);
      setCombo(stateRef.current.currentCombo);
      
      // Floating indicator
      stateRef.current.nearMissAlerts.push({
        x: pw.x,
        y: pw.y - 10,
        text: '✨ SOUL RECLAIMED +3 ✨',
        alpha: 1.2,
        customColor: '#d500f9',
      });
      return;
    }

    // Alchemical upgrades level modifiers
    const shieldLevel = stats.upgradeShieldLevel || 0;
    const boostLevel = stats.upgradeBoostLevel || 0;

    switch (pw.type) {
      case PowerUpType.SHIELD:
        // Base is 1800 frames (30s). Each shield level adds +90 frames (+1.5s)
        const currentDurabilityLvl = stateRef.current.upgrades?.durability || 1;
        const shieldMultiplier = 1 + (currentDurabilityLvl - 1) * 0.2; // +20% per level
        player.shieldTimeLeft = Math.floor((1800 + (shieldLevel * 90)) * shieldMultiplier);
        AudioEngine.playShieldActivate();
        break;
      case PowerUpType.SLOW_MO:
        player.slowMoTimeLeft = 1800;
        stateRef.current.slowMoTarget = 0.5; // slow down obstacles
        AudioEngine.playSlowMo();
        break;
      case PowerUpType.GOLDEN_AURA:
        player.goldenAuraTimeLeft = 1800; // 30 seconds of divine protection!
        AudioEngine.playShieldActivate();
        stateRef.current.nearMissAlerts.push({
          x: pw.x,
          y: pw.y - 15,
          text: '✨ பொன் ஒளி கவசம்! (GOLDEN AURA) ✨',
          alpha: 2.2,
          isTamil: true,
          customColor: '#ffd700',
          sizeScale: 1.2,
        });
        AudioEngine.speakSpiritual("You are protected by the sacred Golden Aura.");
        break;
      case PowerUpType.TIME_WARP:
        player.timeWarpTimeLeft = 1800; // 30 seconds of cosmic time slow!
        stateRef.current.slowMoTarget = 0.35; // extra slow down!
        AudioEngine.playSlowMo();
        break;
      case PowerUpType.DOUBLE_SCORE:
        player.doubleScoreTimeLeft = 1800; // 30 seconds
        break;
      case PowerUpType.BOOST:
        // Base is 1800 frames (30s). Each boost level adds +72 frames (+1.2s)
        player.boostTimeLeft = 1800 + (boostLevel * 72);
        AudioEngine.playBoost();
        stateRef.current.screenShake = 10;
        break;
      case PowerUpType.DIVINE_ORB_SMALL:
        player.lives = Math.min(3, player.lives + 0.5);
        setLives(player.lives);
        stateRef.current.nearMissAlerts.push({
          x: pw.x,
          y: pw.y - 15,
          text: '💚 சிறிய அருள் ஆற்றல் (+0.5 Life) 💚',
          alpha: 2.2,
          isTamil: true,
          customColor: '#00E676',
          sizeScale: 1.2,
        });
        AudioEngine.speakSpiritual("Divine energy restores your wings.");
        break;
      case PowerUpType.DIVINE_ORB_FULL:
        player.lives = Math.min(3, player.lives + 1.0);
        setLives(player.lives);
        stateRef.current.nearMissAlerts.push({
          x: pw.x,
          y: pw.y - 15,
          text: '💚 முழு அருள் ஆற்றல் (+1.0 Life) 💚',
          alpha: 2.2,
          isTamil: true,
          customColor: '#00E676',
          sizeScale: 1.25,
        });
        AudioEngine.speakSpiritual("The grace of the sky restores you completely.");
        break;
      case PowerUpType.MAGNET:
        player.magnetTimeLeft = 1800; // 30 seconds of magnetic pull!
        stateRef.current.nearMissAlerts.push({
          x: pw.x,
          y: pw.y - 15,
          text: '🧲 காந்த கவசம்! (COIN MAGNET) 🧲',
          alpha: 2.2,
          isTamil: true,
          customColor: '#E040FB',
          sizeScale: 1.2,
        });
        AudioEngine.speakSpiritual("Sacred items are drawn to your divine light.");
        break;
      case PowerUpType.WIND_RIDER:
        player.windRiderTimeLeft = 1800; // 30 seconds of gravity glide gliding!
        stateRef.current.nearMissAlerts.push({
          x: pw.x,
          y: pw.y - 15,
          text: '🍃 காற்று சவாரி! (WIND RIDER) 🍃',
          alpha: 2.2,
          isTamil: true,
          customColor: '#00e5ff',
          sizeScale: 1.2,
        });
        AudioEngine.speakSpiritual("The winds bear you aloft.");
        break;
    }
  };

  // Shatter an entire tower/obstacle into beautiful chunks
  const shatterObstacle = (obs: Obstacle) => {
    const state = stateRef.current;
    
    // Create fragments of debris
    for (let i = 0; i < 12; i++) {
      state.particles.push({
        x: obs.x + obs.width / 2,
        y: obs.topHeight / 2 + (Math.random() - 0.5) * 80,
        vx: -3 - Math.random() * 5,
        vy: (Math.random() - 0.5) * 6,
        radius: 4 + Math.random() * 8,
        color: '#8B4513', // clay/stone colors
        alpha: 1.0,
        decay: 0.02,
        gravity: 0.2,
      });
    }

    // Flame rings
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 4;
      state.particles.push({
        x: obs.x + obs.width / 2,
        y: state.dimensions.height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 3 + Math.random() * 5,
        color: selectedSkin.color,
        alpha: 1.0,
        decay: 0.04,
        glow: true,
      });
    }
  };

  // Blast dynamic fireworks on milestones
  const triggerScoreCelebration = () => {
    const { dimensions, particles } = stateRef.current;
    const colors = ['#FF1493', '#00FFFF', '#FFD700', '#FF4500', '#32CD32', '#9400D3'];
    
    // Spawn 3 firework points at random sky regions
    for (let f = 0; f < 3; f++) {
      const fX = dimensions.width * (0.2 + Math.random() * 0.6);
      const fY = dimensions.height * (0.15 + Math.random() * 0.4);
      const fColor = colors[Math.floor(Math.random() * colors.length)];

      for (let i = 0; i < 25; i++) {
        const angle = (i / 25) * Math.PI * 2;
        const speed = 2 + Math.random() * 5;
        particles.push({
          x: fX,
          y: fY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 2 + Math.random() * 3,
          color: fColor,
          alpha: 1.0,
          decay: 0.02,
          gravity: 0.08,
          glow: true,
        });
      }
    }
  };

  
  
  const activateBossPower = () => {
    requestAnimationFrame(() => {
      const state = stateRef.current;
      if (state.bossPowerFeathers < 3 || state.bossPowerActive) return;
      
      state.bossPowerActive = true;
      state.bossPowerFeathers = 0;
      state.bossPowerTimeLeft = 240; // 4 seconds
      
      setIsBossPowerActive(true);
      setBossPowerFeathers(0);
      
      AudioEngine.playBoost();
      
      if (selectedSkin.id === 'agni') {
        AudioEngine.speakSpiritual("FLAME BURST!");
        state.screenShake = 30;
      } else if (selectedSkin.id === 'mayil') {
        AudioEngine.speakSpiritual("DIVINE SHIELD!");
        state.player.shieldTimeLeft = 240;
      } else if (selectedSkin.id === 'garuda') {
        AudioEngine.speakSpiritual("SKY DASH!");
        state.player.boostTimeLeft = 240;
      } else if (selectedSkin.id === 'koel') {
        AudioEngine.speakSpiritual("SHADOW PHASE!");
        state.player.invincibilityTimeLeft = 240;
      } else if (selectedSkin.id === 'swan') {
        AudioEngine.speakSpiritual("HEALING AURA!");
        const maxLives = 3 + (state.upgrades?.life - 1 || 0);
        if (state.player.lives < maxLives) {
          state.player.lives++;
          setLives(state.player.lives);
        }
      }
    });
  };

  // Trigger Agni Rage Mode (combo & near-miss fury!)
  const triggerAgniRageMode = () => {
    const state = stateRef.current;
    if (state.rageActive) return;

    state.rageActive = true;
    state.rageTimeLeft = 300; // 5 seconds (300 frames)
    state.rageChargeVal = 100;
    state.screenShake = 22;

    // Trigger invincibility/speed boost (uses the boost parameter)
    state.player.boostTimeLeft = 300; 

    AudioEngine.playAgniRage();
    AudioEngine.speakSpiritual("The fury of Agni awakens! Fly with infinite protection!");

    // Display stunning, fiery Tamil + English subtitles in nearMissAlerts
    state.nearMissAlerts.push({
      x: state.dimensions.width / 2,
      y: state.dimensions.height / 3 - 10,
      text: 'அக்னி ஆவேசம்! (AGNI RAGE MODE)',
      alpha: 2.5,
      isTamil: true,
      customColor: '#ff3d00',
      sizeScale: 1.4,
    });

    state.nearMissAlerts.push({
      x: state.dimensions.width / 2,
      y: state.dimensions.height / 3 + 22,
      text: '💥 ULTRA INVINCIBLE SMASH ACTIVE 💥',
      alpha: 2.5,
      customColor: '#ffcc33',
      sizeScale: 1.1,
    });

    // Spawn massive fiery shockwave rings
    for (let i = 0; i < 35; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 8;
      state.particles.push({
        x: 100,
        y: state.player.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 3 + Math.random() * 5,
        color: i % 2 === 0 ? '#ff3d00' : '#ffcc33',
        alpha: 1.0,
        decay: 0.025,
        glow: true,
      });
    }
  };

  // Weather lightning fork algorithm
  const triggerLightning = () => {
    const { dimensions } = stateRef.current;
    const startX = dimensions.width * (0.1 + Math.random() * 0.8);
    const branches: Array<{ sx: number; sy: number; ex: number; ey: number }> = [];

    let currentX = startX;
    let currentY = 0;

    while (currentY < dimensions.height - 80) {
      const nextY = currentY + 20 + Math.random() * 30;
      const nextX = currentX + (Math.random() - 0.5) * 50;
      branches.push({ sx: currentX, sy: currentY, ex: nextX, ey: nextY });

      // Occasional sub-branch splitting off
      if (Math.random() > 0.75) {
        const branchEndX = nextX + (Math.random() > 0.5 ? 40 : -40);
        const branchEndY = nextY + 30;
        branches.push({ sx: nextX, sy: nextY, ex: branchEndX, ey: branchEndY });
      }

      currentX = nextX;
      currentY = nextY;
    }

    stateRef.current.lightningStrike = { x: startX, branches };
    AudioEngine.playCrash(); // thunder crash sound
  };

  const triggerGameOver = () => {
    const state = stateRef.current;
    if (state.isDying) return;

    // SANJEEVINI RESURRECTION GRACE: Disabled per user request
    if (false && !state.sanjeeviniUsed && state.currentScore > 2 && state.autoPilotTimeLeft <= 0) {
      state.sanjeeviniUsed = true;
      
      // Visual blast particles
      const colors = ['#ffffff', '#ffd700', '#d500f9', '#ffcc33'];
      for (let i = 0; i < 45; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 3 + Math.random() * 8;
        state.particles.push({
          x: 100,
          y: state.player.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 3 + Math.random() * 5,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1.0,
          decay: 0.02,
          glow: true,
        });
      }

      // Restore bird slightly near center height & give brief shield
      state.player.vy = -4.0; // slight upward bounce
      state.player.y = Math.max(100, Math.min(300, state.player.y));
      
      const shieldLevel = stats.upgradeShieldLevel || 0;
      // 3.5 seconds base shield + 1.5 seconds per shield upgrade level!
      state.player.shieldTimeLeft = 210 + (shieldLevel * 90); 

      // Trigger epic cinematic ultra slow motion transition
      state.slowMoTarget = 0.05; // 20x slow motion for dramatic rise!
      state.comboTimer = 110; // keep it slow-mo for about 1.8 seconds real time
      state.screenShake = 20;

      AudioEngine.playSanjeeviniGrace();
      AudioEngine.speakSpiritual("Rise from the ashes! Sanjeevini protection active!");

      // Show deep emotional Tamil cinematic feedback text in the middle of the screen!
      state.nearMissAlerts.push({
        x: state.dimensions.width / 2,
        y: state.dimensions.height / 3 - 10,
        text: 'சஞ்சீவினி அருள்! (SANJEEVINI GRACE)',
        alpha: 2.2,
        isTamil: true,
        customColor: '#ffd700',
        sizeScale: 1.3,
      });

      state.nearMissAlerts.push({
        x: state.dimensions.width / 2,
        y: state.dimensions.height / 3 + 22,
        text: 'மீண்டும் எழு! (RISE FROM ASHES)',
        alpha: 2.2,
        isTamil: true,
        customColor: '#d500f9',
        sizeScale: 1.1,
      });

      // Clear all obstacles in the bird's immediate vicinity to prevent instant double-hits
      state.obstacles = state.obstacles.filter(obs => obs.x > 350 || obs.x < -50);
      
      // Reduce performance rating score slightly but allow them to recover
      state.aiPerformanceScore = 30; // "Sanjeevini Compassion" mode
      return;
    }

    state.isDying = true;
    triggerCssShake();
    state.rageActive = false; // Zoom back out smoothly for cinematic wide death pan!
    state.deathTimer = 65; // 65 frames of slow motion cinematic death sequences
    state.screenShake = 30; // High intensity screen shake for impact!
    state.slowMoTarget = 0.12; // Slow down everything dramatically for artistic impact!

    AudioEngine.stopMusic();
    AudioEngine.playCrash();

    // Spawn rich fire, ember, and ash explosion particles
    const player = state.player;
    const colors = ['#ffcc33', '#ff6600', '#ff3300', '#222222', '#555555'];
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 8;
      state.particles.push({
        x: 100, // Player is always centered horizontally at x = 100
        y: player.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 3 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1.0,
        decay: 0.015 + Math.random() * 0.015,
        gravity: 0.08,
        glow: Math.random() > 0.3,
      });
    }
  };

  // Drawing routines
  const drawHangingBells = (ctx: CanvasRenderingContext2D, dim: typeof stateRef.current.dimensions) => {
    ctx.save();
    const frameCount = stateRef.current.frameCount;
    const swingAngle = Math.sin(frameCount * 0.02) * 0.08; // gentle swaying
    
    const bellXPositions = [dim.width * 0.2, dim.width * 0.5, dim.width * 0.8];
    const bellLengths = [120, 80, 100];
    
    bellXPositions.forEach((bx, idx) => {
      const bl = bellLengths[idx];
      
      ctx.save();
      ctx.translate(bx, 0);
      ctx.rotate(swingAngle * (idx % 2 === 0 ? 1 : -1));
      
      // Draw hanging thin golden thread
      ctx.strokeStyle = 'rgba(218, 165, 32, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, bl);
      ctx.stroke();
      
      // Draw small golden bell at end
      ctx.translate(0, bl);
      ctx.fillStyle = '#ffd700';
      ctx.shadowColor = '#ffaa00';
      ctx.shadowBlur = 6;
      
      // Bell body
      ctx.beginPath();
      ctx.moveTo(-8, 0);
      ctx.quadraticCurveTo(-8, -12, 0, -12);
      ctx.quadraticCurveTo(8, -12, 8, 0);
      ctx.lineTo(10, 3);
      ctx.quadraticCurveTo(0, 5, -10, 3);
      ctx.closePath();
      ctx.fill();
      
      // Clapper
      ctx.fillStyle = '#ffcc33';
      ctx.beginPath();
      ctx.arc(0, 5, 2.5, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    });
    ctx.restore();
  };

  const drawDiwa = (ctx: CanvasRenderingContext2D, x: number, y: number, scale = 1.0) => {
    ctx.save();
    const frameCount = stateRef.current.frameCount;
    
    // Diwa clay base
    ctx.fillStyle = '#b7410e'; // terracotta brown
    ctx.beginPath();
    ctx.arc(x, y, 8 * scale, 0, Math.PI, false);
    ctx.quadraticCurveTo(x, y - 2 * scale, x, y);
    ctx.closePath();
    ctx.fill();
    
    // Glowing flame
    const flameHeight = (12 + Math.sin(frameCount * 0.15) * 2) * scale;
    const flameWidth = 5 * scale;
    
    const grad = safeRadialGradient(ctx, x, y - 4 * scale, 1 * scale, x, y - 4 * scale, 15 * scale);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, '#ffcc00');
    grad.addColorStop(0.7, 'rgba(255, 69, 0, 0.4)');
    grad.addColorStop(1, 'rgba(255, 69, 0, 0)');
    
    ctx.fillStyle = grad;
    ctx.shadowBlur = 12 * scale;
    ctx.shadowColor = '#ff6a00';
    
    ctx.beginPath();
    ctx.moveTo(x - flameWidth, y - 2 * scale);
    ctx.quadraticCurveTo(x - flameWidth, y - flameHeight * 0.6, x, y - flameHeight);
    ctx.quadraticCurveTo(x + flameWidth, y - flameHeight * 0.6, x + flameWidth, y - 2 * scale);
    ctx.quadraticCurveTo(x, y + 2 * scale, x - flameWidth, y - 2 * scale);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
  };

  const drawSingleLandBackground = (
    ctx: CanvasRenderingContext2D,
    dim: typeof stateRef.current.dimensions,
    land: WeatherType,
    zoom: number = 1.0
  ) => {
    const state = stateRef.current;
    const frameCount = state.frameCount;
    const p1 = state.bgParallax[0] || { x: 0 };
    const p2 = state.bgParallax[1] || { x: 0 };
    const p3 = state.bgParallax[2] || { x: 0 };

    ctx.save();

    const img = bgImagesRef.current[land];
    const hasImage = img && img.complete && img.naturalWidth > 0;

    // 1. SKY OR IMAGE LAYER (Layer 1 - Far/Sky)
    if (hasImage) {
      ctx.save();
      // Add a very subtle "breathing" zoom to make the background feel alive (Ken Burns light)
      const kenBurns = 1.0 + Math.sin(frameCount * 0.0005) * 0.02;
      
      // Calculate drawing dimensions to maintain aspect ratio and support zoom
      const scale = Math.max(dim.width / img.naturalWidth, dim.height / img.naturalHeight) * zoom * kenBurns;
      const drawW = img.naturalWidth * scale;
      const drawH = img.naturalHeight * scale;
      // Slight vertical drift
      const driftY = Math.sin(frameCount * 0.0003) * 10;
      const drawY = (dim.height - drawH) / 2 + driftY;
      
      // Far background scrolls slowly
      const imgX = (p1.x * 0.4) % drawW;
      
      ctx.drawImage(img, imgX, drawY, drawW, drawH);
      ctx.drawImage(img, imgX + drawW - 1, drawY, drawW, drawH);
      ctx.restore();
    } else {
      // Fallback: Sky gradient & Stars
      let skyGrad = ctx.createLinearGradient(0, 0, 0, dim.height);
      if (land === WeatherType.KURINJI) {
        skyGrad.addColorStop(0, '#120521');
        skyGrad.addColorStop(0.5, '#2e1245');
        skyGrad.addColorStop(1, '#662244');
      } else if (land === WeatherType.MULLAI) {
        skyGrad.addColorStop(0, '#031418');
        skyGrad.addColorStop(0.5, '#01332a');
        skyGrad.addColorStop(1, '#005c47');
      } else if (land === WeatherType.MARUTHAM) {
        skyGrad.addColorStop(0, '#5e1900');
        skyGrad.addColorStop(0.5, '#b86d00');
        skyGrad.addColorStop(1, '#ffd54f');
      } else if (land === WeatherType.NEITHAL) {
        skyGrad.addColorStop(0, '#010915');
        skyGrad.addColorStop(0.5, '#0b213b');
        skyGrad.addColorStop(1, '#0c3866');
      } else if (land === WeatherType.PALAI) {
        skyGrad.addColorStop(0, '#420100');
        skyGrad.addColorStop(0.5, '#b33f00');
        skyGrad.addColorStop(1, '#ff8f00');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, dim.width, dim.height);

      ctx.fillStyle = land === WeatherType.MULLAI ? 'rgba(150, 255, 120, 0.9)' : (land === WeatherType.MARUTHAM ? 'rgba(255, 215, 0, 0.7)' : (land === WeatherType.NEITHAL ? 'rgba(200, 220, 255, 0.4)' : (land === WeatherType.PALAI ? 'rgba(255, 110, 50, 0.6)' : 'rgba(255, 255, 255, 0.8)')));
      const numStars = land === WeatherType.NEITHAL ? 30 : 70;
      for (let i = 0; i < numStars; i++) {
        const starX = (Math.sin(i * 123) * 0.5 + 0.5) * dim.width;
        const starY = (Math.cos(i * 321) * 0.5 + 0.5) * (dim.height * 0.8);
        const twinkle = 0.3 + Math.sin(frameCount * 0.04 + i) * 0.7;
        ctx.globalAlpha = twinkle;
        ctx.beginPath();
        ctx.arc(starX, starY, Math.random() > 0.85 ? 2.2 : 1.1, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;
    }

    // 2. AMBIENT GLOW ON THE MOON/SUN (Layer 1.5)
    const moonX = dim.width / 2;
    const moonY = dim.height * 0.25;
    const moonRadius = land === WeatherType.PALAI ? 70 : 60;
    const moonGlow = safeRadialGradient(ctx, moonX, moonY, moonRadius * 0.4, moonX, moonY, moonRadius * 3.5);
    if (land === WeatherType.PALAI) {
      moonGlow.addColorStop(0, 'rgba(255, 204, 51, 0.5)');
      moonGlow.addColorStop(0.5, 'rgba(230, 81, 0, 0.2)');
      moonGlow.addColorStop(1, 'rgba(230, 81, 0, 0)');
    } else if (land === WeatherType.MULLAI) {
      moonGlow.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
      moonGlow.addColorStop(0.5, 'rgba(0, 200, 150, 0.25)');
      moonGlow.addColorStop(1, 'rgba(0, 200, 150, 0)');
    } else {
      moonGlow.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
      moonGlow.addColorStop(0.5, 'rgba(168, 85, 247, 0.2)');
      moonGlow.addColorStop(1, 'rgba(168, 85, 247, 0)');
    }
    ctx.fillStyle = moonGlow;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius * 3.5, 0, Math.PI * 2);
    ctx.fill();

    if (!hasImage) {
      // Draw procedural moon body if no image is available as fallback
      ctx.fillStyle = land === WeatherType.PALAI ? '#ffe082' : '#ffffff';
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
      ctx.fill();
      
      if (land !== WeatherType.PALAI) {
        ctx.fillStyle = 'rgba(200, 200, 220, 0.2)';
        ctx.beginPath(); ctx.arc(moonX - 15, moonY - 10, 12, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(moonX + 20, moonY + 15, 18, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(moonX + 5, moonY - 25, 8, 0, Math.PI * 2); ctx.fill();
      }
    }

    // Apply land-specific overlays/filters directly on top of the background image/sky
    ctx.save();
    if (land === WeatherType.KURINJI) {
      ctx.fillStyle = 'rgba(100, 30, 150, 0.08)'; // Cool violet overlay
      ctx.fillRect(0, 0, dim.width, dim.height);
    } else if (land === WeatherType.MULLAI) {
      ctx.fillStyle = 'rgba(0, 200, 120, 0.05)'; // Emerald-teal overlay
      ctx.fillRect(0, 0, dim.width, dim.height);
    } else if (land === WeatherType.MARUTHAM) {
      ctx.fillStyle = 'rgba(255, 170, 0, 0.06)'; // Golden sun overlay
      ctx.fillRect(0, 0, dim.width, dim.height);
    } else if (land === WeatherType.NEITHAL) {
      ctx.fillStyle = 'rgba(0, 100, 255, 0.06)'; // Shimmering blue overlay
      ctx.fillRect(0, 0, dim.width, dim.height);
    } else if (land === WeatherType.PALAI) {
      ctx.fillStyle = 'rgba(255, 80, 0, 0.08)'; // Heat orange overlay
      ctx.fillRect(0, 0, dim.width, dim.height);
    }
    ctx.restore();

    // 3. LANDSCAPE LAYERS GENERATION (Layer 2 & Layer 3)
    const drawLandscapeLayer = (
      yOffset: number, 
      colorTop: string, 
      colorBot: string, 
      amplitude: number, 
      frequency: number, 
      speed: number, 
      parallaxX: number,
      style: 'mountains' | 'canopy' | 'waves' | 'dunes' | 'flat'
    ) => {
      ctx.beginPath();
      ctx.moveTo(0, dim.height);
      
      const ridgePoints: Array<{x: number, y: number}> = [];
      for (let x = 0; x <= dim.width; x += 12) {
        let y = dim.height - yOffset;
        const waveX = x + parallaxX * speed;
        
        if (style === 'mountains') {
          y += Math.sin(waveX * frequency) * amplitude + Math.sin(waveX * frequency * 2) * (amplitude * 0.3);
        } else if (style === 'canopy') {
          y += Math.cos(waveX * frequency) * amplitude + Math.abs(Math.sin(waveX * frequency * 3.5)) * (amplitude * 0.5);
        } else if (style === 'waves') {
          const waveSpeed = frameCount * 0.015 * (speed + 0.5);
          y += Math.sin(waveX * frequency + waveSpeed) * amplitude + Math.cos(waveX * frequency * 1.8 - waveSpeed) * (amplitude * 0.4);
        } else if (style === 'dunes') {
          y += Math.cos(waveX * frequency) * amplitude + Math.sin(waveX * frequency * 0.5) * (amplitude * 0.7);
        } else {
          y += Math.sin(waveX * frequency) * (amplitude * 0.3);
        }

        // Heat distortion thermal shimmer
        if (land === WeatherType.PALAI) {
          y += Math.sin(frameCount * 0.12 + x * 0.08) * 3.0;
        }

        ctx.lineTo(x, y);
        ridgePoints.push({ x, y });
      }
      ctx.lineTo(dim.width, dim.height);
      ctx.closePath();
      
      const grad = ctx.createLinearGradient(0, dim.height - yOffset - amplitude, 0, dim.height);
      grad.addColorStop(0, colorTop);
      grad.addColorStop(1, colorBot);
      ctx.fillStyle = grad;
      ctx.fill();

      // DRAW GLOWING EDGE HIGHLIGHTS FOR CONTRAST & VISIBILITY (3D PARALLAX DEPTH)
      if (ridgePoints.length > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(ridgePoints[0].x, ridgePoints[0].y);
        for (let i = 1; i < ridgePoints.length; i++) {
          ctx.lineTo(ridgePoints[i].x, ridgePoints[i].y);
        }
        
        // Select premium aesthetic glowing color based on land theme
        let highlightColor = 'rgba(255, 255, 255, 0.4)';
        let shadowColor = '#ffffff';
        if (land === WeatherType.KURINJI) {
          highlightColor = 'rgba(216, 180, 254, 0.65)'; // light purple
          shadowColor = '#d8b4fe';
        } else if (land === WeatherType.MULLAI) {
          highlightColor = 'rgba(167, 243, 208, 0.65)'; // emerald light
          shadowColor = '#4ade80';
        } else if (land === WeatherType.MARUTHAM) {
          highlightColor = 'rgba(253, 230, 138, 0.7)'; // golden light
          shadowColor = '#fbbf24';
        } else if (land === WeatherType.NEITHAL) {
          highlightColor = 'rgba(191, 219, 254, 0.75)'; // sky blue light
          shadowColor = '#60a5fa';
        } else if (land === WeatherType.PALAI) {
          highlightColor = 'rgba(254, 215, 170, 0.7)'; // desert orange light
          shadowColor = '#f97316';
        }
        
        ctx.strokeStyle = highlightColor;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.restore();
      }
    };

    // Render 3 Parallax Layers (If hasImage is true, we only render layers 2 & 3 to allow the background image's landscapes to breathe!)
    if (land === WeatherType.KURINJI) {
      if (!hasImage) {
        drawLandscapeLayer(dim.height * 0.45, '#3b1c54', '#150824', 40, 0.005, 0.05, p1.x, 'mountains');
      }
      drawLandscapeLayer(dim.height * 0.32, '#2e1245', '#0f041c', 60, 0.008, 0.1, p2.x, 'mountains');
      drawLandscapeLayer(dim.height * 0.18, '#1a0629', '#05010a', 30, 0.012, 0.3, p3.x, 'mountains');
    } else if (land === WeatherType.MULLAI) {
      if (!hasImage) {
        drawLandscapeLayer(dim.height * 0.46, '#0b3d22', '#031a0d', 25, 0.006, 0.05, p1.x, 'canopy');
      }
      drawLandscapeLayer(dim.height * 0.34, '#042e17', '#011208', 35, 0.010, 0.1, p2.x, 'canopy');
      drawLandscapeLayer(dim.height * 0.20, '#001a0b', '#000803', 20, 0.015, 0.3, p3.x, 'canopy');
    } else if (land === WeatherType.MARUTHAM) {
      if (!hasImage) {
        drawLandscapeLayer(dim.height * 0.45, '#422006', '#1c0b00', 15, 0.005, 0.05, p1.x, 'flat');
      }
      drawLandscapeLayer(dim.height * 0.32, '#5e320d', '#241103', 20, 0.009, 0.1, p2.x, 'flat');
      drawLandscapeLayer(dim.height * 0.18, '#7c481a', '#361e09', 10, 0.014, 0.3, p3.x, 'flat');
    } else if (land === WeatherType.NEITHAL) {
      if (!hasImage) {
        drawLandscapeLayer(dim.height * 0.42, '#0c2e54', '#04162b', 30, 0.007, 0.05, p1.x, 'waves');
      }
      drawLandscapeLayer(dim.height * 0.30, '#052140', '#010c1c', 40, 0.011, 0.1, p2.x, 'waves');
      drawLandscapeLayer(dim.height * 0.16, '#01152d', '#00050f', 25, 0.016, 0.3, p3.x, 'waves');
    } else if (land === WeatherType.PALAI) {
      if (!hasImage) {
        drawLandscapeLayer(dim.height * 0.44, '#542d18', '#240f04', 35, 0.004, 0.05, p1.x, 'dunes');
      }
      drawLandscapeLayer(dim.height * 0.31, '#6e3c20', '#301305', 45, 0.008, 0.1, p2.x, 'dunes');
      drawLandscapeLayer(dim.height * 0.17, '#8c5232', '#421d0a', 25, 0.013, 0.3, p3.x, 'dunes');
    }

    // 4. LAND-SPECIFIC WEATHER & EMISSION EFFECTS
    const isFirefly = land === WeatherType.MULLAI;
    const isGoldDust = land === WeatherType.MARUTHAM;
    const isRain = land === WeatherType.NEITHAL;
    const isDesertEmbers = land === WeatherType.PALAI;

    if (land === WeatherType.KURINJI) {
      // Kurinji Fog / Mist
      ctx.save();
      const fogGrad = ctx.createLinearGradient(0, dim.height * 0.45, 0, dim.height);
      fogGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      fogGrad.addColorStop(0.5, 'rgba(200, 210, 240, 0.12)');
      fogGrad.addColorStop(1, 'rgba(200, 210, 240, 0)');
      ctx.fillStyle = fogGrad;
      const mist1X = (frameCount * 0.4) % dim.width;
      ctx.fillRect(mist1X - dim.width, dim.height * 0.45, dim.width, dim.height * 0.4);
      ctx.fillRect(mist1X, dim.height * 0.45, dim.width, dim.height * 0.4);
      ctx.restore();
    } else if (isFirefly) {
      // Mullai Fireflies
      ctx.fillStyle = '#b2ff59';
      for (let i = 0; i < 15; i++) {
        const fx = (Math.sin(i * 144) * 0.5 + 0.5) * dim.width + Math.sin(frameCount * 0.02 + i) * 40 - (p3.x * 0.2) % dim.width;
        const fy = dim.height - 180 + Math.cos(frameCount * 0.01 + i) * 80 - (frameCount * 0.4 + i * 20) % 240;
        const size = 1.5 + Math.sin(frameCount * 0.05 + i) * 0.8;
        if (fx > 0 && fx < dim.width && fy > 0 && fy < dim.height) {
          ctx.shadowColor = '#76ff03';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(fx, fy, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.shadowBlur = 0;
      
      // Light rays
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 3; i++) {
        const rayX = (dim.width * 0.3 * i + frameCount * 0.25) % (dim.width * 1.5) - dim.width * 0.3;
        const rayW = 35 + Math.sin(frameCount * 0.01 + i) * 15;
        ctx.fillStyle = 'rgba(120, 255, 180, 0.04)';
        ctx.beginPath();
        ctx.moveTo(rayX, 0);
        ctx.lineTo(rayX + rayW, 0);
        ctx.lineTo(rayX + rayW + 120, dim.height);
        ctx.lineTo(rayX + 120, dim.height);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    } else if (isGoldDust) {
      // Marutham harvest golden pollen falling diagonally left
      ctx.fillStyle = '#ffb300';
      for (let i = 0; i < 15; i++) {
        const gx = ((Math.sin(i * 85) * 0.5 + 0.5) * dim.width + frameCount * -1.2) % dim.width;
        const gy = (i * 35 + frameCount * 0.8) % dim.height;
        const size = 1.0 + Math.cos(frameCount * 0.04 + i) * 0.5;
        if (gx > 0 && gx < dim.width) {
          ctx.beginPath();
          ctx.arc(gx, gy, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      // Warm Sunlight Flare
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      if (dim.width <= 0 || dim.height <= 0) return;
      const flareGrad = safeRadialGradient(ctx, dim.width * 0.85, dim.height * 0.2, 0, dim.width * 0.85, dim.height * 0.2, 180);
      flareGrad.addColorStop(0, 'rgba(255, 200, 0, 0.20)');
      flareGrad.addColorStop(0.5, 'rgba(255, 140, 0, 0.06)');
      flareGrad.addColorStop(1, 'rgba(255, 140, 0, 0)');
      ctx.fillStyle = flareGrad;
      ctx.beginPath();
      ctx.arc(dim.width * 0.85, dim.height * 0.2, 180, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (isRain) {
      // Neithal coastal monsoon rain streaks
      ctx.strokeStyle = 'rgba(165, 220, 255, 0.35)';
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 22; i++) {
        const rx = ((Math.sin(i * 99) * 0.5 + 0.5) * dim.width - frameCount * 3) % dim.width;
        const ry = (i * 22 + frameCount * 12) % dim.height;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 8, ry + 16);
        ctx.stroke();
      }
      
      // Wave reflection shimmer
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 6; i++) {
        const sX = (Math.sin(i * 53) * 0.5 + 0.5) * dim.width + Math.sin(frameCount * 0.04 + i) * 12;
        const sY = dim.height - 35 + i * 5;
        const length = 12 + Math.cos(frameCount * 0.07 + i) * 8;
        ctx.beginPath();
        ctx.moveTo(sX - length / 2, sY);
        ctx.lineTo(sX + length / 2, sY);
        ctx.stroke();
      }
      ctx.restore();
    } else if (isDesertEmbers) {
      // Palai thermal embers rising upward
      ctx.fillStyle = '#ff5722';
      for (let i = 0; i < 15; i++) {
        const ex = (Math.cos(i * 122) * 0.5 + 0.5) * dim.width + Math.sin(frameCount * 0.03 + i) * 20 - (p3.x * 0.1) % dim.width;
        const ey = dim.height - (frameCount * 1.5 + i * 40) % dim.height;
        const size = 1.2 + Math.sin(frameCount * 0.06 + i) * 0.6;
        if (ex > 0 && ex < dim.width) {
          ctx.shadowColor = '#ff3d00';
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(ex, ey, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.shadowBlur = 0;
    }

    // 5. SACRED ORNAMENTAL DIYAS & LAMPS (Drawn on foreground hills)
    ctx.globalAlpha = 0.85;
    const numDiyas = land === WeatherType.NEITHAL ? 2 : 4;
    for (let i = 0; i < numDiyas; i++) {
      const hillX = (dim.width * 0.25 * i + p3.x * 0.3) % (dim.width * 1.2) - dim.width * 0.1;
      let hillY = dim.height - (dim.height * 0.15);
      
      const waveX = hillX + p3.x * 0.3;
      if (land === WeatherType.KURINJI) {
        hillY += Math.sin(waveX * 0.012) * 30;
      } else if (land === WeatherType.MULLAI) {
        hillY += Math.cos(waveX * 0.015) * 20 + Math.abs(Math.sin(waveX * 0.015 * 3.5)) * 10;
      } else if (land === WeatherType.MARUTHAM) {
        hillY += Math.sin(waveX * 0.014) * 3;
      } else if (land === WeatherType.NEITHAL) {
        const waveSpeed = frameCount * 0.015 * 1.3;
        hillY += Math.sin(waveX * 0.016 + waveSpeed) * 25 + Math.cos(waveX * 0.016 * 1.8 - waveSpeed) * 10;
      } else if (land === WeatherType.PALAI) {
        hillY += Math.cos(waveX * 0.013) * 25 + Math.sin(waveX * 0.013 * 0.5) * 17;
      }

      if (hillX > -50 && hillX < dim.width + 50) {
        drawDiwa(ctx, hillX, hillY, 0.95);
      }
    }

    // 6. SACRED HANGING BELLS (Top of skies)
    if (land === WeatherType.KURINJI || land === WeatherType.MULLAI || land === WeatherType.MARUTHAM) {
      ctx.fillStyle = '#ffd700';
      for(let i=0; i<3; i++) {
        const bx = dim.width * (0.2 + i * 0.3) + Math.sin(frameCount * 0.01 + i) * 10;
        const by = 40;
        ctx.strokeStyle = 'rgba(255,215,0,0.35)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(bx, 0); ctx.lineTo(bx, by - 10); ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(bx, by, 8, Math.PI, 0);
        ctx.lineTo(bx + 8, by + 10);
        ctx.lineTo(bx - 8, by + 10);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#aa8800';
        ctx.beginPath(); ctx.arc(bx, by + 12, 3, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#ffd700';
      }
    }

    ctx.restore();
  };

  
  
  const drawClassicBackground = (ctx: CanvasRenderingContext2D, dim: {width: number, height: number}) => {
    ctx.save();
    let grad = ctx.createLinearGradient(0, 0, 0, dim.height);
    if (weather === WeatherType.MARUTHAM) {
      grad.addColorStop(0, '#0a1a2a');
      grad.addColorStop(1, '#1a2a3a');
    } else if (weather === WeatherType.NEITHAL) {
      grad.addColorStop(0, '#10002b');
      grad.addColorStop(0.5, '#3c096c');
      grad.addColorStop(1, '#7b2cbf');
    } else if (weather === WeatherType.MULLAI) {
      grad.addColorStop(0, '#e0e5ec');
      grad.addColorStop(1, '#f7f9fc');
    } else {
      // SUNSET
      grad.addColorStop(0, '#ff7e5f');
      grad.addColorStop(1, '#feb47b');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, dim.width, dim.height);
    ctx.restore();
  };

  const drawBackground = (ctx: CanvasRenderingContext2D, dim: typeof stateRef.current.dimensions) => {
    if (true) {
      const state = stateRef.current;
      ctx.save();
      
      // Dynamic preload and garbage collection: Keep only 2 backgrounds active at a time
      manageBackgroundImageCache(state.currentLand, state.lastLandBeforeTransition);
      
      if (state.landTransitionAlpha < 1.0) {
        // Draw old land background with crossfade
        ctx.globalAlpha = 1.0 - state.landTransitionAlpha;
        drawSingleLandBackground(ctx, dim, state.lastLandBeforeTransition);
        
        // Draw new land background over it with opacity
        ctx.globalAlpha = state.landTransitionAlpha;
        drawSingleLandBackground(ctx, dim, state.currentLand);
      } else {
        ctx.globalAlpha = 1.0;
        drawSingleLandBackground(ctx, dim, state.currentLand);
      }
      
      ctx.restore();
    } else {
      drawClassicBackground(ctx, dim);
    }
  };

  const drawLandInsignia = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, land: WeatherType) => {
    if (land === WeatherType.KURINJI) {
      // 1. KURINJI (Mountains + Kurinji flower)
      ctx.save();
      ctx.translate(x, y);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(-size/2, size/3);
      ctx.lineTo(-size/6, -size/3);
      ctx.lineTo(size/10, size/8);
      ctx.lineTo(size/3, -size/6);
      ctx.lineTo(size/2, size/3);
      ctx.stroke();

      ctx.fillStyle = '#a855f7';
      ctx.shadowColor = '#d8b4fe';
      ctx.shadowBlur = 10;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        const angle = (i * Math.PI * 2) / 5;
        const petalX = Math.cos(angle) * 8;
        const petalY = Math.sin(angle) * 8;
        ctx.arc(petalX, petalY, 6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (land === WeatherType.MULLAI) {
      // 2. MULLAI (Forest + vines/leaves)
      ctx.save();
      ctx.translate(x, y);
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = 8;
      
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(-12, -4, 15, 0, Math.PI * 2);
      ctx.arc(12, -4, 15, 0, Math.PI * 2);
      ctx.arc(0, -15, 18, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-4, 10, 8, 12);
      
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, size/2, -Math.PI/4, Math.PI * 1.2);
      ctx.stroke();
      ctx.restore();
    } else if (land === WeatherType.MARUTHAM) {
      // 3. MARUTHAM (Paddy fields + traditional farming)
      ctx.save();
      ctx.translate(x, y);
      
      ctx.strokeStyle = '#166534';
      ctx.lineWidth = 1.5;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 10, -15);
        ctx.lineTo(i * 10 + 8, 15);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(-20, i * 6);
        ctx.lineTo(20, i * 6);
        ctx.stroke();
      }
      
      ctx.fillStyle = '#f59e0b';
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(0, 18);
      ctx.quadraticCurveTo(-10, -5, 0, -18);
      ctx.quadraticCurveTo(10, -5, 0, 18);
      ctx.fill();
      
      for (let j = 0; j < 5; j++) {
        ctx.beginPath();
        ctx.arc(-5, -12 + j * 6, 3, 0, Math.PI * 2);
        ctx.arc(5, -12 + j * 6, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    } else if (land === WeatherType.NEITHAL) {
      // 4. NEITHAL (Sea waves + leaping fish)
      ctx.save();
      ctx.translate(x, y);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      
      for (let w = 0; w < 3; w++) {
        ctx.beginPath();
        const waveY = -10 + w * 10;
        ctx.arc(-15, waveY, 10, Math.PI, 0, false);
        ctx.arc(5, waveY, 10, Math.PI, 0, false);
        ctx.stroke();
      }
      
      ctx.fillStyle = '#cbd5e1';
      ctx.strokeStyle = '#38bdf8';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 12;
      ctx.lineWidth = 1.5;
      
      ctx.beginPath();
      ctx.ellipse(0, -5, 16, 7, -Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(-12, 2);
      ctx.lineTo(-20, -2);
      ctx.lineTo(-18, 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    } else {
      // 5. PALAI (Desert sun + cracked earth)
      ctx.save();
      ctx.translate(x, y);
      
      ctx.strokeStyle = '#7c2d12';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-20, 15);
      ctx.lineTo(-10, 8);
      ctx.lineTo(10, 8);
      ctx.lineTo(20, 15);
      ctx.moveTo(-10, 8);
      ctx.lineTo(-15, -2);
      ctx.moveTo(10, 8);
      ctx.lineTo(15, -2);
      ctx.stroke();
      
      const sunGrad = safeRadialGradient(ctx, 0, -8, 2, 0, -8, 18);
      sunGrad.addColorStop(0, '#fffbeb');
      sunGrad.addColorStop(0.3, '#f97316');
      sunGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = sunGrad;
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(0, -8, 18, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 2;
      for (let r = 0; r < 8; r++) {
        ctx.beginPath();
        const angle = (r * Math.PI * 2) / 8 + stateRef.current.frameCount * 0.02;
        ctx.moveTo(Math.cos(angle) * 12, -8 + Math.sin(angle) * 12);
        ctx.lineTo(Math.cos(angle) * 20, -8 + Math.sin(angle) * 20);
        ctx.stroke();
      }
      ctx.restore();
    }
  };

  const drawBossEncounter = (ctx: CanvasRenderingContext2D) => {
    const { boss, bossProjectiles, playerProjectiles } = stateRef.current;
    
    // Draw Boss
    ctx.save();
    ctx.globalAlpha = boss.alpha;
    ctx.translate(boss.x, boss.y);
    
    // Epic movie-like shadow aura
    const pulse = Math.sin(stateRef.current.frameCount * 0.1);
    ctx.shadowColor = '#ff2200';
    ctx.shadowBlur = 45 + pulse * 20;
    
    // Custom Mythical Body Shapes based on Active Land (Kurinji, Mullai, Marutham, Neithal, Palai)
    const land = stateRef.current.currentLand;
    const time = stateRef.current.frameCount;

    // Draw realistic background 3D-shaded mechanical rings orbiting around the boss
    ctx.save();
    ctx.shadowBlur = 0; // turn off shadow for cleaner lines
    for (let r = 0; r < 3; r++) {
      ctx.save();
      const rotSpeed = 0.015 * (r === 1 ? -1 : 1.3);
      ctx.rotate(time * rotSpeed + (r * Math.PI / 3));
      
      // Ring color variations based on land
      let ringColor = 'rgba(251, 191, 36, 0.25)'; // Gold
      if (land === WeatherType.MULLAI) ringColor = 'rgba(16, 185, 129, 0.25)'; // Green
      else if (land === WeatherType.NEITHAL) ringColor = 'rgba(6, 182, 212, 0.25)'; // Cyan
      else if (land === WeatherType.PALAI) ringColor = 'rgba(239, 68, 68, 0.3)'; // Red
      
      ctx.strokeStyle = ringColor;
      ctx.lineWidth = 4 - r;
      ctx.beginPath();
      ctx.ellipse(0, 0, 72 + r * 12, 20 + r * 5, Math.PI / 6 * r, 0, Math.PI * 2);
      ctx.stroke();

      // Add a small 3D-orbiting light node on the ring
      const orbitAngle = time * 0.05 + r;
      const ox = Math.cos(orbitAngle) * (72 + r * 12);
      const oy = Math.sin(orbitAngle) * (20 + r * 5);
      
      // 3D rotation projection
      const tilt = Math.PI / 6 * r;
      const projX = ox * Math.cos(tilt) - oy * Math.sin(tilt);
      const projY = ox * Math.sin(tilt) + oy * Math.cos(tilt);

      ctx.fillStyle = land === WeatherType.MULLAI ? '#10b981' : land === WeatherType.NEITHAL ? '#22d3ee' : '#f59e0b';
      ctx.beginPath();
      ctx.arc(projX, projY, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    // 3D MODEL CORNER HORN ELEMENTS OR SHIELDS (Rendered before the core)
    ctx.save();
    if (land === WeatherType.KURINJI) {
      // Mountain Monolith 3D Horns / Spikes projecting forward
      const gradient = ctx.createLinearGradient(-40, -50, 40, -50);
      gradient.addColorStop(0, '#451a03');
      gradient.addColorStop(0.5, '#b45309');
      gradient.addColorStop(1, '#451a03');
      ctx.fillStyle = gradient;
      
      ctx.beginPath();
      // Left horn curved in 3D perspective
      ctx.moveTo(-15, -45);
      ctx.bezierCurveTo(-50, -85 - pulse * 10, -55, -45, -5, -40);
      // Right horn
      ctx.moveTo(15, -45);
      ctx.bezierCurveTo(50, -85 - pulse * 10, 55, -45, 5, -40);
      ctx.fill();
    } else if (land === WeatherType.MARUTHAM) {
      // Raging Bull Golden 3D Shaded Horns
      const hornGrad = ctx.createLinearGradient(-60, -40, 60, -40);
      hornGrad.addColorStop(0, '#78350f');
      hornGrad.addColorStop(0.3, '#d97706');
      hornGrad.addColorStop(0.5, '#fef08a'); // specular highlight
      hornGrad.addColorStop(0.7, '#d97706');
      hornGrad.addColorStop(1, '#78350f');
      ctx.fillStyle = hornGrad;

      ctx.beginPath();
      ctx.moveTo(-15, -35);
      ctx.bezierCurveTo(-65, -65 - pulse * 8, -75, -25, -40, -5);
      ctx.moveTo(15, -35);
      ctx.bezierCurveTo(65, -65 - pulse * 8, 75, -25, 40, -5);
      ctx.fill();
    } else if (land === WeatherType.NEITHAL) {
      // Abyssal 3D Sea Dragon crest spikes
      ctx.fillStyle = '#0f766e';
      ctx.beginPath();
      ctx.moveTo(-35, -45);
      ctx.lineTo(-50, -75);
      ctx.lineTo(-20, -50);
      ctx.lineTo(0, -85 - pulse * 5);
      ctx.lineTo(20, -50);
      ctx.lineTo(50, -75);
      ctx.lineTo(35, -45);
      ctx.fill();
    }
    ctx.restore();

    // MAIN 3D VOLUMETRIC SPHERE CORE
    ctx.save();
    // Establish a perfect sphere boundaries and clip to apply 3D curved textures & shadows on the sphere body!
    ctx.beginPath();
    ctx.arc(0, 0, 52, 0, Math.PI * 2);
    ctx.clip();

    // 1. Draw base 3D shaded sphere using a rich directional radial gradient to create high specular illumination
    const baseGradient = safeRadialGradient(ctx, -18, -18, 0, 0, 0, 56);
    if (land === WeatherType.KURINJI) {
      // Crimson Obsidian Volcanic Mech look
      baseGradient.addColorStop(0, '#ffffff'); // high specular glare
      baseGradient.addColorStop(0.12, '#fca5a5');
      baseGradient.addColorStop(0.4, '#b91c1c');
      baseGradient.addColorStop(0.85, '#450a0a');
      baseGradient.addColorStop(1, '#020105');
    } else if (land === WeatherType.MULLAI) {
      // Mystic Deep Forest Jade
      baseGradient.addColorStop(0, '#ffffff');
      baseGradient.addColorStop(0.15, '#a7f3d0');
      baseGradient.addColorStop(0.45, '#047857');
      baseGradient.addColorStop(0.85, '#064e3b');
      baseGradient.addColorStop(1, '#02180c');
    } else if (land === WeatherType.MARUTHAM) {
      // Polished Bronze and Gold Bull-Reactor
      baseGradient.addColorStop(0, '#ffffff');
      baseGradient.addColorStop(0.15, '#fde047');
      baseGradient.addColorStop(0.45, '#b45309');
      baseGradient.addColorStop(0.85, '#78350f');
      baseGradient.addColorStop(1, '#1c0a02');
    } else if (land === WeatherType.NEITHAL) {
      // Dark Aquamarine Sea Crystal
      baseGradient.addColorStop(0, '#ffffff');
      baseGradient.addColorStop(0.15, '#c7d2fe');
      baseGradient.addColorStop(0.42, '#0369a1');
      baseGradient.addColorStop(0.85, '#0f172a');
      baseGradient.addColorStop(1, '#01030d');
    } else {
      // Palai: Blazing Scorched Dark Obsidian Reactor
      baseGradient.addColorStop(0, '#ffffff');
      baseGradient.addColorStop(0.12, '#fed7aa');
      baseGradient.addColorStop(0.4, '#ea580c');
      baseGradient.addColorStop(0.82, '#450a0a');
      baseGradient.addColorStop(1, '#0c0202');
    }

    ctx.fillStyle = baseGradient;
    ctx.beginPath();
    ctx.arc(0, 0, 52, 0, Math.PI * 2);
    ctx.fill();

    // 2. Overlapping 3D wire grilles representing curved mechanical ribs
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1.5;
    const ribCount = 4;
    for (let i = 1; i < ribCount; i++) {
      const offset = (i / ribCount) * 2 - 1; // range: -1 to 1
      const radY = Math.sqrt(1 - offset * offset) * 52;
      
      // Lateral lines curving realistically on sphere
      ctx.beginPath();
      ctx.ellipse(0, offset * 22, 52, radY * 0.4, 0, 0, Math.PI, true);
      ctx.stroke();

      // Longitudinal lines rotating in 3D
      const rotOffset = Math.sin(time * 0.03 + i) * 52;
      ctx.beginPath();
      ctx.ellipse(rotOffset, 0, Math.abs(rotOffset) * 0.5, 52, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 3. Ancient Mythological central inscription details
    ctx.strokeStyle = land === WeatherType.NEITHAL ? 'rgba(34, 211, 238, 0.45)' : 'rgba(251, 191, 36, 0.45)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, 32, 0, Math.PI * 2);
    ctx.stroke();

    // Core central heat vent grilles (simulating glowing engines inside)
    ctx.fillStyle = land === WeatherType.MULLAI ? '#059669' : land === WeatherType.NEITHAL ? '#0891b2' : '#ea580c';
    ctx.fillRect(-22, 10, 44, 12);
    
    // Draw metallic vertical grill slots
    ctx.fillStyle = '#0d0714';
    for (let slot = -18; slot <= 18; slot += 8) {
      ctx.fillRect(slot - 2, 10, 4, 12);
    }

    ctx.restore(); // Exit sphere clipping path

    // SPECIALLY DESIGNED 3D FOREGROUND OVERLAY ACCESSORIES (Rendered outside to break out of sphere silhouette)
    ctx.save();
    if (land === WeatherType.MULLAI) {
      // 3D Shaded Forest Leaf-shields overlapping the sphere sides
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.ellipse(-52, 0, 16, 25, Math.PI / 4, 0, Math.PI * 2);
      ctx.ellipse(52, 0, 16, 25, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#059669';
      ctx.beginPath();
      ctx.ellipse(-52, 0, 10, 18, Math.PI / 4, 0, Math.PI * 2);
      ctx.ellipse(52, 0, 10, 18, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (land === WeatherType.PALAI) {
      // Blazing 3D Solar Crown flares ejecting outwards
      ctx.fillStyle = '#f97316';
      for (let f = 0; f < 8; f++) {
        const angle = (f / 8) * Math.PI * 2 + time * 0.04;
        const radius = 56 + pulse * 6;
        const fx = Math.cos(angle) * radius;
        const fy = Math.sin(angle) * radius;
        
        ctx.beginPath();
        ctx.arc(fx, fy, 10 + Math.sin(time * 0.1 + f) * 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner bright white-hot flame centers
        ctx.fillStyle = '#fffbeb';
        ctx.beginPath();
        ctx.arc(fx, fy, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f97316'; // reset fill
      }
    }
    ctx.restore();

    // 4. THE GIANT REALISTIC 3D GLOWING CYCLOPS EYE (Tracks the player's y-position dynamically)
    ctx.save();
    const eyeTrackingY = (stateRef.current.player.y - boss.y) * 0.018;
    const eyeTrackingX = (stateRef.current.player.x - boss.x) * 0.015;

    // Outer camera lens bezel
    const lensBezel = safeRadialGradient(ctx, 0, -12, 10, 0, -12, 28);
    lensBezel.addColorStop(0, '#1e293b');
    lensBezel.addColorStop(0.6, '#0f172a');
    lensBezel.addColorStop(1, '#334155');
    ctx.fillStyle = lensBezel;
    ctx.beginPath();
    ctx.arc(0, -12, 24, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffcc00';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, -12, 21, 0, Math.PI * 2);
    ctx.stroke();

    // Glass reflection dome
    const glassDome = safeRadialGradient(ctx, -6, -18, 0, 0, -12, 18);
    glassDome.addColorStop(0, '#ffffff'); // bright reflection point
    glassDome.addColorStop(0.3, land === WeatherType.NEITHAL ? '#06b6d4' : '#ef4444');
    glassDome.addColorStop(0.8, '#450a0a');
    glassDome.addColorStop(1, '#020105');
    ctx.fillStyle = glassDome;
    ctx.beginPath();
    ctx.arc(0, -12, 18, 0, Math.PI * 2);
    ctx.fill();

    // Glowing pupil tracking player
    const pupilGrad = safeRadialGradient(ctx, eyeTrackingX, -12 + eyeTrackingY, 0, eyeTrackingX, -12 + eyeTrackingY, 8);
    pupilGrad.addColorStop(0, '#ffffff');
    pupilGrad.addColorStop(0.4, '#fef08a');
    pupilGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = pupilGrad;
    ctx.beginPath();
    ctx.arc(eyeTrackingX, -12 + eyeTrackingY, 9, 0, Math.PI * 2);
    ctx.fill();

    // Specular starburst flare inside the camera lens
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-10, -12); ctx.lineTo(10, -12);
    ctx.moveTo(0, -22); ctx.lineTo(0, -2);
    ctx.stroke();
    ctx.restore();

    ctx.shadowBlur = 0; // reset for health bar
    
    // Health bar - ancient style
    ctx.fillStyle = 'rgba(20, 0, 0, 0.8)';
    ctx.fillRect(-60, -110, 120, 8);
    ctx.fillStyle = '#ff3300';
    ctx.fillRect(-60, -110, 120 * (boss.health / boss.maxHealth), 8);
    ctx.strokeStyle = '#ffcc00';
    ctx.lineWidth = 1;
    ctx.strokeRect(-60, -110, 120, 8);

    // Draw guardian mythological name
    let bossName = "ANCIENT CORRUPTED GUARDIAN";
    let bossTamil = "கோயில் பாதுகாவலர்";
    if (isStoryMode) {
      if (storyLevel === 1) {
        bossName = "MOUNTAIN SHAMAN: YALI";
        bossTamil = "குறிஞ்சி காவலர்: யாழி (Yali)";
      } else if (storyLevel === 2) {
        bossName = "FOREST COUPLING: SHADOW KOEL";
        bossTamil = "முல்லை காவலர்: நிழல் குயில் (Koel)";
      } else if (storyLevel === 3) {
        bossName = "TERRAIN DESTROYER: RAGING BULL";
        bossTamil = "மருதம் காவலர்: சீறும் காளை (Bull)";
      } else if (storyLevel === 4) {
        bossName = "OCEAN TEMPEST: SEA SERPENT";
        bossTamil = "நெய்தல் காவலர்: பெருங்கடல் நாகம் (Serpent)";
      } else if (storyLevel === 5) {
        bossName = "SCORCHED DESOLATION: SAND DEMON";
        bossTamil = "பாலை காவலர்: பாலைவனப் பேய் (Sand Demon)";
      }
    }
    ctx.font = 'bold 11px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#ff3300';
    ctx.textAlign = 'center';
    ctx.fillText(bossTamil, 0, -130);
    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#ffcc00';
    ctx.fillText(bossName, 0, -118);

    ctx.restore();

    // Draw Boss Projectiles (Shadow Orbs)
    ctx.save();
    ctx.shadowColor = '#ff0055';
    ctx.shadowBlur = 25;
    bossProjectiles.forEach(p => {
      // Wavy shadow core
      ctx.fillStyle = '#ff3300';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Black inner core
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 0.6, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // Draw Player Projectiles (Divine Light Bolts)
    ctx.save();
    playerProjectiles.forEach(p => {
      ctx.save();
      ctx.shadowColor = (p as any).color || '#00e5ff';
      ctx.shadowBlur = 25;
      ctx.fillStyle = (p as any).color || '#FFFFFF';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Divine light trail
      const grad = ctx.createLinearGradient(p.x, p.y, p.x - 40, p.y);
      grad.addColorStop(0, (p as any).color || 'rgba(0, 229, 255, 1)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = p.radius * 0.7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - 40, p.y);
      ctx.stroke();
      ctx.restore();
    });
    ctx.restore();
  };

  const drawObstacles = (ctx: CanvasRenderingContext2D) => {
    const dim = stateRef.current.dimensions;
    const scoreVal = stateRef.current.currentScore;
    const restorationRatio = Math.min(1.0, scoreVal / 15);
    
    stateRef.current.obstacles.forEach(obs => {
      const yOffset = obs.currentYOffset;
      const topH = obs.topHeight + yOffset;
      const botH = obs.bottomHeight - yOffset;
      const centerY = topH + obs.gap / 2;

      // Traditional ornate pillars style or modern neon gates depending on weather
      const isNeon = weather === WeatherType.NEITHAL;
      
      ctx.save();
      
      // Glow settings
      if (isNeon) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00f2fe';
      } else {
        // Deep ancient stone/bronze glow that grows stronger as score increases
        ctx.shadowBlur = 3 + restorationRatio * 15;
        ctx.shadowColor = scoreVal < 6 ? '#ff3300' : '#ffaa00';
      }

      // Draw Top Pillar with dynamic gradient from ruined grey to restored golden bronze
      const topGrad = ctx.createLinearGradient(obs.x, 0, obs.x + obs.width, 0);
      if (isNeon) {
        topGrad.addColorStop(0, '#090514');
        topGrad.addColorStop(0.5, '#00f2fe');
        topGrad.addColorStop(1, '#090514');
      } else {
        // Shifting colors based on visual restoration progression
        let sideColor = '#1b1b1b';
        let centerColor = '#383838';
        let primaryAccent = '#3a332d';
        let secondaryAccent = '#201c18';

        if (weather === WeatherType.KURINJI) {
          sideColor = '#1a0629'; centerColor = '#5e2a84'; primaryAccent = '#a855f7'; secondaryAccent = '#d8b4e2';
        } else if (weather === WeatherType.MULLAI) {
          sideColor = '#001a0b'; centerColor = '#166534'; primaryAccent = '#4ade80'; secondaryAccent = '#a7f3d0';
        } else if (weather === WeatherType.MARUTHAM) {
          sideColor = '#3f1a04'; centerColor = '#b45309'; primaryAccent = '#f59e0b'; secondaryAccent = '#fde68a';
        } else if (weather === WeatherType.NEITHAL) {
          sideColor = '#01152d'; centerColor = '#1e3a8a'; primaryAccent = '#60a5fa'; secondaryAccent = '#bfdbfe';
        } else if (weather === WeatherType.PALAI) {
          sideColor = '#4a1900'; centerColor = '#9a3412'; primaryAccent = '#f97316'; secondaryAccent = '#fed7aa';
        }

        topGrad.addColorStop(0, sideColor);
        topGrad.addColorStop(0.5, centerColor);
        topGrad.addColorStop(1, sideColor);
      }

      ctx.fillStyle = topGrad;
      ctx.fillRect(obs.x, 0, obs.width, topH);

      // Ornate pillar capital / rims (traditional South Indian pillar brackets and bands)
      const primaryAccent = isNeon ? '#4facfe' : (weather === WeatherType.KURINJI ? '#a855f7' : weather === WeatherType.MULLAI ? '#4ade80' : weather === WeatherType.MARUTHAM ? '#f59e0b' : weather === WeatherType.NEITHAL ? '#60a5fa' : '#f97316');
      const secondaryAccent = isNeon ? '#00f2fe' : (weather === WeatherType.KURINJI ? '#d8b4e2' : weather === WeatherType.MULLAI ? '#a7f3d0' : weather === WeatherType.MARUTHAM ? '#fde68a' : weather === WeatherType.NEITHAL ? '#bfdbfe' : '#fed7aa');


      ctx.fillStyle = primaryAccent;
      ctx.fillRect(obs.x - 4, topH - 24, obs.width + 8, 6);
      ctx.fillStyle = secondaryAccent;
      ctx.fillRect(obs.x - 10, topH - 18, obs.width + 20, 10);
      ctx.fillStyle = primaryAccent;
      ctx.fillRect(obs.x - 6, topH - 8, obs.width + 12, 8);

      // Draw Bottom Pillar
      const botGrad = ctx.createLinearGradient(obs.x, dim.height - botH, obs.x + obs.width, dim.height - botH);
      if (isNeon) {
        botGrad.addColorStop(0, '#090514');
        botGrad.addColorStop(0.5, '#00f2fe');
        botGrad.addColorStop(1, '#090514');
      } else {
        const sideColor = scoreVal < 6 ? '#1b1b1b' : (scoreVal < 15 ? '#3a2517' : '#543118');
        const centerColor = scoreVal < 6 ? '#383838' : (scoreVal < 15 ? '#9e741b' : '#ffcc33');
        botGrad.addColorStop(0, sideColor);
        botGrad.addColorStop(0.5, centerColor);
        botGrad.addColorStop(1, sideColor);
      }

      ctx.fillStyle = botGrad;
      ctx.fillRect(obs.x, dim.height - botH, obs.width, botH);

      // Bottom capital/base
      ctx.fillStyle = primaryAccent;
      ctx.fillRect(obs.x - 6, dim.height - botH, obs.width + 12, 8);
      ctx.fillStyle = secondaryAccent;
      ctx.fillRect(obs.x - 10, dim.height - botH + 8, obs.width + 20, 10);
      ctx.fillStyle = primaryAccent;
      ctx.fillRect(obs.x - 4, dim.height - botH + 18, obs.width + 8, 6);

      // Add detailed carvings / volcanic cracks / ancient Tamil letters based on score
      if (!isNeon) {
        if (scoreVal < 6) {
          // Temple is ruined: Draw fiery energy cracks leaking hot red magma
          ctx.strokeStyle = '#ff3300';
          ctx.lineWidth = 1.8;
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#ff3300';

          // Top cracks
          ctx.beginPath();
          ctx.moveTo(obs.x + 10, 15);
          ctx.lineTo(obs.x + 35, 50);
          ctx.lineTo(obs.x + 15, 95);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(obs.x + obs.width - 15, 45);
          ctx.lineTo(obs.x + obs.width - 35, 110);
          ctx.lineTo(obs.x + obs.width - 10, 160);
          ctx.stroke();

          // Bottom cracks
          ctx.beginPath();
          ctx.moveTo(obs.x + 15, dim.height - 25);
          ctx.lineTo(obs.x + 35, dim.height - 75);
          ctx.lineTo(obs.x + 12, dim.height - 120);
          ctx.stroke();
        } else {
          // Temple is restoring: Draw gorgeous golden horizontal bands (traditional molding)
          ctx.strokeStyle = 'rgba(255, 215, 0, 0.35)';
          ctx.lineWidth = 1.5;
          for (let h = 30; h < topH - 30; h += 35) {
            ctx.beginPath();
            ctx.moveTo(obs.x, h);
            ctx.lineTo(obs.x + obs.width, h);
            ctx.stroke();
          }
          for (let h = dim.height - botH + 35; h < dim.height - 30; h += 35) {
            ctx.beginPath();
            ctx.moveTo(obs.x, h);
            ctx.lineTo(obs.x + obs.width, h);
            ctx.stroke();
          }

          // Draw floating glowing sacred Tamil letters as visual highlights!
          ctx.save();
          ctx.fillStyle = 'rgba(255, 215, 0, 0.85)';
          ctx.shadowColor = '#ffaa00';
          ctx.shadowBlur = 8;
          ctx.font = '900 18px "Segoe UI", "Noto Sans Tamil", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          const tamilRunes = ['அ', 'உ', 'சி', 'வ', 'ஓம்'];
          const runeIndex = (Math.floor(obs.x / 140) % tamilRunes.length + tamilRunes.length) % tamilRunes.length;
          const chosenRune = tamilRunes[runeIndex];

          if (topH > 100) {
            ctx.fillText(chosenRune, obs.x + obs.width / 2, topH / 2);
          }
          if (botH > 100) {
            ctx.fillText(chosenRune, obs.x + obs.width / 2, dim.height - botH / 2);
          }
          ctx.restore();
        }
      } else {
        // Neon horizontal grid lines
        ctx.strokeStyle = 'rgba(0, 242, 254, 0.4)';
        ctx.lineWidth = 1.5;
        for (let h = 30; h < topH - 30; h += 40) {
          ctx.beginPath();
          ctx.moveTo(obs.x, h);
          ctx.lineTo(obs.x + obs.width, h);
          ctx.stroke();
        }
        for (let h = dim.height - botH + 40; h < dim.height - 30; h += 40) {
          ctx.beginPath();
          ctx.moveTo(obs.x, h);
          ctx.lineTo(obs.x + obs.width, h);
          ctx.stroke();
        }
      }

      // Draw active obstacle types (rotating laser, moving, glowing rune)
      if (obs.type === ObstacleType.ROTATING_LASER) {
        // Red revolving warning energy cores on pillar endpoints
        ctx.fillStyle = '#ff0055';
        ctx.shadowColor = '#ff0055';
        ctx.shadowBlur = 15;
        
        ctx.beginPath();
        ctx.arc(obs.x + obs.width / 2, topH, 8, 0, Math.PI * 2);
        ctx.fill();

        // Glowing threat line
        const laserLength = 150;
        const endX = obs.x + obs.width / 2 + Math.cos(obs.laserAngle) * laserLength;
        const endY = centerY + Math.sin(obs.laserAngle) * laserLength;

        ctx.strokeStyle = '#ff0055';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(obs.x + obs.width / 2, centerY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Pulsing warning sphere at the center of the gap
        ctx.fillStyle = 'rgba(255, 0, 85, 0.15)';
        ctx.beginPath();
        ctx.arc(obs.x + obs.width / 2, centerY, 15 + Math.sin(stateRef.current.frameCount * 0.1) * 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (obs.type === ObstacleType.GATEWAY) {
        // Draw an ancient glowing rune symbol floating in the center of the gap
        ctx.save();
        ctx.strokeStyle = 'rgba(218, 165, 32, 0.6)';
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 10;
        ctx.lineWidth = 2;
        ctx.translate(obs.x + obs.width / 2, centerY);
        ctx.rotate(stateRef.current.frameCount * 0.01);
        
        // Star pattern
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (i / 5) * Math.PI * 2;
          ctx.lineTo(Math.cos(angle) * 14, Math.sin(angle) * 14);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      }

      // Draw Animal Obstacles at the edges with majestic ancient designs
      if (obs.type === ObstacleType.ELEPHANT) {
        ctx.save();
        ctx.translate(obs.x + obs.width / 2, dim.height - botH);
        ctx.fillStyle = '#6d6d6d';
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 8;
        
        // Elephant body dome
        ctx.beginPath();
        ctx.arc(0, -15, 20, Math.PI, 0, false);
        ctx.lineTo(20, 0);
        ctx.lineTo(-20, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Ears
        ctx.fillStyle = '#ffaa00';
        ctx.beginPath();
        ctx.arc(-15, -20, 8, 0, Math.PI * 2);
        ctx.arc(15, -20, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Trunk
        ctx.strokeStyle = '#6d6d6d';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.quadraticCurveTo(-10, -5, -5, 8);
        ctx.stroke();

        // Tusks (White)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(-8, -12);
        ctx.lineTo(-15, -5);
        ctx.lineTo(-6, -10);
        ctx.moveTo(8, -12);
        ctx.lineTo(15, -5);
        ctx.lineTo(6, -10);
        ctx.fill();

        ctx.restore();
      } else if (obs.type === ObstacleType.MONKEY) {
        ctx.save();
        ctx.translate(obs.x + obs.width / 2, topH);
        ctx.fillStyle = '#8B4513';
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = '#ff5722';
        ctx.shadowBlur = 8;

        // Monkey head and body
        ctx.beginPath();
        ctx.arc(0, 10, 10, 0, Math.PI * 2); // Head
        ctx.arc(0, 25, 14, 0, Math.PI * 2); // Body
        ctx.fill();
        ctx.stroke();

        // Monkey Tail coiled
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 39);
        ctx.quadraticCurveTo(-15, 45, -10, 55);
        ctx.stroke();

        // Glowing eyes
        ctx.fillStyle = '#ff3d00';
        ctx.beginPath();
        ctx.arc(-4, 8, 2, 0, Math.PI * 2);
        ctx.arc(4, 8, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      } else if (obs.type === ObstacleType.SNAKE) {
        ctx.save();
        ctx.translate(obs.x + obs.width / 2, dim.height - botH);
        ctx.strokeStyle = '#2E7D32';
        ctx.fillStyle = '#1B5E20';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#00E676';

        // Snake coils wrapping up
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-15, -15, 15, -30, 0, -45);
        ctx.stroke();

        // Cobra hood
        ctx.fillStyle = '#4CAF50';
        ctx.beginPath();
        ctx.ellipse(0, -42, 10, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Glowing yellow serpent eyes
        ctx.fillStyle = '#FFD600';
        ctx.beginPath();
        ctx.arc(-3, -44, 1.5, 0, Math.PI * 2);
        ctx.arc(3, -44, 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      } else if (obs.type === ObstacleType.BULL) {
        ctx.save();
        ctx.translate(obs.x + obs.width / 2, dim.height - botH);
        ctx.fillStyle = '#E0E0E0';
        ctx.strokeStyle = '#FFb300';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = '#FF8F00';
        ctx.shadowBlur = 10;

        // Nandi Bull hump/body
        ctx.beginPath();
        ctx.arc(0, -15, 18, Math.PI, 0, false);
        ctx.lineTo(18, 0);
        ctx.lineTo(-18, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Head
        ctx.beginPath();
        ctx.ellipse(-15, -25, 8, 12, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Horns (glowing yellow gold)
        ctx.fillStyle = '#FFD54F';
        ctx.beginPath();
        ctx.moveTo(-18, -32);
        ctx.quadraticCurveTo(-25, -45, -18, -48);
        ctx.quadraticCurveTo(-15, -42, -15, -32);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
      } else if (obs.type === ObstacleType.CROCODILE) {
        ctx.save();
        ctx.translate(obs.x + obs.width / 2, dim.height - botH);
        ctx.fillStyle = '#2E7D32'; // dark green
        ctx.strokeStyle = '#81C784'; // light green trim
        ctx.lineWidth = 1.5;
        ctx.shadowColor = '#00E676';
        ctx.shadowBlur = 8;

        // Crocodile snout/body
        ctx.beginPath();
        ctx.moveTo(-25, 0);
        ctx.lineTo(-35, -12); // long snout
        ctx.lineTo(-20, -18);
        ctx.quadraticCurveTo(0, -25, 25, -10); // body
        ctx.lineTo(25, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Spikes on back
        ctx.fillStyle = '#1B5E20';
        for (let i = -10; i < 20; i += 8) {
          ctx.beginPath();
          ctx.moveTo(i, -20);
          ctx.lineTo(i + 4, -28);
          ctx.lineTo(i + 8, -20);
          ctx.closePath();
          ctx.fill();
        }

        // Glowing red eye
        ctx.fillStyle = '#FF1744';
        ctx.beginPath();
        ctx.arc(-18, -19, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      } else if (obs.type === ObstacleType.CRAB) {
        ctx.save();
        ctx.translate(obs.x + obs.width / 2, dim.height - botH);
        ctx.fillStyle = '#E64A19'; // deep orange
        ctx.strokeStyle = '#FFCC80';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = '#FF3D00';
        ctx.shadowBlur = 8;

        // Crab body
        ctx.beginPath();
        ctx.ellipse(0, -12, 18, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Legs (3 on each side)
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#E64A19';
        [-1, 1].forEach(side => {
          for (let i = 0; i < 3; i++) {
            const angle = (i * 0.2 + 0.1) * Math.PI;
            ctx.beginPath();
            ctx.moveTo(side * 14, -12);
            ctx.quadraticCurveTo(side * (24 + i * 4), -18 + i * 5, side * (22 + i * 5), 0);
            ctx.stroke();
          }
        });

        // Eyes on stalks
        ctx.lineWidth = 1.5;
        ctx.fillStyle = '#000000';
        [-4, 4].forEach(offset => {
          ctx.beginPath();
          ctx.moveTo(offset, -20);
          ctx.lineTo(offset * 1.5, -28);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(offset * 1.5, -28, 2.5, 0, Math.PI * 2);
          ctx.fill();
        });

        // "CRAB USE HAND TO ATTACK" - draw giant glowing snapping claws when attacking (botH is extended!)
        if (botH > 50) {
          ctx.save();
          ctx.fillStyle = '#FF3D00';
          ctx.strokeStyle = '#FFD54F';
          ctx.lineWidth = 2;
          ctx.shadowColor = '#FF3D00';
          ctx.shadowBlur = 12;

          // Left Claw Arm and Pinchers
          ctx.beginPath();
          ctx.moveTo(-12, -12);
          ctx.quadraticCurveTo(-28, -25, -24, -38);
          ctx.lineTo(-12, -32);
          ctx.stroke();

          // Left Snapping Claws
          ctx.beginPath();
          ctx.ellipse(-24, -38, 8, 12, -Math.PI / 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Left moving blade
          ctx.beginPath();
          ctx.moveTo(-30, -42);
          ctx.quadraticCurveTo(-38, -32, -26, -28);
          ctx.stroke();

          // Right Claw Arm and Pinchers
          ctx.beginPath();
          ctx.moveTo(12, -12);
          ctx.quadraticCurveTo(28, -25, 24, -38);
          ctx.lineTo(12, -32);
          ctx.stroke();

          // Right Snapping Claws
          ctx.beginPath();
          ctx.ellipse(24, -38, 8, 12, Math.PI / 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Right moving blade
          ctx.beginPath();
          ctx.moveTo(30, -42);
          ctx.quadraticCurveTo(38, -32, 26, -28);
          ctx.stroke();

          ctx.restore();
        } else {
          // Standard smaller resting claws
          ctx.fillStyle = '#D84315';
          ctx.beginPath();
          ctx.arc(-16, -18, 5, 0, Math.PI * 2);
          ctx.arc(16, -18, 5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      } else if (obs.type === ObstacleType.PLANT) {
        ctx.save();
        ctx.translate(obs.x + obs.width / 2, dim.height - botH);
        
        // Deep magical swamp purple and toxic neon green
        ctx.fillStyle = '#4A148C'; // Deep violet
        ctx.strokeStyle = '#00E676'; // Toxic green edge
        ctx.lineWidth = 2;
        ctx.shadowColor = '#00E676';
        ctx.shadowBlur = 10;

        // Draw multiple twisting thorny vine stalks reaching up from the ocean floor
        ctx.beginPath();
        ctx.moveTo(-8, botH);
        ctx.quadraticCurveTo(-22, -botH * 0.5, -4, -15);
        ctx.quadraticCurveTo(12, -botH * 0.2, 4, botH);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(8, botH);
        ctx.quadraticCurveTo(22, -botH * 0.5, 4, -15);
        ctx.quadraticCurveTo(-12, -botH * 0.2, -4, botH);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Thorns along the vine stalks
        ctx.fillStyle = '#00E676';
        for (let thY = -5; thY < botH; thY += 16) {
          const ratio = thY / botH;
          // Left side thorn
          ctx.beginPath();
          ctx.moveTo(-6, thY);
          ctx.lineTo(-14, thY - 4);
          ctx.lineTo(-4, thY + 4);
          ctx.closePath();
          ctx.fill();

          // Right side thorn
          ctx.beginPath();
          ctx.moveTo(6, thY);
          ctx.lineTo(14, thY - 4);
          ctx.lineTo(4, thY + 4);
          ctx.closePath();
          ctx.fill();
        }

        // Top main Carnivorous Venus Jaws Pod (scary monster flower!)
        ctx.save();
        ctx.translate(0, -18);
        
        // Scale jaw pod depending on height/stretch factor
        const scaleFactor = 1.0 + (botH > 40 ? (botH - 40) / 120 : 0);
        ctx.scale(scaleFactor, scaleFactor);

        // Draw outer jaws (clamped or opened depending on stretch!)
        const isOpen = botH > 50;
        ctx.fillStyle = '#6A1B9A'; // purple
        ctx.strokeStyle = '#00E676';

        // Upper jaw lid
        ctx.beginPath();
        ctx.arc(0, -2, 14, Math.PI, 0, false);
        if (isOpen) {
          ctx.lineTo(14, -16); // wider mouth opening
        } else {
          ctx.lineTo(14, -4);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Lower jaw lid
        ctx.beginPath();
        ctx.arc(0, 2, 14, 0, Math.PI, false);
        if (isOpen) {
          ctx.lineTo(-14, 16); // wider mouth opening
        } else {
          ctx.lineTo(-14, 4);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Inside toxic red throat
        ctx.fillStyle = '#D50000';
        ctx.beginPath();
        ctx.ellipse(0, 0, 10, isOpen ? 10 : 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Glowing yellow fangs/teeth
        ctx.fillStyle = '#FFEB3B';
        if (isOpen) {
          // Upper teeth
          [-8, -4, 0, 4, 8].forEach(toothX => {
            ctx.beginPath();
            ctx.moveTo(toothX, -2);
            ctx.lineTo(toothX - 2, 4);
            ctx.lineTo(toothX + 2, 4);
            ctx.closePath();
            ctx.fill();
          });
          // Lower teeth
          [-8, -4, 0, 4, 8].forEach(toothX => {
            ctx.beginPath();
            ctx.moveTo(toothX, 2);
            ctx.lineTo(toothX - 2, -4);
            ctx.lineTo(toothX + 2, -4);
            ctx.closePath();
            ctx.fill();
          });
        } else {
          // Subtle sharp lip lines
          ctx.fillStyle = '#00E676';
          ctx.fillRect(-12, -1, 24, 2);
        }

        ctx.restore();
        ctx.restore();
      }

      ctx.restore();
    });
  };

  const drawPowerUps = (ctx: CanvasRenderingContext2D) => {
    stateRef.current.powerUps.forEach(pw => {
      ctx.save();
      ctx.translate(pw.x, pw.y);
      ctx.scale(pw.pulseScale, pw.pulseScale);

      // Shadow glow
      ctx.shadowBlur = 15;

      if (pw.type === PowerUpType.COIN) {
        ctx.shadowColor = '#FFD700';
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(pw.x, pw.y, pw.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.arc(pw.x, pw.y, pw.radius * 0.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = '12px "JetBrains Mono"';
        ctx.fillText('₹', pw.x - 4, pw.y + 4);
      } else if (pw.type === PowerUpType.SACRED_FEATHER) {
        // Mystical Peacock Feather Relic
        ctx.shadowColor = '#00a86b';
        ctx.save();
        ctx.rotate(Math.PI / 4);
        
        // Spine
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, 15);
        ctx.lineTo(0, -15);
        ctx.stroke();
        
        // Vanes
        for (let i = -12; i < 12; i += 2) {
          const l = 10 * Math.sin(((i + 12) / 24) * Math.PI);
          ctx.beginPath();
          ctx.moveTo(0, i);
          ctx.lineTo(-l, i - 3);
          ctx.moveTo(0, i);
          ctx.lineTo(l, i - 3);
          ctx.strokeStyle = i < 0 ? '#ffd700' : '#00a86b';
          ctx.stroke();
        }
        
        // The Eye
        ctx.fillStyle = '#000080'; // Navy
        ctx.beginPath();
        ctx.ellipse(0, -10, 4, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.restore();
      } else {
        // Celestial Relic Orbs
        let color = '#fff';
        let innerSymbol: React.ReactNode = null;

        if (pw.type === PowerUpType.SHIELD) {
          color = '#ff9800'; // Amber Shield
          ctx.shadowColor = '#ff9800';
          
          // Shield Crest
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, pw.radius, 0, Math.PI * 2);
          ctx.stroke();
          
          ctx.fillStyle = 'rgba(255, 152, 0, 0.3)';
          ctx.beginPath();
          ctx.arc(0, 0, pw.radius - 4, 0, Math.PI * 2);
          ctx.fill();
        } else if (pw.type === PowerUpType.SLOW_MO) {
          color = '#00e5ff'; // Cyan clock
          ctx.shadowColor = '#00e5ff';
          
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, pw.radius, 0, Math.PI * 2);
          ctx.stroke();

          // clock hands
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, -6);
          ctx.moveTo(0, 0);
          ctx.lineTo(4, 2);
          ctx.stroke();
        } else if (pw.type === PowerUpType.DOUBLE_SCORE) {
          color = '#e040fb'; // Purple double scroll
          ctx.shadowColor = '#e040fb';
          
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, pw.radius, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = color;
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('2X', 0, 0);
        } else if (pw.type === PowerUpType.BOOST) {
          color = '#ff3d00'; // Crimson boost
          ctx.shadowColor = '#ff3d00';

          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, pw.radius, 0, Math.PI * 2);
          ctx.stroke();

          // flame spark
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.moveTo(0, -9);
          ctx.quadraticCurveTo(5, 0, 0, 9);
          ctx.quadraticCurveTo(-5, 0, 0, -9);
          ctx.fill();
        } else if (pw.type === PowerUpType.SOUL_FRAGMENT) {
          color = '#d500f9'; // Neon violet
          ctx.shadowColor = '#d500f9';
          ctx.fillStyle = '#d500f9';
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;

          // Rotating diamond shape
          const rotateAngle = (stateRef.current.frameCount * 0.05);
          ctx.rotate(rotateAngle);

          ctx.beginPath();
          ctx.moveTo(0, -10);
          ctx.lineTo(6, 0);
          ctx.lineTo(0, 10);
          ctx.lineTo(-6, 0);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Small shining center
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, 0, 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (pw.type === PowerUpType.GOLDEN_AURA) {
          // Golden Aura Sigil - Sacred Geometry
          ctx.shadowColor = '#ffd700';
          ctx.shadowBlur = 20;

          // Draw glowing outer sacred ring
          ctx.strokeStyle = '#ffd700';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(0, 0, pw.radius, 0, Math.PI * 2);
          ctx.stroke();

          // Draw pulsating golden core
          ctx.fillStyle = 'rgba(255, 215, 0, 0.25)';
          ctx.beginPath();
          ctx.arc(0, 0, pw.radius - 4, 0, Math.PI * 2);
          ctx.fill();

          // Draw rotating sacred triangle
          ctx.save();
          ctx.rotate(stateRef.current.frameCount * 0.04);
          ctx.strokeStyle = '#ffb300';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2;
            ctx.lineTo(Math.cos(angle) * (pw.radius - 2), Math.sin(angle) * (pw.radius - 2));
          }
          ctx.closePath();
          ctx.stroke();
          ctx.restore();

          // Draw counter-rotating inner triangle
          ctx.save();
          ctx.rotate(-stateRef.current.frameCount * 0.03 + Math.PI);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.beginPath();
          for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2;
            ctx.lineTo(Math.cos(angle) * (pw.radius - 6), Math.sin(angle) * (pw.radius - 6));
          }
          ctx.closePath();
          ctx.stroke();
          ctx.restore();

          // Center sun spark
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, 0, 3, 0, Math.PI * 2);
          ctx.fill();
        } else if (pw.type === PowerUpType.TIME_WARP) {
          // Time Warp Sigil - Temporal Sacred Geometry
          ctx.shadowColor = '#00e5ff';
          ctx.shadowBlur = 20;

          // Draw outer temporal ripple ring (golden outer)
          ctx.strokeStyle = '#ffd700';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(0, 0, pw.radius, 0, Math.PI * 2);
          ctx.stroke();

          // Draw pulsating temporal core (blue core)
          const corePulse = Math.sin(stateRef.current.frameCount * 0.1) * 3;
          ctx.fillStyle = 'rgba(0, 229, 255, 0.25)';
          ctx.beginPath();
          ctx.arc(0, 0, Math.max(2, pw.radius - 6 + corePulse), 0, Math.PI * 2);
          ctx.fill();

          // Draw temporal spiral pattern / hourglass sigil
          ctx.save();
          ctx.rotate(stateRef.current.frameCount * 0.05);
          ctx.strokeStyle = '#ffd700';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(-(pw.radius - 4), -(pw.radius - 4));
          ctx.lineTo(pw.radius - 4, -(pw.radius - 4));
          ctx.lineTo(-(pw.radius - 4), pw.radius - 4);
          ctx.lineTo(pw.radius - 4, pw.radius - 4);
          ctx.closePath();
          ctx.stroke();
          ctx.restore();

          // Glowing center dot
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, 0, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
    });
  };

  const drawPlayerTrail = (ctx: CanvasRenderingContext2D) => {
    stateRef.current.player.trail.forEach(t => {
      if (!t || typeof t.x !== 'number' || typeof t.y !== 'number' || isNaN(t.x) || isNaN(t.y)) return;
      const r = stateRef.current.player.radius * Math.max(0.01, t.scale || 0);
      if (!isFinite(r) || r <= 0) return;
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, t.alpha || 0));
      
      const innerR = Math.min(0.5, r * 0.1);
      const grad = safeRadialGradient(ctx, t.x, t.y, innerR, t.x, t.y, r);
      grad.addColorStop(0, selectedSkin.trailColor);
      grad.addColorStop(1, 'rgba(255, 111, 0, 0)');
      
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(t.x, t.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  };

  const drawPlayer = (ctx: CanvasRenderingContext2D) => {
    const { player } = stateRef.current;
    
    ctx.save();
    ctx.translate(100, player.y);
    ctx.rotate(player.rotation);

    // Max Upgrade Auras
    const upLevel = stateRef.current.upgrades;
    if (upLevel) {
      const pulse = Math.sin(stateRef.current.frameCount * 0.15);
      
      // 1. Attack level 6: Fiery Red Flame Aura
      if (upLevel.attack >= 6) {
        ctx.save();
        ctx.shadowBlur = 20 + pulse * 10;
        ctx.shadowColor = '#ff2200';
        ctx.strokeStyle = 'rgba(255, 34, 0, 0.45)';
        ctx.lineWidth = 2.5;
        ctx.rotate(stateRef.current.frameCount * 0.05);
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const r = player.radius + 10 + Math.sin(stateRef.current.frameCount * 0.2 + i) * 4;
          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.fillStyle = 'rgba(255, 50, 0, 0.15)';
        ctx.fill();
        ctx.restore();
      }

      // 2. Life level 6: Angelic Golden Halo
      if (upLevel.life >= 6) {
        ctx.save();
        // Translate to top of the bird
        ctx.translate(0, -player.radius - 8);
        ctx.scale(1.2, 0.45); // squish into a 3D looking ellipse
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ffd700';
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.85)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 3. Durability level 6: Rotating Blue Plasma Forcefield Ring
      if (upLevel.durability >= 6) {
        ctx.save();
        ctx.shadowBlur = 18;
        ctx.shadowColor = '#00d5ff';
        ctx.strokeStyle = 'rgba(0, 213, 255, 0.7)';
        ctx.lineWidth = 2;
        ctx.rotate(-stateRef.current.frameCount * 0.03);
        ctx.beginPath();
        ctx.arc(0, 0, player.radius + 16, 0, Math.PI * 2);
        ctx.stroke();
        
        // Rotating nodes on the forcefield ring
        for (let j = 0; j < 3; j++) {
          ctx.save();
          ctx.rotate((j * Math.PI * 2) / 3);
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(player.radius + 16, 0, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        ctx.restore();
      }
    }

    // Glow Aura
    ctx.shadowBlur = selectedSkin.id === 'spirit' ? 25 : 15;
    ctx.shadowColor = selectedSkin.color;

    // --- DRAW GOLDEN AURA SHIELD ---
    if (player.goldenAuraTimeLeft > 0) {
      ctx.save();
      ctx.rotate(-stateRef.current.frameCount * 0.03);
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.95)';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 25;

      // Outer flaming sun aura
      ctx.beginPath();
      const numRays = 12;
      for (let i = 0; i < numRays; i++) {
        const angle = (i / numRays) * Math.PI * 2;
        const radiusOffset = i % 2 === 0 ? 22 : 16;
        const x = Math.cos(angle) * (player.radius + radiusOffset);
        const y = Math.sin(angle) * (player.radius + radiusOffset);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();

      // Inner sacred geometric mandala circles
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, player.radius + 11, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    }

    // --- DRAW MANDALA SHIELD AURA ---
    if (player.shieldTimeLeft > 0) {
      ctx.save();
      ctx.rotate(stateRef.current.frameCount * 0.04);
      ctx.strokeStyle = 'rgba(255, 165, 0, 0.8)';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 15;

      // Draw celestial concentric mandala circles
      ctx.beginPath();
      ctx.arc(0, 0, player.radius + 15, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 215, 0, 0.4)';
      ctx.beginPath();
      // Draw a rotating 8-point star pattern
      for (let i = 0; i < 8; i++) {
        const a1 = (i / 8) * Math.PI * 2;
        const a2 = ((i + 2.5) / 8) * Math.PI * 2;
        ctx.moveTo(Math.cos(a1) * (player.radius + 18), Math.sin(a1) * (player.radius + 18));
        ctx.lineTo(Math.cos(a2) * (player.radius + 18), Math.sin(a2) * (player.radius + 18));
      }
      ctx.stroke();
      ctx.restore();
    }

    // --- DRAW CELESTIAL BOOST STREAM ---
    if (player.boostTimeLeft > 0) {
      ctx.save();
      const bGrad = ctx.createLinearGradient(-40, 0, 0, 0);
      bGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      bGrad.addColorStop(0.5, selectedSkin.color);
      bGrad.addColorStop(1, '#ffffff');
      ctx.fillStyle = bGrad;
      ctx.beginPath();
      ctx.moveTo(-45, -15);
      ctx.lineTo(0, -8);
      ctx.lineTo(0, 8);
      ctx.lineTo(-45, 15);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // --- DRAW SPECIFIC SKINS GEOMETRY ---
    if (selectedSkin.type === 'phoenix' || selectedSkin.type === 'garuda') {
      // 1. ELEGANT GLOWING FEATHER TAIL (Highly realistic detailed plumes)
      ctx.save();
      const waveOffset = Math.sin(stateRef.current.frameCount * 0.08) * 4;
      ctx.lineWidth = 2.0;
      
      // 3 flowing elegant tail plumes
      const tailFeathers = [-0.15, 0, 0.15];
      tailFeathers.forEach((angle, idx) => {
        ctx.save();
        ctx.rotate(angle);
        
        // Plume quill path
        ctx.beginPath();
        ctx.moveTo(-10, waveOffset * (idx - 1));
        const cx1 = -22;
        const cy1 = -8 + waveOffset;
        const ex = -38 - (idx * 3);
        const ey = -5 + (idx * 4) + waveOffset;
        ctx.quadraticCurveTo(cx1, cy1, ex, ey);
        ctx.strokeStyle = selectedSkin.trailColor;
        ctx.stroke();

        // Realistic feather blade outline with gradient fill
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.quadraticCurveTo(cx1 - 2, cy1 - 4, -10, waveOffset * (idx - 1));
        ctx.quadraticCurveTo(cx1 + 2, cy1 + 4, ex, ey);
        const plumeGrad = safeRadialGradient(ctx, ex, ey, 1, ex, ey, 14);
        plumeGrad.addColorStop(0, '#ffffff');
        plumeGrad.addColorStop(0.3, selectedSkin.color);
        plumeGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = plumeGrad;
        ctx.fill();

        // Plume endpoint bead
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = selectedSkin.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(ex, ey, 3.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      });
      ctx.restore();

      // 2. MAIN BIRD BODY (Stunning 3D volumetric look using radial gradients)
      ctx.save();
      const bodyGrad = safeRadialGradient(ctx, 5, -4, 2, 0, 0, player.radius + 4);
      bodyGrad.addColorStop(0, '#fff3e0'); // Warm sunny highlight
      bodyGrad.addColorStop(0.5, selectedSkin.color);
      bodyGrad.addColorStop(1, '#3e0600'); // Shadowed underside
      
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.moveTo(18, 0);
      ctx.quadraticCurveTo(0, -15, -16, 0);
      ctx.quadraticCurveTo(0, 15, 18, 0);
      ctx.fill();

      // Chest fluffy feather pattern
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(6 - (i * 4), 3 + (i % 2 === 0 ? 1 : -1), 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 3. DETAILED GLOWING SACRED EYE
      ctx.save();
      // White eyeball
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(10, -4, 4, 2.5, Math.PI / 12, 0, Math.PI * 2);
      ctx.fill();
      
      // Radiant golden iris & dark pupil
      ctx.fillStyle = '#ffaa00';
      ctx.beginPath();
      ctx.arc(10.5, -4, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0a0500';
      ctx.beginPath();
      ctx.arc(11, -4, 1, 0, Math.PI * 2);
      ctx.fill();

      // Tiny specular reflection spark
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(12, -5, 0.75, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 4. SHARP BEVELED BEAK (With realistic 3D bevel shading)
      ctx.save();
      // Upper beak (golden light)
      ctx.fillStyle = '#ffea00';
      ctx.beginPath();
      ctx.moveTo(17, -3);
      ctx.lineTo(26, 0.5);
      ctx.lineTo(17, 0.5);
      ctx.closePath();
      ctx.fill();

      // Lower beak (shaded dark gold)
      ctx.fillStyle = '#cca300';
      ctx.beginPath();
      ctx.moveTo(17, 0.5);
      ctx.lineTo(26, 0.5);
      ctx.lineTo(17, 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // 5. CROWN CREST FEATHERS (Glorious divine plumes)
      ctx.save();
      ctx.strokeStyle = selectedSkin.color;
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 3; i++) {
        const cAngle = -0.4 - (i * 0.15);
        ctx.save();
        ctx.translate(12, -8);
        ctx.rotate(cAngle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(4, -8, 8, -14);
        ctx.stroke();

        ctx.fillStyle = '#ffea00';
        ctx.beginPath();
        ctx.arc(8, -14, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();

      // 6. MULTI-LAYERED OVERLAPPING WINGS (3 Feathers spread apart organically)
      ctx.save();
      ctx.rotate(player.wingAngle);
      
      const wingFeathers = [0, 0.12, 0.24];
      wingFeathers.forEach((fAngle, fIdx) => {
        ctx.save();
        ctx.rotate(-fAngle); // Spread feathers backward
        
        const wGrad = ctx.createLinearGradient(0, 0, -8, -35);
        wGrad.addColorStop(0, selectedSkin.color);
        wGrad.addColorStop(0.65, selectedSkin.trailColor);
        wGrad.addColorStop(1, '#ffffff');
        
        ctx.fillStyle = wGrad;
        ctx.beginPath();
        ctx.moveTo(-5, 0);
        // Wing shape curved backward beautifully
        ctx.bezierCurveTo(-15, -15, -8 - (fIdx * 3), -35 - (fIdx * 2), 5, -30);
        ctx.bezierCurveTo(0, -15, 2, -5, -5, 0);
        ctx.fill();
        ctx.restore();
      });
      ctx.restore();

    } else if (selectedSkin.type === 'drone') {
      // CYBER DRONE
      ctx.fillStyle = '#1e1e38';
      ctx.strokeStyle = selectedSkin.color;
      ctx.lineWidth = 2.5;

      // Chassis ring
      ctx.beginPath();
      ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Glowing core thruster
      ctx.fillStyle = selectedSkin.color;
      ctx.shadowColor = selectedSkin.color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(-8, 0, 7, 0, Math.PI * 2);
      ctx.fill();

      // Front sensor lens
      ctx.fillStyle = '#ff0055';
      ctx.beginPath();
      ctx.arc(12, 0, 3, 0, Math.PI * 2);
      ctx.fill();

      // Drone side thrusters (like flapping arms)
      ctx.save();
      ctx.strokeStyle = selectedSkin.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -player.radius);
      ctx.lineTo(Math.cos(player.wingAngle) * -12, -player.radius - 12);
      ctx.moveTo(0, player.radius);
      ctx.lineTo(Math.cos(player.wingAngle) * -12, player.radius + 12);
      ctx.stroke();
      ctx.restore();

    } else if (selectedSkin.type === 'spirit') {
      // COSMIC SPIRIT ORB
      const rGrad = safeRadialGradient(ctx, 0, 0, 1, 0, 0, player.radius);
      rGrad.addColorStop(0, '#ffffff');
      rGrad.addColorStop(0.4, selectedSkin.color);
      rGrad.addColorStop(1, 'rgba(213,0,249,0)');

      ctx.fillStyle = rGrad;
      ctx.beginPath();
      ctx.arc(0, 0, player.radius + 5, 0, Math.PI * 2);
      ctx.fill();

      // Inner orbiting particles
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 3; i++) {
        const orbitAngle = stateRef.current.frameCount * 0.08 + (i * Math.PI * 2 / 3);
        const oX = Math.cos(orbitAngle) * 8;
        const oY = Math.sin(orbitAngle) * 8;
        ctx.beginPath();
        ctx.arc(oX, oY, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (selectedSkin.type === 'peacock') {
      // Mayil (Peacock) - Draw a beautiful fan of peacock tail feathers
      ctx.save();
      const numPlumes = 5;
      for (let i = 0; i < numPlumes; i++) {
        const angle = -0.3 + (i / (numPlumes - 1)) * 0.6;
        ctx.save();
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.quadraticCurveTo(-22, -10, -35, 0);
        ctx.strokeStyle = '#0066FF';
        ctx.lineWidth = 2.0;
        ctx.stroke();

        // Peacock eyespot
        ctx.fillStyle = '#00E676';
        ctx.beginPath();
        ctx.arc(-35, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0066FF';
        ctx.beginPath();
        ctx.arc(-35, 0, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();

      // Peacock body
      ctx.fillStyle = selectedSkin.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, player.radius + 1, player.radius - 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Peacock crest
      ctx.strokeStyle = selectedSkin.color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(8, -8);
      ctx.lineTo(11, -15);
      ctx.stroke();
      ctx.fillStyle = '#00E676';
      ctx.beginPath();
      ctx.arc(11, -15, 2, 0, Math.PI * 2);
      ctx.fill();

      // Eye & Beak
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(8, -3, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.moveTo(14, -2);
      ctx.lineTo(21, 1);
      ctx.lineTo(14, 3);
      ctx.closePath();
      ctx.fill();

      // Wings
      ctx.save();
      ctx.rotate(player.wingAngle);
      ctx.fillStyle = '#00E676';
      ctx.beginPath();
      ctx.moveTo(-4, 0);
      ctx.bezierCurveTo(-12, -10, -6, -28, 4, -25);
      ctx.bezierCurveTo(0, -10, 1, -4, -4, 0);
      ctx.fill();
      ctx.restore();

    } else if (selectedSkin.type === 'sparrow') {
      // Kuruvi (Sparrow) - Small body, very cute
      ctx.fillStyle = selectedSkin.color;
      ctx.beginPath();
      ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
      ctx.fill();

      // Cute details
      ctx.fillStyle = '#5d4037';
      ctx.beginPath();
      ctx.arc(-3, -2, player.radius - 2, -0.5, 1.2);
      ctx.fill();

      // Beak & Eye
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.moveTo(player.radius - 4, -1);
      ctx.lineTo(player.radius + 3, 1);
      ctx.lineTo(player.radius - 4, 3);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(4, -3, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Tail
      ctx.strokeStyle = selectedSkin.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-8, 2);
      ctx.lineTo(-20, 5);
      ctx.moveTo(-8, -2);
      ctx.lineTo(-20, -1);
      ctx.stroke();

      // Wings flapping
      ctx.save();
      ctx.rotate(player.wingAngle * 1.3);
      ctx.fillStyle = selectedSkin.trailColor;
      ctx.beginPath();
      ctx.moveTo(-2, 0);
      ctx.bezierCurveTo(-8, -8, -4, -20, 2, -18);
      ctx.bezierCurveTo(0, -8, 1, -4, -2, 0);
      ctx.fill();
      ctx.restore();

    } else if (selectedSkin.type === 'yali') {
      // Yali Spirit Bird - Crested lion-head/dragon aesthetic with fiery sparks
      const rGrad = safeRadialGradient(ctx, 0, 0, 1, 0, 0, player.radius);
      rGrad.addColorStop(0, '#ffffff');
      rGrad.addColorStop(0.3, selectedSkin.color);
      rGrad.addColorStop(1, 'rgba(224,64,251,0)');
      ctx.fillStyle = rGrad;
      ctx.beginPath();
      ctx.arc(0, 0, player.radius + 6, 0, Math.PI * 2);
      ctx.fill();

      // Draw Yali horn/crest
      ctx.strokeStyle = '#FF3D00';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(5, -8);
      ctx.quadraticCurveTo(12, -18, 18, -12);
      ctx.stroke();

      // Main Head body
      ctx.fillStyle = selectedSkin.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, player.radius, player.radius - 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Glowing red eyes
      ctx.fillStyle = '#FF3D00';
      ctx.shadowColor = '#FF3D00';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(6, -3, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Tail spikes
      ctx.fillStyle = '#FF3D00';
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(-22, -6);
      ctx.lineTo(-17, 0);
      ctx.lineTo(-22, 6);
      ctx.closePath();
      ctx.fill();

      // Spectral wings
      ctx.save();
      ctx.rotate(player.wingAngle);
      ctx.fillStyle = 'rgba(255, 61, 0, 0.7)';
      ctx.beginPath();
      ctx.moveTo(-2, 0);
      ctx.bezierCurveTo(-10, -12, -5, -28, 5, -22);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  };

  const drawParticles = (ctx: CanvasRenderingContext2D) => {
    stateRef.current.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      
      if (p.glow) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
      }

      if (p.isFeather) {
        // Draw an ultra-detailed, hyper-realistic Peacock Feather with iridescent "Eye"
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle || 0);
        
        // Colors for the iridescent peacock eye
        const colorStem = '#ffffff';
        const colorVanes1 = '#0066cc'; // Deep Blue
        const colorVanes2 = '#00a86b'; // Emerald Green
        const colorEyeOuter = '#ffd700'; // Golden Bronze
        const colorEyeMiddle = '#00ffcc'; // Turquoise
        const colorEyeInner = '#000080'; // Navy Blue
        const colorEyeSparkle = '#ffffff';

        // Main spine/quill with subtle curve
        ctx.strokeStyle = colorStem;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-p.radius, 0);
        ctx.quadraticCurveTo(0, -p.radius / 5, p.radius, 0);
        ctx.stroke();

        // Detailed Vanes with gradient transitions
        for (let i = -p.radius; i < p.radius; i += 0.8) {
          const t = (i + p.radius) / (2 * p.radius);
          const length = p.radius * 0.9 * Math.sin(t * Math.PI);
          
          // Interpolate color between blue and green
          ctx.strokeStyle = t < 0.5 ? colorVanes1 : colorVanes2;
          ctx.lineWidth = 0.4;
          
          ctx.beginPath();
          ctx.moveTo(i, 0);
          // Angle vanes back slightly
          ctx.lineTo(i - p.radius * 0.15, -length);
          ctx.moveTo(i, 0);
          ctx.lineTo(i - p.radius * 0.15, length);
          ctx.stroke();
        }

        // The iconic "Peacock Eye" pattern near the tip
        ctx.save();
        ctx.translate(p.radius * 0.65, 0);
        
        // 1. Bronze/Gold Outer Ring
        ctx.fillStyle = colorEyeOuter;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.radius * 0.35, p.radius * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 2. Turquoise Inner Ring
        ctx.fillStyle = colorEyeMiddle;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.radius * 0.22, p.radius * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 3. Deep Navy Core
        ctx.fillStyle = colorEyeInner;
        ctx.beginPath();
        ctx.ellipse(1, 0, p.radius * 0.15, p.radius * 0.18, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 4. Iridescent Highlight
        ctx.fillStyle = colorEyeSparkle;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(-2, -2, p.radius * 0.05, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
  };

  const drawWeatherParticles = (ctx: CanvasRenderingContext2D) => {
    stateRef.current.weatherParticles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      
      if (p.glow) {
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
      }

      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  };

  const drawLightningStrike = (ctx: CanvasRenderingContext2D) => {
    const { lightningStrike } = stateRef.current;
    if (!lightningStrike) return;

    ctx.save();
    ctx.strokeStyle = '#e0f7fa';
    ctx.lineWidth = 3.5;
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#00e5ff';

    ctx.beginPath();
    lightningStrike.branches.forEach(b => {
      ctx.moveTo(b.sx, b.sy);
      ctx.lineTo(b.ex, b.ey);
    });
    ctx.stroke();

    // Secondary core branch
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    lightningStrike.branches.forEach(b => {
      ctx.moveTo(b.sx, b.sy);
      ctx.lineTo(b.ex, b.ey);
    });
    ctx.stroke();

    ctx.restore();
  };

  const drawOverlayFeedback = (ctx: CanvasRenderingContext2D, dim: typeof stateRef.current.dimensions) => {
    // Cinematic Boss Intro Theatrical Overlay
    if (stateRef.current.bossIntroActive) {
      const introTimer = stateRef.current.bossIntroTimer;
      const introMax = stateRef.current.bossIntroMax;
      
      // Slide animation factor (0.0 to 1.0)
      let slideFactor = 1.0;
      if (introTimer > introMax - 30) {
        // Sliding in over 30 frames
        slideFactor = (introMax - introTimer) / 30;
      } else if (introTimer < 30) {
        // Sliding out over 30 frames
        slideFactor = introTimer / 30;
      }
      
      const barHeight = 55 * slideFactor;
      
      ctx.save();
      ctx.fillStyle = '#000000';
      // Top bar
      ctx.fillRect(0, 0, dim.width, barHeight);
      // Bottom bar
      ctx.fillRect(0, dim.height - barHeight, dim.width, barHeight);
      ctx.restore();

      // Text fade alpha
      let textAlpha = 0;
      if (introTimer > introMax - 45) {
        textAlpha = (introMax - introTimer) / 45;
      } else if (introTimer < 45) {
        textAlpha = introTimer / 45;
      } else {
        textAlpha = 1.0;
      }

      if (textAlpha > 0.05) {
        ctx.save();
        ctx.globalAlpha = textAlpha;
        
        // Center point
        const cx = dim.width / 2;
        const cy = dim.height / 2;
        
        // Draw subtle glowing overlay backdrop behind text
        const bannerGrad = ctx.createLinearGradient(0, cy - 100, 0, cy + 100);
        bannerGrad.addColorStop(0, 'rgba(10, 5, 5, 0.0)');
        bannerGrad.addColorStop(0.3, 'rgba(12, 4, 3, 0.85)');
        bannerGrad.addColorStop(0.7, 'rgba(12, 4, 3, 0.85)');
        bannerGrad.addColorStop(1, 'rgba(10, 5, 5, 0.0)');
        ctx.fillStyle = bannerGrad;
        ctx.fillRect(0, cy - 100, dim.width, 200);
        
        // Draw a golden thin divider line at top and bottom of banner
        ctx.strokeStyle = 'rgba(255, 204, 51, 0.35)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(dim.width * 0.1, cy - 90);
        ctx.lineTo(dim.width * 0.9, cy - 90);
        ctx.moveTo(dim.width * 0.1, cy + 90);
        ctx.lineTo(dim.width * 0.9, cy + 90);
        ctx.stroke();
        
        // 1. Draw the beautiful dynamic Vector Insignia for the land
        const land = stateRef.current.currentLand;
        drawLandInsignia(ctx, cx, cy - 45, 50, land);
        
        // Get the land-specific titles and bilingual texts
        let titleTamil = "";
        let titleEnglish = "";
        let subtitleTamil = "";
        let loreEnglish = "";
        
        if (land === WeatherType.KURINJI) {
          titleTamil = "மலைக் காவல் தெய்வம்: யாழி";
          titleEnglish = "KURINJI GUARDIAN: SACRED MOUNTAIN YALI";
          subtitleTamil = "குறிஞ்சித் தினை - பனிமூடிய மலைகளின் பாதுகாவலர்";
          loreEnglish = "The ancient lion-faced protector of the misty peaks has been corrupted by dark shadows. Cleanse its spirit!";
        } else if (land === WeatherType.MULLAI) {
          titleTamil = "காட்டுக் காவல் தெய்வம்: பெரும் பாம்பு";
          titleEnglish = "MULLAI GUARDIAN: MYSTIC FOREST SERPENT";
          subtitleTamil = "முல்லைத் தினை - அடர்ந்த காடுகளின் காவலர்";
          loreEnglish = "The giant serpent guardian coiled deep within the dense woodlands rises. Guide its wild spirit back to the light!";
        } else if (land === WeatherType.MARUTHAM) {
          titleTamil = "நிலக் காவல் தெய்வம்: சீறும் காளை";
          titleEnglish = "MARUTHAM GUARDIAN: RAGING FIELD BULL";
          subtitleTamil = "மருதத் தினை - பொன்வயல்களின் தாரகைக் காவலர்";
          loreEnglish = "The mighty protector of the golden paddy fields stomps in fury. Pacify its heavy earth spirit!";
        } else if (land === WeatherType.NEITHAL) {
          titleTamil = "கடல் காவல் தெய்வம்: பெருநாகம்";
          titleEnglish = "NEITHAL GUARDIAN: DEEP SEA TEMPEST DRAGON";
          subtitleTamil = "நெய்தல் தினை - ஆழ்கடலின் அலைமுகட்டுக் காவலர்";
          loreEnglish = "From the crashing waves of the deep ocean rises the ancient storm serpent. Calibrate its ocean currents!";
        } else { // PALAI
          titleTamil = "பாலைவனக் காவல் தெய்வம்: மணல் பேய்";
          titleEnglish = "PALAI GUARDIAN: SCORCHED DESERT DEMON";
          subtitleTamil = "பாலைத் தினை - சுட்டெரிக்கும் மணற்பரப்பின் நெருப்புக் காவலர்";
          loreEnglish = "Formed of scorching winds and burning sand, the fire demon rises. Cool down its fiery furnace!";
        }
        
        // 2. Tamil Land Name Title (Elegant Script font)
        ctx.font = 'bold 24px "Mukta Malar", "Latha", "Tamil", serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#ff6a00';
        ctx.shadowBlur = 10;
        ctx.fillText(titleTamil, cx, cy + 10);
        
        // Subtitle Tamil (Poetic)
        ctx.font = '500 12px "Mukta Malar", serif';
        ctx.fillStyle = '#ffb080';
        ctx.shadowBlur = 0;
        ctx.fillText(subtitleTamil, cx, cy + 28);
        
        // 3. English Boss Name
        ctx.font = '900 13px "Space Grotesk", sans-serif';
        ctx.fillStyle = '#ffcc33';
        ctx.fillText(titleEnglish, cx, cy + 50);
        
        // 4. Lore Subtitle (English)
        ctx.font = 'italic 10px "Inter", sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.fillText(loreEnglish, cx, cy + 68);
        
        ctx.restore();
      }
    }

    // 0. Temple Restoration Progress bar at the top center
    ctx.save();
    const currentScoreVal = stateRef.current.currentScore;
    const restorationPercent = Math.min(100, currentScoreVal * 2);
    
    const barW = 200;
    const barH = 6;
    const barX = dim.width / 2 - barW / 2;
    const barY = 32;

    // Draw background bar
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.strokeStyle = 'rgba(255, 204, 51, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 3);
    ctx.fill();
    ctx.stroke();

    // Draw filled restoration bar
    if (restorationPercent > 0) {
      const fillW = (restorationPercent / 100) * barW;
      const barGrad = ctx.createLinearGradient(barX, barY, barX + fillW, barY);
      barGrad.addColorStop(0, '#ff6600');
      barGrad.addColorStop(1, '#ffcc33');
      
      ctx.fillStyle = barGrad;
      ctx.shadowColor = '#ffcc33';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.roundRect(barX, barY, fillW, barH, 3);
      ctx.fill();
    }

    // Deactivated HUD label
    /*
    ctx.font = 'bold 9px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#ffcc33';
    ctx.textAlign = 'center';
    ctx.fillText(`TEMPLE RESTORATION: ${restorationPercent}%`, dim.width / 2, barY - 6);
    */
    ctx.restore();

    // 1. Draw Near Miss text overlays
    stateRef.current.nearMissAlerts.forEach(alert => {
      ctx.save();
      const isTamil = alert.isTamil || false;
      const baseScale = alert.sizeScale || 1.0;
      const animScale = alert.scale !== undefined ? alert.scale : 1.0;
      const scale = baseScale * animScale;
      
      ctx.translate(alert.x, alert.y);
      ctx.scale(scale, scale);
      
      // Beautiful typography choice depending on script
      ctx.font = isTamil 
        ? `bold 23px "Mukta Malar", "Latha", "Tamil", serif` 
        : `black 19px "Space Grotesk", "Segoe UI", "Inter", sans-serif`;
      
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Black background outline text stroke for extreme readability
      ctx.strokeStyle = `rgba(0, 0, 0, ${Math.min(1, alert.alpha * 0.9)})`;
      ctx.lineWidth = isTamil ? 6 : 5;
      ctx.lineJoin = 'round';
      ctx.miterLimit = 2;
      ctx.strokeText(alert.text, 0, 0);

      // Deep fiery golden neon inner glow
      const customColor = alert.customColor || '#ff6a00';
      ctx.shadowColor = customColor;
      ctx.shadowBlur = 15;
      
      // Gradient fill for fire theme
      const textGrad = ctx.createLinearGradient(0, -10, 0, 10);
      textGrad.addColorStop(0, `rgba(255, 255, 255, ${Math.min(1, alert.alpha)})`);
      if (alert.customColor) {
        // Hex helper
        const parseHexToRgb = (hex: string) => {
          const h = hex.replace('#', '');
          const r = parseInt(h.substring(0, 2), 16) || 255;
          const g = parseInt(h.substring(2, 4), 16) || 106;
          const b = parseInt(h.substring(4, 6), 16) || 0;
          return `${r}, ${g}, ${b}`;
        };
        textGrad.addColorStop(1, `rgba(${parseHexToRgb(customColor)}, ${Math.min(1, alert.alpha)})`);
      } else {
        textGrad.addColorStop(0.3, `rgba(255, 204, 51, ${Math.min(1, alert.alpha)})`);
        textGrad.addColorStop(1, `rgba(255, 106, 0, ${Math.min(1, alert.alpha)})`);
      }
      
      ctx.fillStyle = textGrad;
      ctx.fillText(alert.text, 0, 0);
      ctx.restore();
    });

    // 1.5 Agni Rage fiery vignette overlay (deep blazing crimson and orange pulse)
    if (stateRef.current.rageActive) {
      ctx.save();
      const pulse = Math.sin(stateRef.current.frameCount * 0.15) * 0.12;
      const alpha = 0.32 + pulse;
      if (dim.width <= 0 || dim.height <= 0) return;
      const grad = safeRadialGradient(ctx, dim.width / 2, dim.height / 2, dim.width / 3, dim.width / 2, dim.height / 2, dim.width / 2);
      grad.addColorStop(0, 'rgba(255, 30, 0, 0)');
      grad.addColorStop(0.6, 'rgba(255, 60, 0, 0.1)');
      grad.addColorStop(1, `rgba(215, 0, 30, ${alpha})`);
      
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, dim.width, dim.height);
      
      // Draw flashing heat distortion lines or flame elements
      ctx.fillStyle = 'rgba(255, 204, 51, 0.12)';
      const randLines = 3;
      for (let l = 0; l < randLines; l++) {
        const hY = Math.random() * dim.height;
        ctx.fillRect(0, hY, dim.width, 2 + Math.random() * 4);
      }
      ctx.restore();
    }

    // 2. Slow motion subtle overlay vignette (cool blue)
    if (stateRef.current.timeScale < 0.9 && !stateRef.current.rageActive) {
      ctx.save();
      if (dim.width <= 0 || dim.height <= 0) return;
      const grad = safeRadialGradient(ctx, dim.width / 2, dim.height / 2, dim.width / 4, dim.width / 2, dim.height / 2, dim.width / 2);
      grad.addColorStop(0, 'rgba(0, 229, 255, 0)');
      grad.addColorStop(1, `rgba(0, 229, 255, ${0.15 * (1 - stateRef.current.timeScale)})`);
      
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, dim.width, dim.height);
      ctx.restore();
    }

    // 3. Autopilot Tutorial HUD Overlay (ZEN amber/dark blend)
    if (stateRef.current.autoPilotTimeLeft > 0) {
      const leftSec = stateRef.current.autoPilotTimeLeft;
      ctx.save();
      
      // Translucent cinematic overlay backdrop
      ctx.fillStyle = 'rgba(10, 7, 5, 0.45)';
      ctx.fillRect(0, 0, dim.width, dim.height);
      
      ctx.textAlign = 'center';
      
      // Giant display heading with a subtle glow shadow
      ctx.font = 'bold 36px "Space Grotesk", "Segoe UI", "Inter", sans-serif';
      ctx.shadowColor = '#ff5722';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#ffcc33';
      ctx.fillText('தட்டவும் பறக்க!', dim.width / 2, dim.height / 2 - 30);

      // Subtitle
      ctx.font = '600 16px "Inter", sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.shadowBlur = 0;
      ctx.fillText('TAP TO FLY!', dim.width / 2, dim.height / 2 + 15);

      // Beautiful progress notification indicator
      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      ctx.fillStyle = '#ffcc33';
      ctx.fillText('DIVINE PROTECTION ACTIVE', dim.width / 2, dim.height / 2 + 45);
      
      ctx.font = '500 11px "Inter", sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fillText(`SAFE FLIGHT COMMENCES IN: ${leftSec.toFixed(1)}s`, dim.width / 2, dim.height / 2 + 65);

      // Radial timer ring below text
      ctx.strokeStyle = 'rgba(255, 204, 51, 0.2)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(dim.width / 2, dim.height / 2 + 95, 14, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#ffcc33';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(dim.width / 2, dim.height / 2 + 95, 14, -Math.PI / 2, -Math.PI / 2 + (leftSec / 3.0) * Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    }

    // 4. Render Red/White Screen Flash on collision
    if (stateRef.current.screenFlashAlpha > 0) {
      ctx.save();
      ctx.fillStyle = `rgba(255, 50, 0, ${stateRef.current.screenFlashAlpha})`;
      ctx.fillRect(0, 0, dim.width, dim.height);
      ctx.restore();
      // Decay alpha
      stateRef.current.screenFlashAlpha -= 0.04 * (stateRef.current.timeScale || 1.0);
    }

    // Deactivated legacy HUD
    if (false) {
      const leftSec = stateRef.current.autoPilotTimeLeft;
      ctx.save();
      
      // High-contrast, sleek translucent overlay backdrop
      ctx.fillStyle = 'rgba(10, 7, 5, 0.65)';
      ctx.fillRect(0, 0, dim.width, dim.height);
      
      // Glowing aesthetic golden border frame
      ctx.strokeStyle = 'rgba(255, 204, 51, 0.4)';
      ctx.lineWidth = 4;
      ctx.strokeRect(12, 12, dim.width - 24, dim.height - 24);

      ctx.textAlign = 'center';
      
      // Giant display heading with a subtle glow shadow
      ctx.font = 'bold 26px "Space Grotesk", "Segoe UI", "Inter", sans-serif';
      ctx.shadowColor = '#ffcc33';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#ffcc33';
      ctx.fillText('AUTOPILOT DEMO MODE', dim.width / 2, dim.height / 2 - 45);

      // Tamil flavor translation
      ctx.font = '500 18px "Segoe UI", sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.shadowBlur = 0;
      ctx.fillText('தானியங்கி பறக்கும் முறை - கவனித்து கற்கவும்', dim.width / 2, dim.height / 2 - 10);

      // Ticking countdown
      ctx.font = 'bold 15px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillText(`MANUAL CONTROL IN: ${leftSec.toFixed(1)}s`, dim.width / 2, dim.height / 2 + 30);

      // Beautiful fluid visual progress bar
      const barW = 240;
      const barH = 6;
      const barX = (dim.width - barW) / 2;
      const barY = dim.height / 2 + 50;
      
      // Progress track
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(barX, barY, barW, barH);
      
      // Progress fill
      ctx.fillStyle = '#ffcc33';
      ctx.fillRect(barX, barY, barW * (leftSec / 5.0), barH);

      // Explanatory Subtitles
      ctx.font = 'italic 12px "Inter", sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fillText('Bird flies by itself to demonstrate altitude & glide rhythms.', dim.width / 2, dim.height / 2 + 85);
      ctx.fillText('Press SPACE, UP, or CLICK to flap wings once play begins.', dim.width / 2, dim.height / 2 + 105);

      ctx.restore();
    }
  };

  return (
    <div 
      className={`relative w-full h-full flex flex-col justify-between font-serif select-none touch-none ${cssShake ? 'camera-shake-active' : ''}`} 
      ref={containerRef} 
      id="game_frame"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <style>{`
        @keyframes camera-shake {
          0% { transform: translate(0, 0); }
          10% { transform: translate(-3px, -2px) rotate(-0.5deg); }
          20% { transform: translate(2px, -1px) rotate(0.5deg); }
          30% { transform: translate(-1px, 2px) rotate(0deg); }
          40% { transform: translate(1px, -1px) rotate(-0.5deg); }
          50% { transform: translate(-2px, 1px) rotate(0.5deg); }
          60% { transform: translate(2px, 2px) rotate(0deg); }
          70% { transform: translate(-1px, -1px) rotate(-0.5deg); }
          80% { transform: translate(1px, 1px) rotate(0.5deg); }
          90% { transform: translate(-2px, -1px) rotate(0deg); }
          100% { transform: translate(0, 0); }
        }
        .camera-shake-active {
          animation: camera-shake 0.4s ease-in-out;
        }
      `}</style>
      {/* 2D CANVAS WINDOW */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="w-full h-full cursor-pointer bg-black block select-none touch-none overscroll-none"
        id="arc_game_canvas"
      />

      {/* BOSS INCOMING STATUS BAR (Bottom Center) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center pointer-events-none z-20 gap-1.5">
        
        {((isStoryMode && bossDistance !== null && bossDistance <= 120) || (!isStoryMode && bossDistance !== null && bossDistance <= 25)) && (
          <div className="bg-red-950/90 backdrop-blur-md border border-red-500/50 px-3 py-1 rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.4)] text-center flex items-center gap-2 animate-bounce">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-[9.5px] font-mono text-red-200 font-bold tracking-widest uppercase">
              ⚠️ WARNING: CHIEF ASURA INCOMING!
            </span>
          </div>
        )}

        <div className="bg-[#120f08]/90 border border-[#ffcc33]/40 rounded-full py-1.5 px-5 flex items-center justify-center gap-3 shadow-[0_0_15px_rgba(255,204,51,0.2)] pointer-events-auto backdrop-blur-sm">
          <span className="text-[10px] font-bold text-[#ffcc33] tracking-[0.15em] uppercase">BOSS INCOMING</span>
          
          <div className="flex items-center gap-1.5 relative w-24 sm:w-32 h-2">
            {/* The dotted path */}
            <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 border-t border-dotted border-white/40" />
            
            {/* Animated player node */}
            <div 
              className="absolute w-4 h-4 rounded-full bg-[#ffcc33] shadow-[0_0_8px_rgba(255,204,51,0.6)] top-1/2 -translate-y-1/2 transition-all duration-300"
              style={{
                left: `${bossDistance !== null ? Math.max(0, Math.min(85, 85 - (isStoryMode ? (bossDistance * 0.4) : (bossDistance * 0.25)))) : 0}%` 
              }}
            />

            {/* Boss node at the right end */}
            <div className="absolute right-0 w-4 h-4 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.6)] top-1/2 -translate-y-1/2" />
          </div>

          <span className="text-[10px] font-mono font-bold text-red-500 w-16 text-right">
            {bossDistance !== null ? (isStoryMode ? `${Math.floor(bossDistance)}m` : `${Math.floor(bossDistance / 60)}m ${Math.floor(bossDistance % 60)}s`) : '--m --s'}
          </span>
        </div>
      </div>

      {/* FLOATING ACTION HUD METERS */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none select-none z-20 font-sans">
        
        {/* Score & Multiplier */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-[#ffcc33]/25 shadow-lg text-white">
            <div className="text-xs font-mono text-[#ffcc33]/80 tracking-wider flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 animate-pulse text-[#ffcc33]" />
              SOUL FLIGHT SCORE
            </div>
            <div className="text-2xl font-black font-serif text-[#ffcc33] tracking-normal">
              {score}
            </div>
          </div>

          {/* Sacred Lives System (Hearts HUD) */}
          <div className="flex flex-col gap-1 bg-black/60 backdrop-blur-md px-3.5 py-2 rounded-xl border border-red-500/25 shadow-lg text-white">
            <div className="text-[10px] font-mono text-red-400 tracking-wider flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" />
              SACRED LIVES
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              {Array.from({ length: Math.ceil(Math.max(3, lives)) }).map((_, index) => {
                const isFull = index < Math.floor(lives);
                const isHalf = index === Math.floor(lives) && lives % 1 !== 0;
                
                return (
                  <div key={index} className="relative w-5 h-5 flex items-center justify-center">
                    {isFull ? (
                      <Heart className="w-5 h-5 text-red-500 fill-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.85)]" />
                    ) : isHalf ? (
                      <div className="relative w-5 h-5 overflow-hidden">
                        <Heart className="absolute top-0 left-0 w-5 h-5 text-red-500/30" />
                        <div className="absolute top-0 left-0 w-2.5 h-5 overflow-hidden">
                          <Heart className="w-5 h-5 text-red-500 fill-red-500 drop-shadow-[0_0_6px_rgba(239,68,68,0.85)] max-w-none" />
                        </div>
                      </div>
                    ) : (
                      <Heart className="w-5 h-5 text-red-500/20" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Agni Rage Meter */}
          <div className="flex flex-col gap-1 bg-black/60 backdrop-blur-md px-3 py-2 rounded-xl border border-red-500/25 shadow-lg text-white">
            <div className="text-[10px] font-mono text-red-400 tracking-wider flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-red-500 animate-pulse" />
              {isRageActive ? 'AGNI RAGE!' : 'AGNI CHARGE'}
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-16 bg-slate-800 h-2.5 rounded-full overflow-hidden border border-red-500/20">
                <div 
                  className={`h-full transition-all duration-150 ${isRageActive ? 'bg-gradient-to-r from-red-600 to-yellow-400 animate-pulse' : 'bg-red-500'}`} 
                  style={{ width: `${Math.round(rageCharge)}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-slate-300">{Math.round(rageCharge)}%</span>
            </div>
          </div>

          {/* AI Performance Rating Badges */}
          <div className="hidden sm:flex flex-col gap-1 bg-black/60 backdrop-blur-md px-3 py-2 rounded-xl border border-purple-500/25 shadow-lg text-white">
            <div className="text-[9px] font-mono text-purple-400 tracking-wider">
              DIVINE PATHWAY
            </div>
            <div className={`text-[11px] font-bold tracking-wide ${
              aiRating === 'WRATH OF AGNI' ? 'text-red-400 animate-pulse font-serif' :
              aiRating === 'SPIRIT DESTINY' ? 'text-cyan-400 font-serif' :
              aiRating === 'COMPASSIONATE SPIRIT' ? 'text-emerald-400 font-serif' : 'text-slate-300 font-serif'
            }`}>
              {aiRating}
            </div>
          </div>

          {/* Current Weather Phase Badge */}
          <div className="hidden md:flex flex-col gap-1 bg-black/60 backdrop-blur-md px-3 py-2 rounded-xl border border-yellow-500/25 shadow-lg text-white">
            <div className="text-[9px] font-mono text-yellow-500/80 tracking-wider">
              SKY PHASE
            </div>
            <div className="text-[11px] font-bold text-yellow-400 font-serif">
              {weatherPhase}
            </div>
          </div>
        </div>

        {/* Combo multipliers overlay */}
        {combo > 1 && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1 pointer-events-none text-center">
            <div className="font-sans font-black text-2xl sm:text-4xl text-yellow-400 drop-shadow-[0_2px_10px_rgba(255,102,0,0.9)] tracking-widest uppercase animate-pulse">
              🔥 {combo} STREAK
            </div>
            <div className="font-sans font-black text-[10px] sm:text-xs text-orange-400 tracking-widest uppercase drop-shadow-[0_1.5px_4px_rgba(0,0,0,0.9)]">
              {(combo >= 15 ? 5 : (combo >= 10 ? 3 : (combo >= 5 ? 2 : 1)))}X MULTIPLIER
            </div>
          </div>
        )}

        {/* Top Control Overlay buttons */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Pause Resume */}
          <button
            onClick={handlePauseToggle}
            className="w-10 h-10 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-[#ffcc33]/30 hover:border-[#ffcc33]/60 text-white flex items-center justify-center transition shadow-md pointer-events-auto cursor-pointer"
            title="Pause / Resume"
            id="pause_hud_btn"
          >
            {isGamePaused ? <Play className="w-4 h-4 text-[#ffcc33] fill-[#ffcc33]" /> : <Pause className="w-4 h-4 text-[#ffcc33] fill-[#ffcc33]" />}
          </button>

          {/* Quick Restart */}
          <button
            onClick={handleRestart}
            className="w-10 h-10 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-[#ffcc33]/30 hover:border-[#ffcc33]/60 text-white flex items-center justify-center transition shadow-md pointer-events-auto cursor-pointer"
            title="Restart Run"
            id="restart_hud_btn"
          >
            <RotateCcw className="w-4 h-4 text-[#ffcc33]" />
          </button>
        </div>
      </div>

      {/* SHRINE ASCENSION UI BLOCK - REMOVED AS REQUESTED */}
      {/* 
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none text-center z-10 select-none">
        <div className="text-[14px] sm:text-[16px] font-black tracking-[0.25em] text-[#ffcc33] font-serif drop-shadow-[0_2px_8px_rgba(255,204,51,0.5)] uppercase">
          SHRINE ASCENSION
        </div>
        <div className="text-[8px] sm:text-[9px] font-mono font-bold tracking-[0.2em] text-slate-300 mt-0.5 uppercase">
          [ * PATH PROGRESSION * ]
        </div>
        <div className="text-[10px] sm:text-[11px] font-medium tracking-wider text-amber-200 mt-0.5 font-serif">
          தெய்வீக பயணம் <span className="text-slate-400 font-sans text-[9px] sm:text-[10px]">(Divine Journey)</span>
        </div>
      </div>
      */}

      {/* MILESTONE NOTIFICATION (Moved to lower area with glass tile styling and drifting motion) */}
      {milestoneNotification && (
        <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 z-[100] pointer-events-none select-none flex flex-col items-center justify-center animate-mystic-drift">
          <div className="text-center bg-white/10 backdrop-blur-xl px-8 py-5 rounded-[2rem] border border-white/20 shadow-[0_15px_35px_rgba(0,0,0,0.5)] flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col text-left">
              <div className="text-[14px] sm:text-[18px] font-sans font-black text-white tracking-[0.2em] uppercase drop-shadow-md">
                {milestoneNotification.label}
              </div>
              <div className="text-[10px] sm:text-[12px] font-sans text-white/70 font-bold uppercase tracking-widest mt-0.5">
                {milestoneNotification.labelTamil}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-4 left-4 flex flex-col gap-2 pointer-events-none select-none z-20 font-sans">
        {activeGoldenAura && (
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md border border-yellow-500/40 px-3 py-1.5 rounded-lg text-yellow-200 text-xs shadow-[0_0_12px_rgba(255,215,0,0.2)] animate-pulse">
            <Sparkles className="w-4 h-4 text-yellow-400 fill-yellow-400/20" />
            <span>Golden Aura Shield: <strong>{goldenAuraTimer}s</strong></span>
          </div>
        )}

        {activeTimeWarp && (
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md border border-cyan-500/40 px-3 py-1.5 rounded-lg text-cyan-200 text-xs shadow-[0_0_12px_rgba(0,229,255,0.2)] animate-pulse">
            <Timer className="w-4 h-4 text-cyan-400" />
            <span>Time Warp: <strong>{timeWarpTimer}s</strong></span>
          </div>
        )}

        {activeShield && (
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md border border-amber-500/35 px-3 py-1.5 rounded-lg text-amber-200 text-xs shadow-md animate-pulse">
            <Shield className="w-4 h-4 text-amber-400 fill-amber-400/20" />
            <span>Shield: <strong>{shieldTimer}s</strong></span>
          </div>
        )}

        {activeSlowMo && (
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md border border-cyan-500/35 px-3 py-1.5 rounded-lg text-cyan-200 text-xs shadow-md animate-pulse">
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>Chrono Warp: <strong>{slowMoTimer}s</strong></span>
          </div>
        )}

        {activeDoubleScore && (
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md border border-purple-500/35 px-3 py-1.5 rounded-lg text-purple-200 text-xs shadow-md animate-pulse">
            <Compass className="w-4 h-4 text-purple-400" />
            <span>2X Lotus Bless: <strong>{doubleScoreTimer}s</strong></span>
          </div>
        )}

        {activeBoost && (
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md border border-[#ff3300]/35 px-3 py-1.5 rounded-lg text-red-200 text-xs shadow-md animate-pulse">
            <Flame className="w-4 h-4 text-red-400 fill-red-400/20" />
            <span>Vedic Boost: <strong>{boostTimer}s</strong></span>
          </div>
        )}
      </div>

      
      {/* BOSS POWER BUTTON */}
      {stateRef.current?.boss?.active && (
        <div className="absolute bottom-24 right-8 z-50">
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-1">
              {[1, 2, 3].map((f) => (
                <div key={f} className={`w-4 h-4 rounded-full border-2 ${bossPowerFeathers >= f ? 'bg-yellow-400 border-yellow-200 shadow-[0_0_10px_#ffd700]' : 'bg-black/50 border-gray-600'}`} />
              ))}
            </div>
            {bossPowerFeathers >= 3 && !isBossPowerActive && (
              <button 
                onClick={(e) => { e.stopPropagation(); activateBossPower(); }}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-yellow-500 rounded-xl font-bold text-white shadow-[0_0_20px_#ff0000] animate-pulse uppercase tracking-wider border-2 border-white/50"
              >
                UNLEASH POWER
              </button>
            )}
          </div>
        </div>
      )}

      {/* BIG INNER PAUSE BOARD */}
      {isGamePaused && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-40 select-none animate-fade-in" id="pause_overlay">
          <div className="bg-black/75 border-2 border-[#ffcc33]/25 p-8 rounded-3xl shadow-2xl max-w-sm w-full mx-4 text-center font-serif">
            <h2 className="text-2xl font-black font-serif text-[#ffcc33] uppercase tracking-wider flex items-center justify-center gap-2">
              <Compass className="w-6 h-6 text-[#ffcc33] animate-spin-slow" />
              FLIGHT PAUSED
            </h2>
            <p className="text-xs text-slate-400 mt-2 font-sans">The sacred phoenix rests upon the temple tower gate.</p>

            <div className="mt-6 flex flex-col gap-3 font-sans">
              <button
                onClick={handlePauseToggle}
                className="w-full py-3 bg-gradient-to-r from-[#ffcc33] via-[#ff6a00] to-[#ff3300] hover:from-[#ff6a00] hover:to-[#ff3300] font-sans font-bold rounded-xl text-black shadow-lg hover:shadow-[#ff6a00]/20 transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#ffcc33]/20"
                id="resume_btn"
              >
                <Play className="w-4 h-4 fill-black text-black" />
                RESUME SOARING
              </button>

              <button
                onClick={handleRestart}
                className="w-full py-3 bg-black/60 hover:bg-black/80 border border-[#ffcc33]/30 hover:border-[#ffcc33]/55 font-sans font-medium rounded-xl text-white transition flex items-center justify-center gap-2 cursor-pointer"
                id="restart_paused_btn"
              >
                <RotateCcw className="w-4 h-4 text-[#ffcc33]" />
                RESTART FLIGHT
              </button>

              <button
                onClick={() => {
                  AudioEngine.playButton();
                  onStateChange(GameState.MENU);
                }}
                className="w-full py-3 bg-transparent hover:bg-white/5 font-sans font-medium rounded-xl text-slate-300 transition flex items-center justify-center cursor-pointer"
                id="quit_paused_btn"
              >
                RETURN TO SANCTUM
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SANCTUM BLESSING POST-BOSS UPGRADE SCREEN */}
      {showUpgradeSelection && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 select-none animate-fade-in" id="sanctum_blessing_overlay">
          <div className="bg-slate-950/95 border-2 border-[#ffcc33]/60 p-8 rounded-3xl shadow-[0_0_35px_rgba(255,204,51,0.35)] max-w-lg w-full mx-4 text-center relative overflow-hidden font-sans">
            
            {/* Background swirling ambient glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-yellow-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-red-500/10 blur-3xl pointer-events-none" />
            
            <div className="border-b border-[#ffcc33]/20 pb-4 mb-6">
              <span className="text-[10px] font-mono text-[#ffcc33] font-bold tracking-[0.3em] uppercase block mb-1">
                ✨ ASCENSION MILESTONE CLEANSED ✨
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-serif text-[#ffcc33] uppercase tracking-normal">
                SANCTUM BLESSING
              </h2>
              <div className="text-xs sm:text-sm font-medium text-amber-200 mt-1">
                தூய்மைப்படுத்தும் ஆசீர்வாதம் (Divine Upgrades)
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-6 font-sans leading-relaxed">
              Your divine service has cleansed the gateway. Select one upgrade to enhance your avatar for the journey ahead. (Max Level is 6).
            </p>

            <div className="flex flex-col gap-4">
              
              {/* Option 1: Attack Power */}
              <button
                onClick={() => {
                  const type = 'attack';
                  const nextVal = Math.min(6, upgrades[type] + 1);
                  const updated = { ...upgrades, [type]: nextVal };
                  setUpgrades(updated);
                  stateRef.current.upgrades = updated;
                  
                  setShowUpgradeSelection(false);
                  AudioEngine.playTempleBellMilestone();
                  
                  if (isStoryMode) {
                    stateRef.current.gameActive = false;
                    if (onStoryLevelComplete) {
                      onStoryLevelComplete(storyLevel, stateRef.current.feathersEarned);
                    }
                  } else {
                    stateRef.current.bossEncounterActive = false;
                    stateRef.current.bossDefeated = false;
                  }
                }}
                disabled={upgrades.attack >= 6}
                className={`w-full p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between text-left group ${
                  upgrades.attack >= 6 
                    ? 'bg-red-950/20 border-red-500/10 cursor-not-allowed opacity-50' 
                    : 'bg-black/60 hover:bg-[#ffaa00]/10 border-red-500/20 hover:border-[#ffcc33]/60 cursor-pointer shadow-md hover:shadow-[0_0_15px_rgba(255,106,0,0.15)] hover:-translate-y-0.5'
                }`}
                id="upgrade_attack_btn"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-950/40 border border-red-500/30 flex items-center justify-center text-red-400 group-hover:scale-110 transition duration-300">
                    <Flame className="w-5 h-5 fill-red-500/10" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-[#ffcc33] transition">
                      ATTACK POWER / தாக்குதல் சக்தி
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
                      {upgrades.attack === 5 ? 'AWAKENS FIERY RED FLAME AURA!' : 'Increase bolt radius and fire-damage.'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="text-[10px] font-mono text-slate-400">
                    {upgrades.attack >= 6 ? 'MAXED' : `LV. ${upgrades.attack} / 6`}
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5, 6].map((l) => (
                      <div 
                        key={l} 
                        className={`w-1.5 h-3 rounded-sm ${l <= upgrades.attack ? (l === 6 ? 'bg-red-500 animate-pulse' : 'bg-[#ffcc33]') : 'bg-slate-800'}`} 
                      />
                    ))}
                  </div>
                </div>
              </button>

              {/* Option 2: Spiritual Life */}
              <button
                onClick={() => {
                  const type = 'life';
                  const nextVal = Math.min(6, upgrades[type] + 1);
                  const updated = { ...upgrades, [type]: nextVal };
                  setUpgrades(updated);
                  stateRef.current.upgrades = updated;
                  
                  // Restore 1 life & increase max cap instantly
                  stateRef.current.player.lives = Math.min(8, stateRef.current.player.lives + 1);
                  setLives(stateRef.current.player.lives);
                  
                  setShowUpgradeSelection(false);
                  AudioEngine.playTempleBellMilestone();
                  
                  if (isStoryMode) {
                    stateRef.current.gameActive = false;
                    if (onStoryLevelComplete) {
                      onStoryLevelComplete(storyLevel, stateRef.current.feathersEarned);
                    }
                  } else {
                    stateRef.current.bossEncounterActive = false;
                    stateRef.current.bossDefeated = false;
                  }
                }}
                disabled={upgrades.life >= 6}
                className={`w-full p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between text-left group ${
                  upgrades.life >= 6 
                    ? 'bg-amber-950/20 border-amber-500/10 cursor-not-allowed opacity-50' 
                    : 'bg-black/60 hover:bg-[#ffaa00]/10 border-amber-500/20 hover:border-[#ffcc33]/60 cursor-pointer shadow-md hover:shadow-[0_0_15px_rgba(255,215,0,0.15)] hover:-translate-y-0.5'
                }`}
                id="upgrade_life_btn"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition duration-300">
                    <Heart className="w-5 h-5 fill-amber-500/10" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-[#ffcc33] transition">
                      SPIRITUAL LIFE / ஆன்மீக வாழ்க்கை
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
                      {upgrades.life === 5 ? 'AWAKENS ANGELIC GOLDEN HALO!' : 'Increase maximum life capacity & restore 1 life.'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="text-[10px] font-mono text-slate-400">
                    {upgrades.life >= 6 ? 'MAXED' : `LV. ${upgrades.life} / 6`}
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5, 6].map((l) => (
                      <div 
                        key={l} 
                        className={`w-1.5 h-3 rounded-sm ${l <= upgrades.life ? (l === 6 ? 'bg-amber-500 animate-pulse' : 'bg-[#ffcc33]') : 'bg-slate-800'}`} 
                      />
                    ))}
                  </div>
                </div>
              </button>

              {/* Option 3: Sacred Durability */}
              <button
                onClick={() => {
                  const type = 'durability';
                  const nextVal = Math.min(6, upgrades[type] + 1);
                  const updated = { ...upgrades, [type]: nextVal };
                  setUpgrades(updated);
                  stateRef.current.upgrades = updated;
                  
                  setShowUpgradeSelection(false);
                  AudioEngine.playTempleBellMilestone();
                  
                  if (isStoryMode) {
                    stateRef.current.gameActive = false;
                    if (onStoryLevelComplete) {
                      onStoryLevelComplete(storyLevel, stateRef.current.feathersEarned);
                    }
                  } else {
                    stateRef.current.bossEncounterActive = false;
                    stateRef.current.bossDefeated = false;
                  }
                }}
                disabled={upgrades.durability >= 6}
                className={`w-full p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between text-left group ${
                  upgrades.durability >= 6 
                    ? 'bg-cyan-950/20 border-cyan-500/10 cursor-not-allowed opacity-50' 
                    : 'bg-black/60 hover:bg-[#ffaa00]/10 border-cyan-500/20 hover:border-[#ffcc33]/60 cursor-pointer shadow-md hover:shadow-[0_0_15px_rgba(0,229,255,0.15)] hover:-translate-y-0.5'
                }`}
                id="upgrade_durability_btn"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition duration-300">
                    <Shield className="w-5 h-5 fill-cyan-500/10" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-[#ffcc33] transition">
                      SACRED DURABILITY / புனித ஆயுள்
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
                      {upgrades.durability === 5 ? 'AWAKENS ROTATING PLASMA FORCEFIELD!' : 'Extend protection shield time & invincibility frames.'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="text-[10px] font-mono text-slate-400">
                    {upgrades.durability >= 6 ? 'MAXED' : `LV. ${upgrades.durability} / 6`}
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5, 6].map((l) => (
                      <div 
                        key={l} 
                        className={`w-1.5 h-3 rounded-sm ${l <= upgrades.durability ? (l === 6 ? 'bg-cyan-500 animate-pulse' : 'bg-[#ffcc33]') : 'bg-slate-800'}`} 
                      />
                    ))}
                  </div>
                </div>
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
