/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { GameState, Difficulty, WeatherType, Skin, GameStats, DailyMission } from './types';
import { GameCanvas } from './components/GameCanvas';
import { MainMenu } from './components/MainMenu';
import { GameOverPanel } from './components/GameOverPanel';
import { SkinSelector } from './components/SkinSelector';
import { LeaderboardView } from './components/LeaderboardView';
import { IntroScreen } from './components/IntroScreen';
import { INITIAL_SKINS } from './gameConfig';
import { AudioEngine } from './audio';
import { Flame, Star, Sparkles, Trophy } from 'lucide-react';
import { BeatShaderOverlay } from './components/BeatShaderOverlay';
import { StoryMap } from './components/StoryMap';
import { StoryCutscene, CutsceneType } from './components/StoryCutscene';

const DEFAULT_MISSIONS: DailyMission[] = [
  {
    id: 'mission_dist',
    description: 'Fly 500 meters in a single run',
    descriptionTamil: 'ஒரே ஓட்டத்தில் 500 மீட்டர் பறக்கவும்',
    target: 500,
    current: 0,
    reward: 50,
    completed: false,
    claimed: false,
    type: 'DISTANCE',
  },
  {
    id: 'mission_feathers',
    description: 'Collect 20 feathers in a single run',
    descriptionTamil: 'ஒரே ஓட்டத்தில் 20 இறகுகளைச் சேகரிக்கவும்',
    target: 20,
    current: 0,
    reward: 75,
    completed: false,
    claimed: false,
    type: 'FEATHERS_RUN',
  },
  {
    id: 'mission_combo',
    description: 'Achieve a 10x Combo Streak in any run',
    descriptionTamil: '10x காம்போ ஸ்ட்ரீக்கை அடையுங்கள்',
    target: 10,
    current: 0,
    reward: 100,
    completed: false,
    claimed: false,
    type: 'COMBO_MAX',
  },
];

export default function App() {
  const [state, setState] = useState<GameState>(() => {
    try {
      const introSeen = localStorage.getItem('mystic_phoenix_intro_seen_v2');
      return introSeen === 'true' ? GameState.MENU : GameState.INTRO;
    } catch (e) {
      return GameState.INTRO;
    }
  });
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.EASY);
  const [selectedPerk, setSelectedPerk] = useState<string>('sanjeevini');
  const [isMuted, setIsMuted] = useState(false);
  const [currentRunScore, setCurrentRunScore] = useState(0);
  const [feathersEarnedThisRun, setFeathersEarnedThisRun] = useState(0);
  const [missions, setMissions] = useState<DailyMission[]>(DEFAULT_MISSIONS);

  // STORY MODE STATES
  const [isStoryMode, setIsStoryMode] = useState(false);
  const [storyLevel, setStoryLevel] = useState(1);
  const [activeCutscene, setActiveCutscene] = useState<{ type: 'INTRO' | 'OUTRO' | 'FINAL_ENDING'; level: number } | null>(null);

  // Consolidated statistics state
  const [stats, setStats] = useState<GameStats>({
    feathersCount: 0,
    coinsCount: 0,
    selectedSkinId: 'phoenix',
    unlockedSkins: ['phoenix'],
    highScoreEasy: 0,
    highScoreHard: 0,
    highScoreImpossible: 0,
    gamesPlayed: 0,
    selectedWeather: WeatherType.KURINJI,
    storyCheckpoint: 1,
  });

  // Skins listing state
  const [skins, setSkins] = useState<Skin[]>(INITIAL_SKINS);

  // 1. Initial State Loading from LocalStorage on mount
  useEffect(() => {
    try {
      const savedStats = localStorage.getItem('mystic_phoenix_game_stats_v1');
      let parsed = {};
      if (savedStats) {
        parsed = JSON.parse(savedStats);
      }

      const savedStoryCheckpoint = localStorage.getItem('paravai_story_checkpoint_v2');
      const checkpointValue = savedStoryCheckpoint ? parseInt(savedStoryCheckpoint, 10) : 1;

      setStats(prev => ({ 
        ...prev, 
        ...parsed, 
        storyCheckpoint: checkpointValue 
      }));

      const savedSkinsList = localStorage.getItem('mystic_phoenix_unlocked_skins_v1');
      if (savedSkinsList) {
        const unlockedIds: string[] = JSON.parse(savedSkinsList);
        setSkins(prev => 
          prev.map(skin => ({
            ...skin,
            unlocked: skin.id === 'phoenix' ? true : unlockedIds.includes(skin.id)
          }))
        );
      }

      const savedMissions = localStorage.getItem('veera_vaanam_daily_missions_v1');
      if (savedMissions) {
        setMissions(JSON.parse(savedMissions));
      }

      const audioSettings = AudioEngine.getSettings();
      setIsMuted(audioSettings.muted);

    } catch (e) {
      console.warn('Failed to load local storage save states', e);
    }
  }, []);

  // 1.5 Global Arcade Button Click Feedback (Tactile visual ripple & physical haptic vibration)
  useEffect(() => {
    const handleButtonClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      
      const button = target.closest('button');
      if (!button) return;

      // 1. Trigger subtle haptic feedback vibration on mobile browsers if supported
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(15); // Short, snappy tactile buzz
        } catch (err) {
          // Ignore vibration permission or context issues
        }
      }

      // 2. Add visual ripple feedback inside the clicked button
      const computedStyle = window.getComputedStyle(button);
      const isRelative = computedStyle.position === 'relative' || computedStyle.position === 'absolute' || computedStyle.position === 'fixed';
      if (!isRelative) {
        button.style.position = 'relative';
      }
      if (computedStyle.overflow !== 'hidden') {
        button.style.overflow = 'hidden';
      }

      const rect = button.getBoundingClientRect();
      const x = (e.clientX && e.clientX > 0) ? (e.clientX - rect.left) : (rect.width / 2);
      const y = (e.clientY && e.clientY > 0) ? (e.clientY - rect.top) : (rect.height / 2);

      const ripple = document.createElement('span');
      ripple.className = 'arcade-ripple';
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      button.appendChild(ripple);
      setTimeout(() => {
        ripple.remove();
      }, 500);
    };

    window.addEventListener('click', handleButtonClick, { capture: true });
    return () => {
      window.removeEventListener('click', handleButtonClick, { capture: true });
    };
  }, []);


  // 2. Persist statistics whenever they change
  const saveStats = (updated: GameStats) => {
    setStats(updated);
    try {
      localStorage.setItem('mystic_phoenix_game_stats_v1', JSON.stringify(updated));
      if (updated.storyCheckpoint !== undefined) {
        localStorage.setItem('paravai_story_checkpoint_v2', updated.storyCheckpoint.toString());
      }
    } catch (e) {
      console.warn('Failed to save stats to local storage', e);
    }
  };

  // Toggle Audio Engine mute status
  const handleToggleMute = () => {
    const audioSettings = AudioEngine.getSettings();
    const targetMuted = !audioSettings.muted;
    AudioEngine.setSettings({ muted: targetMuted });
    setIsMuted(targetMuted);
  };

  // Start the game
  const handleStartGame = () => {
    setIsStoryMode(false); // Reset to ensure endless mode
    setFeathersEarnedThisRun(0);
    setState(GameState.PLAYING);
  };

  // Story Mode Launch and Completion handlers
  const handleLaunchChapter = (level: number) => {
    setIsStoryMode(true);
    setStoryLevel(level);
    setActiveCutscene({ type: 'INTRO', level });
  };

  const handleStoryLevelComplete = (level: number, feathersBonus: number) => {
    const nextCheckpoint = level + 1;
    
    let skinToUnlock = '';
    if (level === 1) skinToUnlock = 'koel';
    else if (level === 2) skinToUnlock = 'peacock';
    else if (level === 3) skinToUnlock = 'garuda';
    else if (level === 4) skinToUnlock = 'swan';
    else if (level === 5) skinToUnlock = 'yali';

    let updatedSkins = skins;
    if (skinToUnlock) {
      updatedSkins = skins.map(s => s.id === skinToUnlock ? { ...s, unlocked: true } : s);
      setSkins(updatedSkins);
      try {
        const unlockedIds = updatedSkins.filter(s => s.unlocked).map(s => s.id);
        localStorage.setItem('mystic_phoenix_unlocked_skins_v1', JSON.stringify(unlockedIds));
      } catch (e) {
        console.warn('Failed to save unlocked skins list', e);
      }
    }

    const currentMaxCP = stats.storyCheckpoint || 1;
    const newCheckpoint = Math.max(currentMaxCP, nextCheckpoint);
    
    const nextStats: GameStats = {
      ...stats,
      feathersCount: stats.feathersCount + feathersBonus,
      storyCheckpoint: newCheckpoint,
    };
    saveStats(nextStats);

    if (level < 5) {
      setActiveCutscene({ type: 'OUTRO', level });
    } else {
      setActiveCutscene({ type: 'FINAL_ENDING', level: 5 });
    }
  };

  // Handle Game Over
  const handleGameOver = (finalScore: number, feathersCollect: number, maxCombo: number = 0, distanceFlown: number = 0) => {
    setCurrentRunScore(finalScore);
    setFeathersEarnedThisRun(feathersCollect);

    // Update records
    let newBestEasy = stats.highScoreEasy;
    let newBestHard = stats.highScoreHard;
    let newBestImpossible = stats.highScoreImpossible;

    if (difficulty === Difficulty.EASY && finalScore > stats.highScoreEasy) {
      newBestEasy = finalScore;
    } else if (difficulty === Difficulty.HARD && finalScore > stats.highScoreHard) {
      newBestHard = finalScore;
    } else if (difficulty === Difficulty.IMPOSSIBLE && finalScore > stats.highScoreImpossible) {
      newBestImpossible = finalScore;
    }

    const nextStats: GameStats = {
      ...stats,
      feathersCount: stats.feathersCount + feathersCollect,
      highScoreEasy: newBestEasy,
      highScoreHard: newBestHard,
      highScoreImpossible: newBestImpossible,
      gamesPlayed: stats.gamesPlayed + 1,
    };

    saveStats(nextStats);

    // Update daily missions progress
    setMissions(prevMissions => {
      const nextMissions = prevMissions.map(m => {
        if (m.claimed) return m;

        let newProgress = m.current;
        if (m.type === 'DISTANCE') {
          newProgress = Math.max(m.current, distanceFlown);
        } else if (m.type === 'FEATHERS_RUN') {
          newProgress = Math.max(m.current, feathersCollect);
        } else if (m.type === 'COMBO_MAX') {
          newProgress = Math.max(m.current, maxCombo);
        }

        const completed = newProgress >= m.target;
        return {
          ...m,
          current: Math.min(m.target, newProgress),
          completed,
        };
      });

      try {
        localStorage.setItem('veera_vaanam_daily_missions_v1', JSON.stringify(nextMissions));
      } catch (e) {
        console.warn('Failed to save missions progress to local storage', e);
      }
      return nextMissions;
    });

    setState(GameState.GAME_OVER);
  };

  // Claim Daily Mission Reward
  const handleClaimMission = (missionId: string) => {
    let rewardedAmount = 0;
    setMissions(prevMissions => {
      const targetMission = prevMissions.find(m => m.id === missionId);
      if (!targetMission || !targetMission.completed || targetMission.claimed) {
        return prevMissions;
      }
      rewardedAmount = targetMission.reward;

      const nextMissions = prevMissions.map(m => m.id === missionId ? { ...m, claimed: true } : m);
      try {
        localStorage.setItem('veera_vaanam_daily_missions_v1', JSON.stringify(nextMissions));
      } catch (e) {
        console.warn('Failed to save claimed missions', e);
      }
      return nextMissions;
    });

    if (rewardedAmount > 0) {
      AudioEngine.playTempleBellMilestone(); // Play temple bell gong
      const nextStats = {
        ...stats,
        feathersCount: stats.feathersCount + rewardedAmount
      };
      saveStats(nextStats);
    }
  };

  // Unlocking skin items inside Avian Sanctum
  const handleUnlockSkin = (skinId: string, cost: number) => {
    if (stats.feathersCount < cost) return;

    const nextSkinsList = skins.map(s => s.id === skinId ? { ...s, unlocked: true } : s);
    setSkins(nextSkinsList);

    const unlockedIds = nextSkinsList.filter(s => s.unlocked).map(s => s.id);
    try {
      localStorage.setItem('mystic_phoenix_unlocked_skins_v1', JSON.stringify(unlockedIds));
    } catch (e) {
      console.warn('Failed to save unlocked skins to local storage', e);
    }

    const nextStats = {
      ...stats,
      feathersCount: stats.feathersCount - cost,
    };
    saveStats(nextStats);
  };

  // Equipping unlocked skin items
  const handleEquipSkin = (skinId: string) => {
    const nextStats = {
      ...stats,
      selectedSkinId: skinId,
    };
    saveStats(nextStats);
  };

  // Collect individual feathers inside game loops
  const handleFeatherCollect = (count: number) => {
    setStats(prev => {
      const next = { ...prev, feathersCount: prev.feathersCount + count };
      try {
        localStorage.setItem('mystic_phoenix_game_stats_v1', JSON.stringify(next));
      } catch (e) {
        console.warn('Failed to save feather count during collect', e);
      }
      return next;
    });

    setFeathersEarnedThisRun(prev => {
      const nextCount = prev + count;
      
      setMissions(prevMissions => {
        const nextMissions = prevMissions.map(m => {
          if (m.claimed) return m;
          if (m.type === 'FEATHERS_RUN') {
            const newProgress = Math.max(m.current, nextCount);
            return {
              ...m,
              current: Math.min(m.target, newProgress),
              completed: newProgress >= m.target,
            };
          }
          return m;
        });

        try {
          localStorage.setItem('veera_vaanam_daily_missions_v1', JSON.stringify(nextMissions));
        } catch (e) {
          console.warn('Failed to save missions in real-time', e);
        }
        return nextMissions;
      });

      return nextCount;
    });
  };

  const handleCoinCollect = (count: number) => {
    setStats(prev => {
      const next = { ...prev, coinsCount: prev.coinsCount + count };
      try {
        localStorage.setItem('mystic_phoenix_game_stats_v1', JSON.stringify(next));
      } catch (e) {
        console.warn('Failed to save coin count during collect', e);
      }
      return next;
    });
  };

  const selectedSkin = skins.find(s => s.id === stats.selectedSkinId) || skins[0];

  return (
    <div className={`fixed inset-0 w-full h-full bg-[#1a0b00] text-white flex flex-col justify-between font-serif relative overflow-hidden touch-none overscroll-none selection:bg-amber-500/20 selection:text-amber-200 ${state === GameState.PLAYING ? 'p-0' : ''}`}>
      {/* Background Layer */}
      <div className="fixed inset-0 -z-50 bg-cover bg-center" style={{ backgroundImage: "url('/mystical_parallax_night.png')" }} />
      <BeatShaderOverlay />
      
      {/* HEADER METADATA (Architectural honesty - styled with Artistic Flair warmth) */}
      {state !== GameState.PLAYING && (
        <header className="absolute top-0 inset-x-0 w-full text-center py-2 text-[10px] sm:text-xs text-[#ffcc33]/60 font-mono uppercase tracking-widest border-b border-[#ffcc33]/20 bg-black/60 z-[100]">
          <div>Agni Paravai (Fire Bird) • Tamil Skies Revival Arcade © 2026</div>
        </header>
      )}

      {/* CORE FRAME LAYOUT */}
      <div className={`flex-1 flex flex-col justify-center items-center relative w-full h-screen`}>

        
        {/* GAMEBOARD PANEL ENCLOSURE (Artistic Flair Ornate Framing) */}
        <div className={`fixed inset-0 z-50 w-screen h-screen max-w-none border-0 rounded-none shadow-none m-0 p-0 ${state === GameState.PLAYING ? 'bg-black/70 backdrop-blur-xl overflow-hidden' : 'bg-[#0a0a0a] overflow-y-auto overflow-x-hidden'}`} id="main_gameboard_container">
          
          {/* STATE SELECTION DISPATCH */}
          {state === GameState.INTRO && (
            <IntroScreen
              onComplete={() => {
                try {
                  localStorage.setItem('mystic_phoenix_intro_seen_v2', 'true');
                } catch (e) {
                  console.warn('Failed to save intro seen flag', e);
                }
                setState(GameState.MENU);
              }}
            />
          )}

          {state === GameState.MENU && (
            <MainMenu skins={skins}
              stats={stats}
              
              onUpdateStats={saveStats}
              missions={missions}
              onClaimMission={handleClaimMission}
              onStartGame={handleStartGame}
              onSelectDifficulty={setDifficulty}
              onSelectWeather={weather => saveStats({ ...stats, selectedWeather: weather })}
              onStateChange={setState}
              difficulty={difficulty}
              isMuted={isMuted}
              onToggleMute={handleToggleMute}
              selectedPerk={selectedPerk}
              onSelectPerk={setSelectedPerk}
            />
          )}

          {state === GameState.PLAYING && (
            <GameCanvas
              gameState={state}
              difficulty={difficulty}
              weather={isStoryMode ? WeatherType.STORY_MODE : stats.selectedWeather}
              selectedSkin={selectedSkin}
              isMuted={isMuted}
              stats={stats}
              onGameOver={handleGameOver}
              onStateChange={setState}
              onFeatherCollect={handleFeatherCollect}
              onCoinCollect={handleCoinCollect}
              isStoryMode={isStoryMode}
              storyLevel={storyLevel}
              onStoryLevelComplete={handleStoryLevelComplete}
              selectedPerk={selectedPerk}
            />
          )}

          {state === GameState.STORY_MAP && (
            <StoryMap skins={skins}
              stats={stats}
              
              onUpdateStats={saveStats}
              onStateChange={setState}
              onLaunchChapter={handleLaunchChapter}
              onPlayEnding={() => setActiveCutscene({ type: 'FINAL_ENDING', level: 5 })}
            />
          )}

          {state === GameState.GAME_OVER && (
            <GameOverPanel skins={skins}
              score={currentRunScore}
              feathersEarned={feathersEarnedThisRun}
              difficulty={difficulty}
              
              onUpdateStats={saveStats}
              stats={stats}
              onRestart={() => setState(GameState.PLAYING)}
              onStateChange={setState}
            />
          )}

          {state === GameState.SKINS && (
            <SkinSelector skins={skins}
              stats={stats}
              onUnlockSkin={handleUnlockSkin}
              onEquipSkin={handleEquipSkin}
              onStateChange={setState}
              onUpdateStats={saveStats}
            />
          )}

          {state === GameState.LEADERBOARD && (
            <LeaderboardView
              stats={stats}
              onStateChange={setState}
            />
          )}

          {/* CINEMATIC CUTSCENES OVERLAY */}
          {activeCutscene && (
            <StoryCutscene
              type={activeCutscene.type === 'INTRO' ? CutsceneType.INTRO : (activeCutscene.type === 'OUTRO' ? CutsceneType.OUTRO : CutsceneType.FINAL_ENDING)}
              chapterId={activeCutscene.level}
              unlockedSkin={
                activeCutscene.type === 'OUTRO' 
                  ? (activeCutscene.level === 1 ? skins.find(s => s.id === 'koel') 
                    : activeCutscene.level === 2 ? skins.find(s => s.id === 'peacock')
                    : activeCutscene.level === 3 ? skins.find(s => s.id === 'garuda')
                    : activeCutscene.level === 4 ? skins.find(s => s.id === 'swan')
                    : undefined)
                  : undefined
              }
              onComplete={() => {
                const currentType = activeCutscene.type;
                setActiveCutscene(null);
                
                if (currentType === 'INTRO') {
                  setFeathersEarnedThisRun(0);
                  setState(GameState.PLAYING);
                } else if (currentType === 'OUTRO' || currentType === 'FINAL_ENDING') {
                  setState(GameState.STORY_MAP);
                }
              }}
            />
          )}

        </div>

      </div>


    </div>
  );
}

