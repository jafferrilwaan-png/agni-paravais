import React, { useState, useEffect } from 'react';
import { GameState, Difficulty, WeatherType, Skin, GameStats, DailyMission } from '../types';
import { INITIAL_SKINS, WEATHER_PRESETS } from '../gameConfig';
import { AudioEngine } from '../audio';
import { 
  Play, Shield, CloudRain, Sun, Compass, Sparkles, Map, 
  Trophy, Settings, Flame, Star, Volume2, VolumeX, CheckCircle, Gift, Info
} from 'lucide-react';

import kurinjiBg from '../assets/images/kurinji_bg_1783843688465.jpg';
import mullaiBg from '../assets/images/mullai_bg_1783843701035.jpg';
import maruthamBg from '../assets/images/marutham_bg_1783843712358.jpg';
import neithalBg from '../assets/images/neithal_bg_1783843723561.jpg';
import palaiBg from '../assets/images/palai_bg_1783843735587.jpg';

interface MainMenuProps {
  onStartGame: () => void;
  onStateChange: (state: GameState) => void;
  difficulty: Difficulty;
  onSelectDifficulty: (diff: Difficulty) => void;
  onSelectWeather: (weather: WeatherType) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  stats: GameStats;
  skins: Skin[];
  onUpdateStats?: (stats: GameStats) => void;
  missions: DailyMission[];
  onClaimMission: (id: string) => void;
  selectedPerk: string;
  onSelectPerk: (perk: string) => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartGame,
  onStateChange,
  difficulty,
  onSelectDifficulty,
  onSelectWeather,
  isMuted,
  onToggleMute,
  stats,
  skins,
  onUpdateStats,
  missions,
  onClaimMission,
  selectedPerk,
  onSelectPerk,
}) => {
  const [showTasks, setShowTasks] = useState(false);
  const [showPreGame, setShowPreGame] = useState(false);
  const [randomWeather, setRandomWeather] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth) - 0.5; // range: -0.5 to 0.5
      const y = (e.clientY / innerHeight) - 0.5; // range: -0.5 to 0.5
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleStart = () => {
    
    // Start the game!
    if (randomWeather) {
      const presets = WEATHER_PRESETS.map(p => p.type);
      const random = presets[Math.floor(Math.random() * presets.length)];
      onSelectWeather(random);
    }
    onStartGame();
  };


  const handleWeatherClick = (type: WeatherType) => {
    AudioEngine.playButton();
    onSelectWeather(type);
  };

  const selectedSkin = skins.find(s => s.id === stats.selectedSkinId) || skins[0];

    
  const BACKGROUND_IMAGES = {
    [WeatherType.KURINJI]: kurinjiBg,
    [WeatherType.MULLAI]: mullaiBg,
    [WeatherType.MARUTHAM]: maruthamBg,
    [WeatherType.NEITHAL]: neithalBg,
    [WeatherType.PALAI]: palaiBg
  };

  const currentBg = BACKGROUND_IMAGES[stats.selectedWeather] || BACKGROUND_IMAGES[WeatherType.KURINJI];

  return (
    <div className="absolute inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto overflow-x-hidden no-scrollbar">
      <style>{`
        @keyframes float-ember {
          0% { transform: translateY(105vh) translateX(0) scale(0.6); opacity: 0; }
          10% { opacity: 0.85; }
          90% { opacity: 0.45; }
          100% { transform: translateY(-10vh) translateX(45px) scale(0.25); opacity: 0; }
        }
        .ember-spark {
          position: absolute;
          background: radial-gradient(circle, rgba(251,191,36,0.9) 0%, rgba(249,115,22,0.4) 70%, rgba(239,68,68,0) 100%);
          border-radius: 50%;
          filter: blur(1px);
          pointer-events: none;
          z-index: 10;
        }
        @keyframes drift-mist {
          0% { transform: translateX(-100%) scaleY(1); opacity: 0; }
          15% { opacity: 0.45; }
          85% { opacity: 0.45; }
          100% { transform: translateX(100%) scaleY(1.15); opacity: 0; }
        }
        @keyframes drift-mist-reverse {
          0% { transform: translateX(100%) scaleY(1.1); opacity: 0; }
          15% { opacity: 0.4; }
          85% { opacity: 0.4; }
          100% { transform: translateX(-100%) scaleY(0.9); opacity: 0; }
        }
        @keyframes flicker-flame {
          0%, 100% { transform: scale(1) rotate(-1deg); filter: brightness(1); }
          20% { transform: scale(1.08, 0.92) rotate(1deg); filter: brightness(1.1); }
          40% { transform: scale(0.95, 1.05) rotate(-2.5deg); filter: brightness(0.93); }
          60% { transform: scale(1.05, 0.95) rotate(2deg); filter: brightness(1.06); }
          80% { transform: scale(0.97, 1.03) rotate(-1.5deg); filter: brightness(1); }
        }
        @keyframes float-title {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(0.5deg); }
        }
        .animate-float-title {
          animation: float-title 6s ease-in-out infinite;
        }
        .animate-drift-mist {
          animation: drift-mist 24s linear infinite;
        }
        .animate-drift-mist-reverse {
          animation: drift-mist-reverse 28s linear infinite;
        }
        .animate-flicker-flame {
          animation: flicker-flame 1.3s ease-in-out infinite;
          transform-origin: bottom center;
        }
      `}</style>
      <div 
        className="fixed inset-0 bg-cover bg-center animate-parallax-slow opacity-95 transition-all duration-700 ease-out"
        style={{ 
          backgroundImage: `url(${currentBg})`, 
          transform: `scale(1.1) translate(${mousePos.x * -12}px, ${mousePos.y * -12}px)` 
        }}
      />
      {/* Floating Sparkles Embers Overlay */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-10">
        {Array.from({ length: 15 }).map((_, i) => {
          const size = 3 + (i % 4) * 2; // 3 to 9px
          const left = 5 + (i * 7) % 90; // spread across 5% to 95%
          const duration = 8 + (i % 5) * 3; // 8 to 20 seconds
          const delay = i * 0.7;
          return (
            <div 
              key={i} 
              className="ember-spark" 
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${left}%`,
                bottom: '-20px',
                animation: `float-ember ${duration}s linear infinite`,
                animationDelay: `${delay}s`,
              }}
            />
          );
        })}
      </div>
      {/* Dynamic artistic vignette overlays to preserve complete readability while keeping the artwork 100% full and vivid */}
      <div className="fixed inset-0 bg-radial-vignette opacity-80 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 pointer-events-none" />

      
      {/* Top Bar */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-50">
        <div className="flex items-center gap-3">
          <div className="bg-black/40 backdrop-blur-md border border-[#ffcc33]/20 px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg">
            <Flame className="w-5 h-5 text-amber-500" />
            <span className="text-white font-mono font-bold mr-2" title="Feathers / இறகுகள்">{stats.feathersCount}</span>
            <div className="w-px h-4 bg-white/20 mx-1"></div>
            <span className="text-xl mx-1" title="Coins / நாணங்கள்">🪙</span>
            <span className="text-white font-mono font-bold" title="Coins / நாணங்கள்">{stats.coinsCount || 0}</span>
          </div>
          <button
            onClick={() => { AudioEngine.playButton(); setShowTasks(!showTasks); }}
            className={`px-4 py-2 rounded-xl border flex items-center gap-2 shadow-lg transition ${showTasks ? 'bg-amber-500/20 border-amber-400' : 'bg-black/40 backdrop-blur-md border-[#ffcc33]/20 text-slate-300 hover:text-white hover:border-[#ffcc33]/50'}`}
          >
            <Gift className={`w-4 h-4 ${missions.some(m => m.completed && !m.claimed) ? 'text-amber-400 animate-bounce' : 'text-[#ffcc33]'}`} />
            <span className="text-sm font-bold tracking-wider uppercase">Tasks</span>
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              onToggleMute();
              AudioEngine.playButton();
            }}
            className="p-3 rounded-xl bg-black/40 backdrop-blur-md border border-[#ffcc33]/20 text-slate-300 hover:text-white transition shadow-lg"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-[#ffcc33]" />}
          </button>
        </div>
      </div>

      {/* Main Minimalist Container */}
      <div className="w-full min-h-full flex flex-col md:flex-row gap-8 items-center justify-center py-16 md:py-24 relative px-4 md:px-10">
        
        {/* Left Column: Play & Core Setup */}
        <div className="flex-1 flex flex-col gap-10 w-full max-w-2xl relative z-20">
          <div className="text-center md:text-left mb-8 animate-float-title">
            <div className="flex items-center justify-center md:justify-start gap-4 mb-5">
              <div className="p-4 bg-orange-500/20 backdrop-blur-xl rounded-[1.5rem] border border-orange-500/30 shadow-[0_0_30px_rgba(249,115,22,0.2)]">
                <Flame className="w-10 h-10 text-[#ffcc33] animate-pulse" />
              </div>
              <div className="flex flex-col">
                <p className="text-[#ffcc33] text-xs tracking-[0.8em] uppercase font-black opacity-90">
                  CELESTIAL SAGA
                </p>
                <div className="w-20 h-[3px] bg-gradient-to-r from-[#ffcc33] to-transparent mt-2 rounded-full" />
              </div>
            </div>
            
            <h1 className="text-6xl sm:text-7xl md:text-[6.5rem] lg:text-[7.5rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-amber-100 via-[#ffcc33] to-orange-600 font-serif tracking-tighter drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] leading-[0.8] py-4">
              AGNI PARAVAI
            </h1>
            
            <div className="flex items-center justify-center md:justify-start gap-4 mt-8 bg-black/50 backdrop-blur-md w-fit px-8 py-3.5 rounded-full border border-white/10 mx-auto md:mx-0 shadow-2xl">
              <Sparkles className="w-5 h-5 text-orange-400 opacity-90" />
              <p className="text-white/90 text-[11px] tracking-[0.5em] uppercase font-mono">Mystic Temple Guardian</p>
            </div>
          </div>

          <button
            onClick={handleStart}
            className="group relative w-full py-5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 border border-amber-300 shadow-[0_0_40px_rgba(245,158,11,0.3)] hover:shadow-[0_0_60px_rgba(245,158,11,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-3 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
            <Play className="w-8 h-8 text-black fill-black" />
            <span className="text-black font-black text-2xl uppercase tracking-widest">Endless</span>
          </button>
          
          <button
            onClick={() => { AudioEngine.playButton(); onStateChange(GameState.STORY_MAP); }}
            className="group relative w-full p-4 rounded-2xl bg-gradient-to-r from-purple-950/80 via-[#2d124d]/80 to-indigo-950/80 border-2 border-purple-500/40 hover:border-purple-400 shadow-[0_0_25px_rgba(147,51,234,0.25)] hover:shadow-[0_0_45px_rgba(147,51,234,0.55)] transition-all duration-300 flex items-center gap-4 text-left overflow-hidden cursor-pointer"
          >
            {/* Ambient background glow inside button */}
            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/25 transition-all duration-500" />
            
            {/* Epic custom emblem representing Story Mode */}
            <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-900 to-amber-900/40 border border-purple-300/40 group-hover:border-amber-400 shadow-[0_0_20px_rgba(168,85,247,0.4)] group-hover:scale-110 transition-all duration-500">
              <div className="absolute inset-0.5 rounded-xl border-2 border-amber-400/25 animate-pulse" />
              <div className="absolute inset-0.5 rounded-xl border border-dashed border-purple-400/30 animate-spin-slow" />
              <Map className="w-7 h-7 text-amber-300 drop-shadow-[0_2px_8px_rgba(245,158,11,0.65)] group-hover:rotate-12 transition-transform duration-300" />
              <Sparkles className="absolute -top-1.5 -right-1.5 w-4 h-4 text-amber-300 animate-bounce" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-white font-black text-lg uppercase tracking-widest group-hover:text-amber-300 transition-colors">Story Mode</span>
                <span className="text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/40 tracking-wider">CAMPAIGN</span>
              </div>
              <p className="text-purple-200/70 text-[11px] font-sans tracking-wide mt-1 group-hover:text-purple-100 transition-colors">
                Embark on the Divine Temple Saga / ஐந்திணை காவியம்
              </p>
            </div>
          </button>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => { AudioEngine.playButton(); onStateChange(GameState.SKINS); }}
              className="group relative py-4 px-3 rounded-2xl bg-black/50 border border-amber-500/20 hover:border-amber-400/60 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] transition-all duration-300 flex flex-col items-center justify-center gap-2 overflow-hidden cursor-pointer text-center"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-amber-500/0 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500/20 to-orange-500/20 flex items-center justify-center text-xl shadow-md border border-amber-400/30 group-hover:scale-110 transition-transform duration-300 group-hover:border-amber-400">🪶</div>
              <div className="flex flex-col items-center">
                <span className="text-xs font-black text-white uppercase tracking-widest group-hover:text-amber-300 transition-colors">Skins</span>
                <span className="text-[9px] font-mono font-bold text-amber-400 mt-1 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20 whitespace-nowrap">
                  {stats.unlockedSkins ? stats.unlockedSkins.length : 1} / {skins.length} UNLOCKED
                </span>
              </div>
            </button>

            <button
              onClick={() => { AudioEngine.playButton(); onStateChange(GameState.LEADERBOARD); }}
              className="group relative py-4 px-3 rounded-2xl bg-black/50 border border-amber-500/20 hover:border-amber-400/60 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] transition-all duration-300 flex flex-col items-center justify-center gap-2 overflow-hidden cursor-pointer text-center"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-amber-500/0 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500/20 to-orange-500/20 flex items-center justify-center shadow-md border border-amber-400/30 group-hover:scale-110 transition-transform duration-300 group-hover:border-amber-400">
                <Trophy className="w-5 h-5 text-amber-400 animate-pulse" />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs font-black text-white uppercase tracking-widest group-hover:text-amber-300 transition-colors">Rankings</span>
                <span className="text-[9px] font-mono font-bold text-amber-400 mt-1 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20 whitespace-nowrap">
                  BEST: {Math.max(stats.highScoreEasy || 0, stats.highScoreHard || 0, stats.highScoreImpossible || 0)}
                </span>
              </div>
            </button>
          </div>
        </div>

        
        
        {/* Right Column: Settings / Thinais */}
        <div className="flex-1 flex flex-col gap-6 w-full max-w-sm relative z-10">
           <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl">
              <h3 className="text-sm font-mono text-white/50 uppercase tracking-widest mb-4 flex items-center justify-between">
                <span>Map / திணை</span>
              </h3>
              <div className="flex items-center justify-between gap-2 py-2 overflow-x-auto no-scrollbar">
                {WEATHER_PRESETS.map((preset) => (
                  <button
                    key={preset.type}
                    onClick={() => { setRandomWeather(false); onSelectWeather(preset.type); }}
                    className={`w-12 h-12 rounded-full border-2 relative overflow-hidden transition-all duration-300 hover:scale-110 flex-shrink-0 flex items-center justify-center cursor-pointer ${
                      !randomWeather && stats.selectedWeather === preset.type 
                        ? 'border-[#ffcc33] shadow-[0_0_15px_rgba(255,204,51,0.6)] scale-105'
                        : 'border-white/20 hover:border-white/50 bg-black/40'
                    }`}
                  >
                    {/* Map thumbnail inside round button */}
                    <img 
                      src={BACKGROUND_IMAGES[preset.type]} 
                      alt={preset.name} 
                      className="absolute inset-0 w-full h-full object-cover opacity-50 hover:opacity-75 transition-opacity"
                    />
                    {/* Dark overlay */}
                    <div className="absolute inset-0 bg-black/20" />
                    {/* Icon indicator on top of the map thumbnail */}
                    <span className="text-lg relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                      {preset.type === WeatherType.KURINJI ? '⛰️' :
                       preset.type === WeatherType.MULLAI ? '🌲' :
                       preset.type === WeatherType.MARUTHAM ? '🌾' :
                       preset.type === WeatherType.NEITHAL ? '🌊' : '☀️'}
                    </span>
                  </button>
                ))}
              </div>

              {/* Display selected map's name and description dynamically */}
              {(() => {
                const activePreset = WEATHER_PRESETS.find(p => p.type === stats.selectedWeather) || WEATHER_PRESETS[0];
                const parts = activePreset.name.split(' '); // e.g. ["Kurinji", "(Mountains)", "குறிஞ்சி"]
                const englishName = parts[0];
                const landscapeName = parts[1] || "";
                const tamilName = parts[2] || parts[1] || "";
                
                return (
                  <div className="mt-3 bg-black/40 p-3 rounded-xl border border-white/5 animate-in fade-in duration-300">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-[#ffcc33] uppercase tracking-widest">
                        {englishName} <span className="text-white/40">{landscapeName}</span>
                      </span>
                      <span className="text-xs font-bold text-white/90 font-serif">{tamilName}</span>
                    </div>
                    <p className="text-[10px] text-slate-300 leading-relaxed font-sans">{activePreset.description}</p>
                  </div>
                );
              })()}
           </div>

           <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl">
              <h3 className="text-sm font-mono text-white/50 uppercase tracking-widest mb-4 flex items-center justify-between">
                <span>Bird / பறவை</span>
                <button onClick={() => onStateChange(GameState.SKINS)} className="text-xs text-amber-400 hover:text-amber-300 underline">Change ➜</button>
              </h3>
              <div className="flex items-center gap-4 bg-black/40 p-3 rounded-xl border border-white/10">
                <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center bg-black/50" style={{ borderColor: selectedSkin.color }}>🪶</div>
                <div>
                  <div className="text-sm font-bold" style={{ color: selectedSkin.color }}>{selectedSkin.name}</div>
                  <div className="text-[10px] text-slate-400">{selectedSkin.powerName}</div>
                </div>
              </div>
           </div>

            {/* DYNAMIC DIFFICULTY SELECTOR */}
            <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl">
              <h3 className="text-sm font-mono text-white/50 uppercase tracking-widest mb-3">
                Difficulty / சவால் நிலை
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: Difficulty.EASY, label: 'EASY', labelTamil: 'எளிய', color: 'border-emerald-500/40 hover:border-emerald-400 bg-emerald-950/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]' },
                  { key: Difficulty.HARD, label: 'HARD', labelTamil: 'கடின', color: 'border-amber-500/40 hover:border-amber-400 bg-amber-950/10 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)]' },
                  { key: Difficulty.IMPOSSIBLE, label: 'IMPO', labelTamil: 'தீவிர', color: 'border-red-500/40 hover:border-red-400 bg-red-950/10 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]' }
                ].map((item) => {
                  const isActive = difficulty === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => { AudioEngine.playButton(); onSelectDifficulty(item.key); }}
                      className={`py-2 px-1 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer ${
                        isActive 
                          ? `${item.color.split(' ')[1]} ${item.color.split(' ')[3]} border-opacity-100 scale-105` 
                          : 'border-white/10 hover:border-white/30 text-white/60 bg-black/40'
                      }`}
                    >
                      <span className="text-xs font-black tracking-wider uppercase">{item.label}</span>
                      <span className="text-[9px] opacity-70 mt-0.5 font-serif">{item.labelTamil}</span>
                    </button>
                  );
                })}
              </div>

              {/* Difficulty descriptor info line */}
              <p className="text-[10px] text-slate-400 font-sans mt-3 px-1 leading-relaxed">
                {difficulty === Difficulty.EASY && "💚 Perfect for learning. Slower speed, lots of items, and enables starting Divine Perks! (இலகுவான ஆட்டம்)"}
                {difficulty === Difficulty.HARD && "💛 Standard gameplay. Obstacles speed up dynamically, fewer powerups. (சவாலான ஆட்டம்)"}
                {difficulty === Difficulty.IMPOSSIBLE && "❤️ Absolute fury! Hyper-fast pillars and endless rotating lasers. Only for true masters. (கடுமையான சவால்)"}
              </p>
            </div>

            {/* DIVINE PERKS SELECTOR (Unlocked for EASY Mode and Story Mode!) */}
            {(difficulty === Difficulty.EASY || stats.storyCheckpoint !== undefined) && (
              <div className="bg-gradient-to-br from-[#2e1700]/70 via-[#1d1004]/70 to-[#0c0601]/70 backdrop-blur-xl border-2 border-amber-500/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl" />
                
                <h3 className="text-sm font-mono text-amber-400 uppercase tracking-widest mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                    Divine Perks / அருள் வரங்கள்
                  </span>
                  <span className="text-[9px] font-mono font-bold bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">EASY EXCLUSIVE</span>
                </h3>
                <p className="text-[10px] text-amber-300/60 font-sans leading-tight mb-4">Choose your start-up celestial empowerment / வானுலக சக்தியைத் தேர்ந்தெடுக்கவும்:</p>
                
                <div className="flex flex-col gap-2">
                  {[
                    {
                      id: 'sanjeevini',
                      name: 'Sanjeevini Blessing',
                      tamil: 'சஞ்சீவினி அருள்',
                      desc: 'Starts flight with 4 Sacred Lives instead of 3, plus an active automatic shield!',
                      icon: '🛡️',
                      color: 'from-emerald-500/20 to-emerald-950/20 border-emerald-500/35 text-emerald-300 hover:border-emerald-400'
                    },
                    {
                      id: 'magnet',
                      name: 'Magnetic Aura',
                      tamil: 'மயில் காந்த விசை',
                      desc: 'Generates a permanent 3x feather attractor. Sucks in all floating feathers!',
                      icon: '🧲',
                      color: 'from-cyan-500/20 to-cyan-950/20 border-cyan-500/35 text-cyan-300 hover:border-cyan-400'
                    },
                    {
                      id: 'rage',
                      name: 'Agni Firebrand',
                      tamil: 'அக்னி கோப வீச்சு',
                      desc: 'Start flight with 50% Agni Charge. Agni Rage active meter builds up 2x faster!',
                      icon: '🔥',
                      color: 'from-amber-500/20 to-amber-950/20 border-amber-500/35 text-amber-300 hover:border-amber-400'
                    }
                  ].map((perk) => {
                    const isSelected = selectedPerk === perk.id;
                    return (
                      <button
                        key={perk.id}
                        onClick={() => { AudioEngine.playButton(); onSelectPerk(perk.id); }}
                        className={`group relative text-left p-3 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden flex items-start gap-3 ${
                          isSelected 
                            ? `bg-gradient-to-r ${perk.color.split(' ')[1]} border-opacity-100 border-[#ffcc33] shadow-[0_0_15px_rgba(251,191,36,0.2)]` 
                            : 'bg-black/40 border-white/5 text-white hover:bg-white/5 hover:border-white/25'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute inset-0.5 rounded-lg border border-dashed border-amber-400/25 animate-pulse" />
                        )}
                        <span className="text-xl relative z-10">{perk.icon}</span>
                        <div className="flex-1 relative z-10">
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-bold tracking-wide ${isSelected ? 'text-amber-300' : 'text-white'}`}>{perk.name}</span>
                            <span className="text-[9px] opacity-60 font-serif">{perk.tamil}</span>
                          </div>
                          <p className="text-[10px] text-slate-300/70 mt-0.5 font-sans leading-relaxed group-hover:text-slate-200 transition-colors">{perk.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
        </div>

        {/* MYSTICAL TEMPLE COURTYARD BACKGROUND (Bottom section, Parallax-style) */}
        <div className="fixed bottom-0 inset-x-0 h-64 pointer-events-none overflow-hidden z-0 select-none">
          {/* PARALLAX LAYER 1: Deep blue-purple mystical sky gradient background */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#090212] via-[#05010b] to-transparent opacity-90" />

          {/* PARALLAX LAYER 2: Soft/Faint temple pillars & statues in the distance (faint and atmospheric) */}
          <div 
            className="absolute inset-x-0 bottom-12 h-36 flex justify-around items-end px-12 opacity-15 filter blur-[1.5px] transition-all duration-300 ease-out"
            style={{ transform: `translate(${mousePos.x * -15}px, ${mousePos.y * -8}px)` }}
          >
            {/* Faint Pillars */}
            <div className="w-6 h-32 bg-gradient-to-t from-[#14062a] to-[#070110] rounded-t-md relative">
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-2 bg-[#1e073c] rounded-sm" />
            </div>
            {/* Faint Shrine Statue Silhouette */}
            <div className="w-12 h-20 bg-gradient-to-t from-[#14062a] to-[#070110] rounded-full relative flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-[#14062a] -top-5 absolute" />
              <div className="w-8 h-10 rounded-t-full bg-[#14062a] absolute" />
            </div>
            <div className="w-6 h-32 bg-gradient-to-t from-[#14062a] to-[#070110] rounded-t-md relative">
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-2 bg-[#1e073c] rounded-sm" />
            </div>
          </div>

          {/* PARALLAX LAYER 3: Stone steps & Wet tiles with subtle moonlight reflections */}
          <div 
            className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#070312] to-[#0c041c] border-t border-[#ffcc33]/15 transition-all duration-300 ease-out"
            style={{ transform: `translate(${mousePos.x * 2}px, ${mousePos.y * 1}px)` }}
          >
            {/* Wet stone reflections - diagonal glossy highlight stripes */}
            <div className="absolute inset-0 opacity-20 bg-[linear-gradient(115deg,transparent_40%,rgba(191,219,254,0.15)_45%,rgba(191,219,254,0.3)_50%,rgba(191,219,254,0.15)_55%,transparent_60%)] bg-[size:200%_100%] animate-pulse" style={{ animationDuration: '6s' }} />
            
            {/* Stone steps structure */}
            <div className="absolute inset-x-0 bottom-12 h-4 bg-[#110724] border-b border-[#090314] opacity-90 shadow-inner" />
            <div className="absolute inset-x-0 bottom-6 h-6 bg-[#0b0319] border-b border-[#05010a] opacity-95" />
            <div className="absolute inset-x-0 bottom-0 h-6 bg-[#05010b] opacity-100" />
            
            {/* Grid lines for wet stone tiles */}
            <div className="absolute inset-0 opacity-25" style={{
              backgroundImage: `
                linear-gradient(to right, rgba(255,204,51,0.04) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255,204,51,0.04) 1px, transparent 1px)
              `,
              backgroundSize: '40px 12px',
            }} />
          </div>

          {/* PARALLAX LAYER 4: Faint drifting mist near the ground */}
          <div 
            className="absolute inset-x-0 bottom-0 h-20 pointer-events-none overflow-hidden mix-blend-screen opacity-40 transition-all duration-300 ease-out"
            style={{ transform: `translate(${mousePos.x * 12}px, ${mousePos.y * 4}px)` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-500/20 to-transparent blur-md translate-x-[-50%] animate-drift-mist" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent blur-lg translate-x-[50%] animate-drift-mist-reverse" style={{ animationDelay: '-4s' }} />
          </div>

          {/* PARALLAX LAYER 5: Glowing oil lamps (diyas) placed along the stone steps */}
          <div 
            className="absolute inset-x-0 bottom-2 h-16 flex justify-between items-end px-6 sm:px-16 z-10 transition-all duration-300 ease-out"
            style={{ transform: `translate(${mousePos.x * 25}px, ${mousePos.y * 12}px)` }}
          >
            {/* Lamp 1 (Left) */}
            <div className="flex flex-col items-center relative group">
              {/* Lamp base (terracotta clay look with gold rim) */}
              <div className="w-7 h-3 bg-gradient-to-b from-[#b45309] to-[#78350f] rounded-b-full border-t border-[#f59e0b]/40 shadow-md relative">
                <div className="absolute -top-1 left-1 w-5 h-1.5 bg-[#d97706] rounded-full opacity-80" />
              </div>
              {/* Glowing Flame */}
              <div className="absolute bottom-3 w-3 h-5 bg-gradient-to-t from-[#ea580c] via-[#f59e0b] to-[#fef08a] rounded-full animate-flicker-flame shadow-[0_-4px_15px_rgba(245,158,11,0.8)]">
                {/* Core flame glow */}
                <div className="absolute inset-0.5 bg-white rounded-full opacity-90 animate-pulse" />
              </div>
              {/* Ambient gold glow on wet stone below the lamp */}
              <div className="absolute -bottom-1 w-12 h-4 bg-amber-500/30 rounded-full blur-sm animate-pulse" />
            </div>

            {/* Lamp 2 (Left-Center, on step) */}
            <div className="flex flex-col items-center relative bottom-6 group">
              <div className="w-6 h-2.5 bg-gradient-to-b from-[#b45309] to-[#78350f] rounded-b-full border-t border-[#f59e0b]/40 shadow-md relative">
                <div className="absolute -top-0.5 left-1 w-4 h-1 bg-[#d97706] rounded-full opacity-80" />
              </div>
              <div className="absolute bottom-2.5 w-2.5 h-4 bg-gradient-to-t from-[#ea580c] via-[#f59e0b] to-[#fef08a] rounded-full animate-flicker-flame shadow-[0_-3px_12px_rgba(245,158,11,0.75)]" style={{ animationDelay: '-0.7s' }}>
                <div className="absolute inset-0.5 bg-white rounded-full opacity-90 animate-pulse" />
              </div>
              <div className="absolute -bottom-1 w-10 h-3 bg-amber-500/25 rounded-full blur-sm animate-pulse" style={{ animationDelay: '-0.7s' }} />
            </div>

            {/* Lamp 3 (Right-Center, on step) */}
            <div className="flex flex-col items-center relative bottom-6 group">
              <div className="w-6 h-2.5 bg-gradient-to-b from-[#b45309] to-[#78350f] rounded-b-full border-t border-[#f59e0b]/40 shadow-md relative">
                <div className="absolute -top-0.5 left-1 w-4 h-1 bg-[#d97706] rounded-full opacity-80" />
              </div>
              <div className="absolute bottom-2.5 w-2.5 h-4 bg-gradient-to-t from-[#ea580c] via-[#f59e0b] to-[#fef08a] rounded-full animate-flicker-flame shadow-[0_-3px_12px_rgba(245,158,11,0.75)]" style={{ animationDelay: '-1.4s' }}>
                <div className="absolute inset-0.5 bg-white rounded-full opacity-90 animate-pulse" />
              </div>
              <div className="absolute -bottom-1 w-10 h-3 bg-amber-500/25 rounded-full blur-sm animate-pulse" style={{ animationDelay: '-1.4s' }} />
            </div>

            {/* Lamp 4 (Right) */}
            <div className="flex flex-col items-center relative group">
              <div className="w-7 h-3 bg-gradient-to-b from-[#b45309] to-[#78350f] rounded-b-full border-t border-[#f59e0b]/40 shadow-md relative">
                <div className="absolute -top-1 left-1 w-5 h-1.5 bg-[#d97706] rounded-full opacity-80" />
              </div>
              <div className="absolute bottom-3 w-3 h-5 bg-gradient-to-t from-[#ea580c] via-[#f59e0b] to-[#fef08a] rounded-full animate-flicker-flame shadow-[0_-4px_15px_rgba(245,158,11,0.8)]" style={{ animationDelay: '-2.1s' }}>
                <div className="absolute inset-0.5 bg-white rounded-full opacity-90 animate-pulse" />
              </div>
              <div className="absolute -bottom-1 w-12 h-4 bg-amber-500/30 rounded-full blur-sm animate-pulse" style={{ animationDelay: '-2.1s' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Pre-Game Selection Overlay (REMOVED logic) */}
      {/* Tasks Overlay */}

      {showTasks && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-200">
          <div className="w-full max-w-lg bg-black/90 border border-amber-500/30 rounded-3xl p-6 relative">
            <button 
              onClick={() => setShowTasks(false)}
              className="absolute -top-4 -right-4 md:-right-8 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            >✕</button>
            <h2 className="text-2xl font-serif text-[#ffcc33] font-bold mb-6 flex items-center gap-3">
              <Gift className="w-6 h-6" /> Daily Missions
            </h2>
            <div className="flex flex-col gap-4">
              {missions.map(mission => {
                const percent = Math.min(100, Math.round((mission.current / mission.target) * 100));
                return (
                  <div key={mission.id} className={`p-4 rounded-2xl border flex flex-col gap-3 ${mission.completed ? 'bg-amber-500/10 border-amber-400/40' : 'bg-white/5 border-white/10'}`}>
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="text-sm font-bold text-white">{mission.description}</div>
                        <div className="text-[10px] text-slate-400 mt-1">{mission.descriptionTamil}</div>
                      </div>
                      <div className="shrink-0 flex items-center">
                        {mission.claimed ? (
                          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" /> Claimed
                          </span>
                        ) : mission.completed ? (
                          <button
                            onClick={() => onClaimMission(mission.id)}
                            className="px-4 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition shadow-[0_0_15px_rgba(245,158,11,0.4)] animate-pulse"
                          >
                            Claim {mission.reward} 🪶
                          </button>
                        ) : (
                          <span className="text-xs font-mono font-bold text-amber-500/60 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
                            +{mission.reward} Feathers
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-black h-2 rounded-full overflow-hidden border border-white/10">
                        <div className="h-full bg-gradient-to-r from-amber-600 to-yellow-400 transition-all duration-500" style={{ width: `${percent}%` }} />
                      </div>
                      <span className="text-xs font-mono text-slate-400 min-w-[50px] text-right">{mission.current}/{mission.target}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
