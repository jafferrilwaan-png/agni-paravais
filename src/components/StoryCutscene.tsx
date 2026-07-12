/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StoryChapter, STORY_CHAPTERS } from './StoryMap';
import { AudioEngine } from '../audio';
import { 
  Sparkles, Flame, Check, Gift, ArrowRight, 
  Map, Trophy, Star, Volume2, Music 
} from 'lucide-react';
import { Skin } from '../types';

import kurinjiBg from '../assets/images/kurinji_bg_1783843688465.jpg';
import mullaiBg from '../assets/images/mullai_bg_1783843701035.jpg';
import maruthamBg from '../assets/images/marutham_bg_1783843712358.jpg';
import neithalBg from '../assets/images/neithal_bg_1783843723561.jpg';
import palaiBg from '../assets/images/palai_bg_1783843735587.jpg';

const bgMap: Record<number, string> = {
  1: kurinjiBg,
  2: mullaiBg,
  3: maruthamBg,
  4: neithalBg,
  5: palaiBg,
};

export enum CutsceneType {
  INTRO = 'INTRO',
  OUTRO = 'OUTRO',
  FINAL_ENDING = 'FINAL_ENDING'
}

interface StoryCutsceneProps {
  type: CutsceneType;
  chapterId: number;
  unlockedSkin?: Skin;
  onComplete: () => void;
}

export const StoryCutscene: React.FC<StoryCutsceneProps> = ({
  type,
  chapterId,
  unlockedSkin,
  onComplete
}) => {
  const chapter = STORY_CHAPTERS.find(c => c.id === chapterId) || STORY_CHAPTERS[0];
  const [textIndex, setTextIndex] = useState(0);
  const [showButton, setShowButton] = useState(false);

  // Play mythic soundscapes on mount or text index changes
  useEffect(() => {
    if (type === CutsceneType.INTRO) {
      // Periodic mystic bell or flute noises
      AudioEngine.playTempleBellMilestone();
      const timer = setTimeout(() => {
        AudioEngine.resume();
      }, 500);
      return () => clearTimeout(timer);
    } else if (type === CutsceneType.OUTRO) {
      AudioEngine.playScore(); // Gold bell chime
    } else if (type === CutsceneType.FINAL_ENDING) {
      AudioEngine.playScore();
      // Keep triggering soothing background temple bell
      const interval = setInterval(() => {
        AudioEngine.playTempleBellMilestone();
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [type, chapterId]);

  const introLines = chapter.poeticPrompt;
  const introLinesTamil = chapter.poeticPromptTamil;

  // Manage story text pacing
  useEffect(() => {
    if (type === CutsceneType.INTRO) {
      if (textIndex < introLines.length - 1) {
        const textTimer = setTimeout(() => {
          setTextIndex(prev => prev + 1);
        }, 3200); // Progress text lines every 3.2s
        return () => clearTimeout(textTimer);
      } else {
        setShowButton(true);
      }
    } else {
      // Instantly show button for outro/ending
      setShowButton(true);
    }
  }, [textIndex, type, introLines.length]);

  const handleNextText = () => {
    if (textIndex < introLines.length - 1) {
      setTextIndex(prev => prev + 1);
    } else {
      setShowButton(true);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        if (!showButton && type === CutsceneType.INTRO) {
          handleNextText();
        } else if (showButton) {
          onComplete();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showButton, textIndex, type, introLines.length]);

  // Flying birds animation for Final Ending
  const endingBirds = [
    { name: 'Agni Paravai', color: '#FF4F00', delay: 0, scale: 1.1, y: 30 },
    { name: 'Koel (Cuckoo)', color: '#AA00FF', delay: 0.3, scale: 0.9, y: 45 },
    { name: 'Mayil (Peacock)', color: '#0066FF', delay: 0.6, scale: 1.0, y: 25 },
    { name: 'Pon Garudan', color: '#FFD700', delay: 0.9, scale: 1.2, y: 55 },
    { name: 'Sacred Swan', color: '#FFFFFF', delay: 1.2, scale: 0.95, y: 40 },
  ];

  return (
    <div 
      className="fixed inset-0 z-[1000] flex flex-col justify-between p-6 sm:p-10 select-none bg-cover bg-center cursor-pointer overflow-hidden" 
      style={{ 
        backgroundColor: '#060200', 
        backgroundImage: `linear-gradient(to bottom, rgba(6, 2, 0, 0.98), rgba(6, 2, 0, 1)), url(${bgMap[chapterId] || ''})` 
      }}
      onClick={() => {
        if (!showButton && type === CutsceneType.INTRO) {
          handleNextText();
        }
      }}
    >
      {/* Background Parallax Overlay with glowing embers and sacred mandala */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-[#060200] opacity-100" />
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-red-600/10 to-orange-500/0 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-amber-500/10 to-yellow-500/0 blur-3xl" />
        
        {/* Sacred Geometry Mandala Outline */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full border border-dashed border-[#ffcc33]/5 animate-spin-slow opacity-60" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full border border-dashed border-[#ff6600]/5 animate-reverse-spin opacity-40" />
      </div>

      {/* HEADER NARRATIVE STAMP */}
      <div className="text-center pt-10 relative z-20">
        <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-black/80 border border-[#ffcc33]/30 text-[#ffcc33] text-[10px] sm:text-xs font-mono uppercase tracking-[0.3em] mb-3 shadow-2xl">
          <Flame className="w-3.5 h-3.5 animate-pulse text-orange-500" />
          The Legend of Agni Paravai
        </span>
        <h2 className="text-[10px] sm:text-sm font-mono uppercase tracking-[0.5em] text-amber-500/90 mt-2">
          {type === CutsceneType.INTRO && `ACT ${chapter.id} — AWAKENING`}
          {type === CutsceneType.OUTRO && `ACT ${chapter.id} — LAND RECOVERED`}
          {type === CutsceneType.FINAL_ENDING && `FINAL ACT — RESTORATION`}
        </h2>
      </div>

      {/* CORE CONTENT BLOCK */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full relative z-20 text-center px-6 py-12">
           {/* --- INTRO SCENE VIEW --- */}
        {type === CutsceneType.INTRO && (
          <div className="space-y-10 w-full flex flex-col items-center justify-center">
            
            {/* WIDESCREEN CINEMATIC THEATER WINDOW */}
            <div className="w-full max-w-2xl h-44 sm:h-64 rounded-[2.5rem] border border-amber-400/40 bg-slate-950/95 relative overflow-hidden shadow-[0_0_60px_rgba(0,0,0,1)] flex items-center justify-center group">
              <div className="absolute inset-0 bg-gradient-to-t from-orange-500/5 to-transparent pointer-events-none" />
              {/* Dynamic Widescreen Letterboxing bars */}
              <div className="absolute top-0 inset-x-0 h-4 sm:h-6 bg-black z-30" />
              <div className="absolute bottom-0 inset-x-0 h-4 sm:h-6 bg-black z-30" />
              
              {/* LAND THEMED CINEMATIC BACKGROUNDS */}
              {chapter.id === 1 && (
                <>
                  {/* Kurinji Mountain Silhouette & Mystic Moon */}
                  <div className="absolute inset-0 bg-gradient-to-b from-purple-950/50 via-slate-900 to-slate-950" />
                  <div className="absolute top-4 right-12 w-14 h-14 rounded-full bg-indigo-200/90 shadow-[0_0_25px_rgba(165,180,252,0.5)] flex items-center justify-center" />
                  <div className="absolute bottom-3 left-0 right-0 h-10 bg-indigo-950/40 clip-mountain-1" style={{ clipPath: 'polygon(0% 100%, 15% 40%, 35% 80%, 55% 30%, 75% 75%, 100% 100%)' }} />
                  <div className="absolute bottom-3 left-0 right-0 h-8 bg-purple-900/40 clip-mountain-2" style={{ clipPath: 'polygon(0% 100%, 25% 50%, 50% 75%, 70% 40%, 90% 70%, 100% 100%)' }} />
                </>
              )}
              {chapter.id === 2 && (
                <>
                  {/* Mullai Emerald Canopy & Forest Glow */}
                  <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/50 via-slate-900 to-slate-950" />
                  <div className="absolute top-6 left-1/3 w-12 h-12 rounded-full bg-emerald-300/40 shadow-[0_0_30px_rgba(52,211,153,0.3)]" />
                  <div className="absolute bottom-3 left-0 right-0 h-10 bg-emerald-900/30 clip-canopy" style={{ clipPath: 'polygon(0% 100%, 10% 70%, 20% 80%, 35% 65%, 50% 85%, 65% 70%, 80% 85%, 100% 100%)' }} />
                </>
              )}
              {chapter.id === 3 && (
                <>
                  {/* Marutham Golden Agricultural Fields & Sun */}
                  <div className="absolute inset-0 bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950" />
                  <div className="absolute top-4 right-1/4 w-14 h-14 rounded-full bg-amber-400/80 shadow-[0_0_35px_rgba(245,158,11,0.5)]" />
                  <div className="absolute bottom-3 left-0 right-0 h-6 bg-amber-600/20" />
                  <div className="absolute bottom-3 left-0 right-0 h-4 bg-yellow-600/30" />
                </>
              )}
              {chapter.id === 4 && (
                <>
                  {/* Neithal Deep Sea Horizon & Starry Sky */}
                  <div className="absolute inset-0 bg-gradient-to-b from-blue-950/50 via-slate-900 to-slate-950" />
                  <div className="absolute top-4 left-12 w-10 h-10 rounded-full bg-sky-100/90 shadow-[0_0_20px_rgba(186,230,253,0.4)]" />
                  <div className="absolute bottom-3 left-0 right-0 h-8 bg-blue-900/30" />
                </>
              )}
              {chapter.id === 5 && (
                <>
                  {/* Palai Desert Dunes & Heat Embers */}
                  <div className="absolute inset-0 bg-gradient-to-b from-orange-950/50 via-slate-900 to-slate-950" />
                  <div className="absolute top-6 right-1/3 w-12 h-12 rounded-full bg-orange-500/50 shadow-[0_0_30px_rgba(249,115,22,0.4)]" />
                  <div className="absolute bottom-3 left-0 right-0 h-8 bg-orange-900/20 clip-dune" style={{ clipPath: 'polygon(0% 100%, 30% 60%, 70% 85%, 100% 60%, 100% 100%)' }} />
                </>
              )}

              {/* FLOATING ATMOSPHERIC PARTICLES */}
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={`ember-${i}`}
                  initial={{ 
                    x: Math.random() * 300 + 50, 
                    y: Math.random() * 100 + 40, 
                    opacity: 0 
                  }}
                  animate={{ 
                    x: [null, '-20%'], 
                    y: [null, '30%', '-20%'],
                    opacity: [0, 0.8, 0.8, 0] 
                  }}
                  transition={{ 
                    duration: 4 + Math.random() * 3, 
                    repeat: Infinity, 
                    delay: i * 0.4,
                    ease: "linear" 
                  }}
                  className="absolute w-1.5 h-1.5 rounded-full"
                  style={{ 
                    backgroundColor: chapter.id === 1 ? '#c084fc' : (chapter.id === 2 ? '#34d399' : (chapter.id === 3 ? '#fbbf24' : (chapter.id === 4 ? '#38bdf8' : '#f97316'))),
                    boxShadow: '0 0 8px currentColor'
                  }}
                />
              ))}

              {/* CINEMATIC BIRD FLYING ACROSS SCREEN */}
              <motion.div
                initial={{ x: -80, y: 80 }}
                animate={{ 
                  x: ['-10%', '115%'],
                  y: [80, 50, 90, 60]
                }}
                transition={{ 
                  duration: 8.5, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="absolute left-0 flex flex-col items-center pointer-events-none"
              >
                <div className="flex items-center gap-1.5 bg-black/45 border border-white/5 rounded-full px-2 py-1 shadow-md">
                  {/* Detailed procedural vector bird */}
                  <div className="relative w-5 h-5 flex items-center justify-center">
                    <div 
                      className="w-4 h-4 rounded-full relative"
                      style={{ 
                        backgroundColor: '#FF4F00',
                        boxShadow: '0 0 12px #FF4F00'
                      }}
                    >
                      {/* Flapping wings */}
                      <motion.div 
                        animate={{ rotate: [-35, 35, -35] }}
                        transition={{ duration: 0.28, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute w-5 h-1 right-1/2 top-1.5 origin-right rounded-full bg-gradient-to-l from-orange-500 to-yellow-300"
                      />
                      <motion.div 
                        animate={{ rotate: [35, -35, 35] }}
                        transition={{ duration: 0.28, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute w-5 h-1 left-1/2 top-1.5 origin-left rounded-full bg-gradient-to-r from-orange-500 to-yellow-300"
                      />
                    </div>
                  </div>
                  <span className="text-[7.5px] font-mono font-bold tracking-widest text-amber-300 uppercase animate-pulse">AGNI PARAVAI</span>
                </div>

                {/* Floating falling feather trails */}
                {Array.from({ length: 3 }).map((_, idx) => (
                  <motion.div
                    key={`trail-f-${idx}`}
                    initial={{ opacity: 0, x: 0, y: 0 }}
                    animate={{ 
                      opacity: [1, 0],
                      x: [-15 - idx * 5, -30 - idx * 10],
                      y: [5 + idx * 4, 15 + idx * 8]
                    }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: idx * 0.3 }}
                    className="absolute w-1 h-1 bg-amber-400 rounded-full"
                  />
                ))}
              </motion.div>

              {/* Theater Soundtrack Watermark */}
              <div className="absolute top-2 right-3 flex items-center gap-1.5 text-[8.5px] font-mono text-[#ffcc33]/65 z-20">
                <Music className="w-3 h-3 text-amber-400 animate-pulse" />
                <span>NARRATIVE CINEMATIC {chapter.id} ACTIVE</span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`text-${textIndex}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 1.0 }}
                className="space-y-4"
              >
                <p className="text-lg sm:text-xl md:text-2xl font-serif text-white/95 leading-relaxed tracking-wide text-center px-2">
                  "{introLines[textIndex]}"
                </p>
                <p className="text-xs sm:text-sm text-amber-400/85 font-sans leading-relaxed italic text-center px-4">
                  "{introLinesTamil[textIndex]}"
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Click to fast-forward cues */}
            {!showButton && (
              <button 
                onClick={handleNextText}
                className="text-[9px] font-mono text-[#ffcc33]/45 hover:text-[#ffcc33] tracking-widest uppercase cursor-pointer transition py-1"
              >
                [ Space / Click to progress story ]
              </button>
            )}
          </div>
        )}

        {/* --- OUTRO PURIFICATION VIEW --- */}
        {type === CutsceneType.OUTRO && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2 }}
            className="space-y-5 sm:space-y-6 w-full"
          >
            {/* Purification title stamp */}
            <div className="relative inline-block mb-2">
              <div className="absolute -inset-2 rounded-full bg-amber-500/10 blur-xl animate-pulse" />
              <h3 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 uppercase tracking-wide">
                Land Purified!
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-emerald-400 mt-1">
                {chapter.nameTamil} மீட்கப்பட்டது!
              </p>
            </div>

            {/* Outro text */}
            <div className="p-4 sm:p-5 rounded-2xl bg-black/45 border border-[#ffcc33]/20 shadow-xl space-y-3">
              <p className="text-xs sm:text-sm text-[#fff8e1]/95 leading-relaxed italic">
                "The corrupted guardian is purified! Harmony returns to {chapter.name.split(' ')[0]}. The shadow retreats, and the guardian slumbers peacefully once more."
              </p>
              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#ffcc33]/50 to-transparent mx-auto" />
              <p className="text-[11px] text-[#ffcc33]/70 leading-relaxed italic">
                "{chapter.guardianTamil} தூய்மைப்படுத்தப்பட்டு, மீண்டும் சாந்த நிலையை அடைந்துள்ளார். இயற்கை சமநிலை திரும்பியது."
              </p>
            </div>

            {/* Rewards Reveal Showcase */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
              
              {/* Unlocked Bird skin */}
              {unlockedSkin && (
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-950/40 to-emerald-900/10 border border-emerald-500/20 text-center flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-8 h-8 bg-emerald-500/10 rounded-full blur-lg" />
                  <Sparkles className="w-5 h-5 text-emerald-400 mb-1 animate-bounce" />
                  <div className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest">New Bird Unlocked</div>
                  <div className="text-xs font-bold text-white uppercase mt-0.5 truncate max-w-full">
                    {unlockedSkin.name.split(' (')[0]}
                  </div>
                  <div className="text-[9px] text-[#ffcc33]/60 truncate max-w-full italic mt-0.5">
                    Equip in Avian Sanctum
                  </div>
                </div>
              )}

              {/* Bonus feathers */}
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-950/40 to-amber-900/10 border border-amber-500/20 text-center flex flex-col items-center justify-center">
                <Gift className="w-5 h-5 text-amber-400 mb-1 animate-pulse" />
                <div className="text-[9px] font-mono text-amber-400 tracking-widest uppercase">Completion Tribute</div>
                <div className="text-sm font-black text-white mt-0.5">
                  🪶 +{chapter.rewardFeathers} Feathers
                </div>
                <div className="text-[9px] text-[#ffcc33]/60 italic mt-0.5">
                  Tribute of {chapter.name.split(' ')[0]}
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* --- FINAL ENDING CINEMATIC VIEW --- */}
        {type === CutsceneType.FINAL_ENDING && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="space-y-6 sm:space-y-8 w-full"
          >
            {/* Glorious cinematic ending layout */}
            <div className="relative inline-block">
              <h3 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-[#ff6a00] to-yellow-500 tracking-tight uppercase leading-none drop-shadow-[0_4px_10px_rgba(255,106,0,0.3)]">
                The Sky is Restored!
              </h3>
              <p className="text-sm font-semibold text-amber-400 font-sans tracking-widest uppercase mt-2">
                முழுமையான நில மீட்பு (Ultimate Harmony)
              </p>
            </div>

            {/* Flying birds cinematic canvas-simulation */}
            <div className="w-full h-40 sm:h-48 rounded-2xl border border-[#ffcc33]/15 bg-black/40 relative overflow-hidden shadow-inner flex items-center justify-center">
              {/* Background mountain silhouette in canvas */}
              <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-stone-900 to-transparent" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(255,204,51,0.06)_0%,transparent_60%)]" />
              
              {/* Floating golden sun */}
              <div className="absolute bottom-4 w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-500 to-amber-300 shadow-[0_0_25px_rgba(255,204,51,0.4)]" />

              {/* BIRDS FLYING TOGETHER ANIME */}
              {endingBirds.map((bird, idx) => (
                <motion.div
                  key={`ending-bird-${idx}`}
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ 
                    x: ['-20%', '120%'], 
                    opacity: [0, 1, 1, 0],
                    y: [bird.y - 10, bird.y + 10, bird.y - 10]
                  }}
                  transition={{ 
                    duration: 7, 
                    repeat: Infinity, 
                    delay: bird.delay,
                    ease: "easeInOut" 
                  }}
                  className="absolute left-0 flex flex-col items-center pointer-events-none"
                  style={{ top: `${bird.y}%` }}
                >
                  {/* Styled minimalist wing flapping avatar */}
                  <div className="flex items-center gap-1">
                    <div 
                      className="w-3.5 h-3.5 rounded-full relative" 
                      style={{ 
                        backgroundColor: bird.color, 
                        boxShadow: `0 0 10px ${bird.color}`,
                        transform: `scale(${bird.scale})` 
                      }}
                    >
                      {/* Left wing */}
                      <motion.div 
                        animate={{ rotate: [-40, 45, -40] }}
                        transition={{ duration: 0.25, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute w-4 h-1 right-1/2 top-1.5 origin-right rounded-full"
                        style={{ backgroundColor: bird.color }}
                      />
                      {/* Right wing */}
                      <motion.div 
                        animate={{ rotate: [40, -45, 40] }}
                        transition={{ duration: 0.25, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute w-4 h-1 left-1/2 top-1.5 origin-left rounded-full"
                        style={{ backgroundColor: bird.color }}
                      />
                    </div>
                    <span className="text-[7px] font-mono tracking-widest uppercase text-white/60 bg-black/50 px-1 py-0.5 rounded border border-white/5">
                      {bird.name.split(' (')[0]}
                    </span>
                  </div>
                </motion.div>
              ))}

              <div className="absolute top-2 right-3 flex items-center gap-1 text-[8px] font-mono text-[#ffcc33]/60">
                <Music className="w-3 h-3 text-[#ffcc33]/80 animate-pulse" />
                <span>Veena & Mridangam Duet</span>
              </div>
            </div>

            {/* Ending Poetic Text */}
            <div className="space-y-4 max-w-lg mx-auto bg-black/35 p-4 rounded-xl border border-[#ffcc33]/10">
              <p className="text-xs sm:text-sm md:text-base text-stone-200 leading-relaxed font-medium">
                “All five lands of Ainthinai are healed from darkness. The guardians are purified, the temple bells ring in full celebration, and the celestial birds fly in perfect unity.”
              </p>
              <p className="text-[11px] text-amber-300/80 italic font-sans leading-relaxed">
                “ஐந்து நிலங்களும் இருளிலிருந்து மீட்கப்பட்டன. கோவில் மணிகள் முழங்குகின்றன, பறவைகள் விண்ணில் ஒன்றிணைந்து பறக்கின்றன. சமநிலை திரும்பியது... பயணம் தொடரும்!”
              </p>
              <div className="text-xs font-serif font-black tracking-widest text-[#ffcc33] pt-1">
                “BALANCE RETURNS… BUT THE JOURNEY NEVER ENDS.”
              </div>
            </div>
          </motion.div>
        )}

      </div>

      {/* FOOTER ACTION CONTROL */}
      <div className="w-full text-center pb-6 pt-2 relative z-10">
        <AnimatePresence>
          {showButton && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              onClick={onComplete}
              className="px-8 py-3.5 sm:px-12 sm:py-4 bg-gradient-to-r from-[#ffcc33] via-[#ff6a00] to-[#ff3300] hover:from-[#ffd13b] hover:to-[#ff5500] text-black font-black font-sans text-xs sm:text-sm uppercase tracking-widest rounded-xl shadow-xl shadow-orange-500/20 hover:scale-[1.03] active:scale-[0.97] transition flex items-center justify-center gap-2 mx-auto cursor-pointer border border-white/20"
              id="cutscene_continue_btn"
            >
              <span>
                {type === CutsceneType.INTRO && 'வளர்க (Begin Flight)'}
                {type === CutsceneType.OUTRO && 'அடுத்த பகுதி (Proceed to Map)'}
                {type === CutsceneType.FINAL_ENDING && 'பயணம் முடிந்தது (Return to Map)'}
              </span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};
