/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { GameState, Difficulty, GameStats, LeaderboardEntry } from '../types';
import { MOCK_LEADERBOARD } from '../gameConfig';
import { AudioEngine } from '../audio';
import { ArrowLeft, Trophy, Shield, Zap, Sparkles, Compass } from 'lucide-react';

interface LeaderboardViewProps {
  stats: GameStats;
  onStateChange: (state: GameState) => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  stats,
  onStateChange,
}) => {
  const handleBackClick = () => {
    AudioEngine.playButton();
    onStateChange(GameState.MENU);
  };

  // Merge player high score into the list for displaying records
  const allTimeRecords = useMemo((): LeaderboardEntry[] => {
    const list: LeaderboardEntry[] = [...MOCK_LEADERBOARD];
    
    const playerBestEasy = stats.highScoreEasy;
    const playerBestHard = stats.highScoreHard;
    const playerBestImpossible = stats.highScoreImpossible;

    const highestBest = Math.max(playerBestEasy, playerBestHard, playerBestImpossible);
    let bestDiff = Difficulty.EASY;
    if (highestBest === playerBestHard) bestDiff = Difficulty.HARD;
    if (highestBest === playerBestImpossible) bestDiff = Difficulty.IMPOSSIBLE;

    if (highestBest > 0) {
      list.push({
        rank: 99,
        name: "Your Eternal Spirit (PB)",
        score: highestBest,
        difficulty: bestDiff,
        date: "Today",
        isPlayer: true,
      });
    }

    list.sort((a, b) => b.score - a.score);
    return list.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
  }, [stats]);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 p-6 md:p-8 animate-fade-in font-serif" id="leaderboard_view_panel">
      
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between border-b border-[#ffcc33]/15 pb-4">
        <button
          onClick={handleBackClick}
          className="px-4 py-2 rounded-xl bg-black/60 hover:bg-black/80 border border-[#ffcc33]/30 text-xs text-slate-300 hover:text-white flex items-center gap-2 cursor-pointer transition shadow"
          id="back_to_menu_lb_btn"
        >
          <ArrowLeft className="w-4 h-4 text-[#ffcc33]" />
          Back to Sanctum
        </button>

        <h2 className="text-sm font-mono text-[#ffcc33]/80 uppercase tracking-widest flex items-center gap-2 font-serif">
          <Trophy className="w-4 h-4 text-[#ffcc33]" />
          Sovereign Hall of Records
        </h2>
      </div>

      {/* CORE DISPLAY COLUMNS */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFTSIDE: LEADERBOARD LIST (7/12 width) */}
        <div className="md:col-span-7 bg-black/55 backdrop-blur-md border border-[#ffcc33]/25 rounded-3xl p-5 flex flex-col">
          <h3 className="text-xs font-mono text-[#ffcc33]/70 uppercase tracking-widest mb-4">
            Legendary spirits Records
          </h3>

          <div className="flex flex-col gap-2.5 font-sans">
            {allTimeRecords.map((item, index) => (
              <div
                key={item.name + index}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs transition ${
                  item.isPlayer
                    ? 'bg-[#ffcc33]/10 border-[#ffcc33]/45 text-[#ffcc33] font-bold animate-pulse'
                    : 'bg-black/35 border-[#ffcc33]/10 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-5.5 h-5.5 rounded-md flex items-center justify-center font-mono text-[10px] font-bold ${
                    index === 0 ? 'bg-[#ffcc33] text-black' :
                    index === 1 ? 'bg-slate-300 text-black' :
                    index === 2 ? 'bg-amber-700 text-white' :
                    'bg-black/60 text-slate-400 border border-white/5'
                  }`}>
                    #{index + 1}
                  </span>
                  <span className="font-sans tracking-tight">{item.name}</span>
                </div>
                
                <div className="flex items-center gap-3 font-mono">
                  <span className="text-[9px] text-white/40 uppercase">{item.difficulty}</span>
                  <span className="text-white font-bold">{item.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHTSIDE: YOUR STATS & FLIGHT STRATEGY GUIDE (5/12 width) */}
        <div className="md:col-span-5 flex flex-col gap-5">
          
          {/* PERSONAL BEST CORNER */}
          <div className="bg-black/55 backdrop-blur-md border border-[#ffcc33]/25 rounded-3xl p-5">
            <h3 className="text-xs font-mono text-[#ffcc33]/70 uppercase tracking-widest mb-4">
              Your Personal Bests
            </h3>

            <div className="flex flex-col gap-3 font-sans">
              <div className="flex justify-between items-center p-2.5 bg-black/30 rounded-xl border border-[#ffcc33]/15">
                <span className="text-xs font-bold text-slate-300">Easy Mode</span>
                <span className="text-xs font-mono font-bold text-white">{stats.highScoreEasy}</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-black/30 rounded-xl border border-[#ffcc33]/15">
                <span className="text-xs font-bold text-slate-300">Hard Mode</span>
                <span className="text-xs font-mono font-bold text-white">{stats.highScoreHard}</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-[#ffcc33]/5 rounded-xl border border-[#ffcc33]/25">
                <span className="text-xs font-bold text-[#ffcc33]">Impossible Mode</span>
                <span className="text-xs font-mono font-bold text-[#ffcc33]">{stats.highScoreImpossible}</span>
              </div>
            </div>
          </div>

          {/* ADVANCED SCORING TUTORIAL */}
          <div className="bg-black/55 backdrop-blur-md border border-[#ffcc33]/25 rounded-3xl p-5">
            <h3 className="text-xs font-mono text-[#ffcc33]/70 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#ffcc33] animate-pulse" />
              Soaring Secrets
            </h3>

            <ul className="text-slate-400 text-[11px] font-sans space-y-3.5 leading-relaxed">
              <li className="flex gap-2">
                <span className="text-[#ffcc33] font-bold">✨</span>
                <div>
                  <strong className="text-white">Close-Call Chains:</strong> Glide extremely close to pillar edges without colliding to trigger <strong>Near Miss slow-motion zoom</strong> and score huge combo points!
                </div>
              </li>
              <li className="flex gap-2">
                <span className="text-cyan-400 font-bold">🛡️</span>
                <div>
                  <strong className="text-slate-200">Shield Deflection:</strong> If you collect the amber mandala shield relic, colliding with a pillar will safely shatter the tower instead of ending your flight!
                </div>
              </li>
              <li className="flex gap-2">
                <span className="text-purple-400 font-bold">🌀</span>
                <div>
                  <strong className="text-slate-200">Lotus Multipliers:</strong> Accumulate glowing items. Combining a 2X score scroll with Close-Call Combo chains yields astronomical score records!
                </div>
              </li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
};
