/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useEffect } from 'react';
import { GameState, Difficulty, Skin, GameStats, WeatherType } from '../types';
import { AudioEngine } from '../audio';
import { RotateCcw, Home, Sparkles, Flame, Landmark, Feather, Trophy } from 'lucide-react';

import kurinjiBg from '../assets/images/kurinji_bg_1783843688465.jpg';
import mullaiBg from '../assets/images/mullai_bg_1783843701035.jpg';
import maruthamBg from '../assets/images/marutham_bg_1783843712358.jpg';
import neithalBg from '../assets/images/neithal_bg_1783843723561.jpg';
import palaiBg from '../assets/images/palai_bg_1783843735587.jpg';

const RealisticPeacockFeather = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 100 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="featherGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="1.2" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
      <linearGradient id="featherStem" x1="50" y1="110" x2="50" y2="10" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="1" stopColor="#e0e0e0" />
      </linearGradient>
      <radialGradient id="eyeOuter" cx="50" cy="35" r="25" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#ffd700" />
        <stop offset="1" stopColor="transparent" />
      </radialGradient>
      <radialGradient id="eyeMiddle" cx="50" cy="35" r="18" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#00ffcc" />
        <stop offset="1" stopColor="transparent" />
      </radialGradient>
      <radialGradient id="eyeInner" cx="50" cy="35" r="10" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#000080" />
        <stop offset="1" stopColor="transparent" />
      </radialGradient>
    </defs>
    
    {/* Fine Vanes */}
    {Array.from({ length: 60 }).map((_, i) => {
      const y = 15 + i * 1.5;
      const t = i / 60;
      const length = 28 * Math.sin(t * Math.PI);
      const angle = 25 + Math.sin(t * 8) * 5;
      return (
        <React.Fragment key={i}>
          <path 
            d={`M50 ${y} Q${50 - length} ${y - angle} ${50 - length - 6} ${y - angle - 10}`} 
            stroke={y < 50 ? "#ffd700" : (y < 80 ? "#00a86b" : "#0066cc")} 
            strokeWidth="0.4" 
            opacity="0.6"
          />
          <path 
            d={`M50 ${y} Q${50 + length} ${y - angle} ${50 + length + 6} ${y - angle - 10}`} 
            stroke={y < 50 ? "#ffd700" : (y < 80 ? "#00a86b" : "#0066cc")} 
            strokeWidth="0.4" 
            opacity="0.6"
          />
        </React.Fragment>
      );
    })}

    {/* Stem */}
    <path d="M50 115 Q52 60 50 10" stroke="url(#featherStem)" strokeWidth="1.2" strokeLinecap="round" />

    {/* Layered Iridescent Eye */}
    <g filter="url(#featherGlow)">
      <ellipse cx="50" cy="35" rx="15" ry="19" fill="url(#eyeOuter)" opacity="0.8" />
      <ellipse cx="50" cy="35" rx="11" ry="14" fill="url(#eyeMiddle)" opacity="0.9" />
      <ellipse cx="50" cy="35" rx="7" ry="9" fill="url(#eyeInner)" />
      <circle cx="47" cy="32" r="2.5" fill="white" fillOpacity="0.4" />
    </g>
  </svg>
);

interface GameOverPanelProps {
  score: number;
  feathersEarned: number;
  difficulty: Difficulty;
  skins: Skin[];
  stats: GameStats;
  onRestart: () => void;
  onStateChange: (state: GameState) => void;
}

export const GameOverPanel: React.FC<GameOverPanelProps> = ({
  score,
  feathersEarned,
  difficulty,
  skins,
  stats,
  onRestart,
  onStateChange,
}) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) - 0.5,
        y: (e.clientY / window.innerHeight) - 0.5,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const BACKGROUND_IMAGES = {
    [WeatherType.KURINJI]: kurinjiBg,
    [WeatherType.MULLAI]: mullaiBg,
    [WeatherType.MARUTHAM]: maruthamBg,
    [WeatherType.NEITHAL]: neithalBg,
    [WeatherType.PALAI]: palaiBg
  };

  const currentBg = BACKGROUND_IMAGES[stats.selectedWeather] || BACKGROUND_IMAGES[WeatherType.KURINJI];

  // Find the currently selected/active skin representation
  const activeSkin = skins.find(s => s.id === stats.selectedSkinId) || skins[0];

  // Find the next locked skin
  const nextSkin = useMemo(() => {
    return skins.find(s => !s.unlocked);
  }, [skins]);

  const progressPercent = useMemo(() => {
    if (!nextSkin) return 100;
    return Math.min(100, Math.round((stats.feathersCount / nextSkin.cost) * 100));
  }, [stats.feathersCount, nextSkin]);

  const handleRestartClick = () => {
    AudioEngine.playButton();
    onRestart();
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleRestartClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRestart]);

  const handleHomeClick = () => {
    AudioEngine.playButton();
    onStateChange(GameState.MENU);
  };

  const handleSkinsClick = () => {
    AudioEngine.playButton();
    onStateChange(GameState.SKINS);
  };

  const getDifficultyLabel = () => {
    switch (difficulty) {
      case Difficulty.EASY: return 'EASY MODE';
      case Difficulty.HARD: return 'HARD MODE';
      case Difficulty.IMPOSSIBLE: return 'IMPOSSIBLE MODE';
    }
  };

  // GENERATE STYLISH GRAPH POINTS REPRESENTING ALCHEMICAL SOUL RESONANCE TRACKING
  const graphPoints = useMemo(() => {
    // Generate simulated dynamic data points from high scores and current run score
    const baseKurinji = Math.min(100, Math.max(15, Math.round((stats.highScoreEasy / 12) * 100)));
    const baseMullai = Math.min(100, Math.max(10, Math.round((stats.highScoreHard / 8) * 100)));
    const baseMarutham = Math.min(100, Math.max(5, Math.round((stats.highScoreImpossible / 6) * 100)));
    const baseNeithal = Math.min(100, Math.max(20, Math.round((stats.feathersCount / 180) * 100)));
    // Palai represents our current run performance status!
    const basePalai = Math.min(100, Math.round((score / 15) * 100));

    return [
      { label: 'Kurinji', value: baseKurinji, color: '#a855f7' },
      { label: 'Mullai', value: baseMullai, color: '#10b981' },
      { label: 'Marutham', value: baseMarutham, color: '#fbbf24' },
      { label: 'Neithal', value: baseNeithal, color: '#3b82f6' },
      { label: 'Palai', value: basePalai, color: '#f97316' }
    ];
  }, [score, stats]);

  // Overall temple restoration percentage based on collective stats
  const averageRestoration = useMemo(() => {
    const total = graphPoints.reduce((sum, item) => sum + item.value, 0);
    return Math.round(total / graphPoints.length);
  }, [graphPoints]);

  const isNewHighScore = useMemo(() => {
    switch (difficulty) {
      case Difficulty.EASY: return score > stats.highScoreEasy;
      case Difficulty.HARD: return score > stats.highScoreHard;
      case Difficulty.IMPOSSIBLE: return score > stats.highScoreImpossible;
      default: return false;
    }
  }, [score, difficulty, stats]);

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 overflow-y-auto bg-transparent select-none" id="game_over_fullscreen_overlay">
      {/* Mystical Animated Background Layer (Matching Main Menu) */}
      <div 
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat transition-all duration-700 ease-out"
        style={{ 
          backgroundImage: `url(${currentBg})`,
          transform: `scale(1.15) translate(${mousePos.x * -15}px, ${mousePos.y * -15}px)`
        }}
      />
      
      {/* Overlays for depth and atmosphere */}
      <div className="fixed inset-0 -z-10 bg-black/70" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(255,165,0,0.1)_0%,transparent_70%)] animate-mystical-pulse" />

      {/* Floating Divine Dust Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-5">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute w-[2px] h-[2px] bg-amber-100 rounded-full animate-divine-float shadow-[0_0_8px_rgba(255,255,255,0.8)]"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${12 + Math.random() * 18}s`
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-md flex flex-col gap-5 relative z-10">
        
        {/* 1. Main Score Card - Glass Tile */}
        <div className="bg-white/10 backdrop-blur-[40px] border border-white/20 border-t-4 border-t-orange-500/50 rounded-[2.5rem] p-6 sm:p-10 flex flex-col items-center shadow-[0_25px_50px_-12px_rgba(0,0,0,0.9)] relative overflow-hidden group">
          {/* Internal card background image for "tile glass" effect */}
          <div 
            className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
            style={{ backgroundImage: `url('/93325456-56c4-4cd8-b284-74a38095e2f7.jpg')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
          
          {/* New High Score Badge */}
          {isNewHighScore && (
            <div className="bg-yellow-400 text-black font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-widest mb-4 shadow-[0_0_15px_rgba(250,204,21,0.5)] animate-bounce relative z-10">
              <Trophy className="w-3 h-3 inline-block mr-1" /> New High Score Record!
            </div>
          )}

          {/* Difficulty Badge */}
          <div className="bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1 rounded text-[10px] font-bold text-white/80 uppercase tracking-[0.2em] mb-4 relative z-10">
            {getDifficultyLabel()}
          </div>

          <h1 className="text-8xl font-serif font-medium text-white mb-2 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] relative z-10">
            {score}
          </h1>

          <div className="bg-black/30 backdrop-blur-md px-4 py-1.5 rounded-lg mb-8 relative z-10">
            <h2 className="text-[11px] font-sans font-black tracking-[0.2em] text-[#ffcc33] uppercase">
              Gopurams Reclaimed
            </h2>
          </div>

          <div className="w-full grid grid-cols-2 gap-4 border-t border-white/10 pt-6 relative z-10">
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest mb-2">Feathers Earned</span>
              <div className="flex items-center gap-2">
                <RealisticPeacockFeather className="w-7 h-7 drop-shadow-md" />
                <span className="text-2xl font-serif font-medium text-white">+{feathersEarned}</span>
              </div>
            </div>
            <div className="flex flex-col items-center border-l border-white/10">
              <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest mb-2">Total Feathers</span>
              <div className="flex items-center gap-2">
                <RealisticPeacockFeather className="w-7 h-7 opacity-70 drop-shadow-md" />
                <span className="text-2xl font-serif font-medium text-white">{stats.feathersCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Progress Card - Glass Tile */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex flex-col gap-4 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
          
          <div className="flex justify-between items-center relative z-10">
            <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest flex items-center gap-2">
              <Landmark className="w-4 h-4 text-orange-400" />
              Shrine Unlock Progress
            </span>
            <span className="text-[10px] font-mono font-bold text-[#ffcc33]">
              {stats.feathersCount} / {nextSkin ? nextSkin.cost : stats.feathersCount}
            </span>
          </div>

          <div className="w-full bg-black/40 h-2.5 rounded-full overflow-hidden border border-white/5 relative z-10">
            <div 
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(245,158,11,0.4)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] relative z-10">
            {nextSkin ? (
              <p className="text-white/70">
                Next: <span className="text-white font-bold">{nextSkin.name}</span>
              </p>
            ) : (
              <p className="text-emerald-400 font-bold uppercase tracking-widest">Master Unlock!</p>
            )}
            <button onClick={handleSkinsClick} className="text-[#ffcc33] font-bold underline hover:text-white transition-colors">
              Shrine
            </button>
          </div>
        </div>

        {/* 3. Action Buttons - Glass Styling */}
        <div className="grid grid-cols-2 gap-4 relative">
          <div 
            className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none bg-cover bg-center rounded-2xl"
            style={{ backgroundImage: `url('/93325456-56c4-4cd8-b284-74a38095e2f7.jpg')` }}
          />
          <button
            onClick={handleRestartClick}
            className="py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl shadow-[0_8px_20px_rgba(249,115,22,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/10 relative z-10"
          >
            <RotateCcw className="w-4 h-4" />
            Fly Again
          </button>
          <button
            onClick={handleHomeClick}
            className="py-4 bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer relative z-10"
          >
            <Home className="w-4 h-4" />
            Menu
          </button>
        </div>

      </div>
    </div>
  );
};
