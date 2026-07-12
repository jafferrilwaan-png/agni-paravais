/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameState, Skin, GameStats, WeatherType } from '../types';
import { AudioEngine } from '../audio';
import { ArrowLeft, Sparkles, Flame, Check, Lock, Shield, Zap, Magnet } from 'lucide-react';

import kurinjiBg from '../assets/images/kurinji_bg_1783843688465.jpg';
import mullaiBg from '../assets/images/mullai_bg_1783843701035.jpg';
import maruthamBg from '../assets/images/marutham_bg_1783843712358.jpg';
import neithalBg from '../assets/images/neithal_bg_1783843723561.jpg';
import palaiBg from '../assets/images/palai_bg_1783843735587.jpg';

interface SkinSelectorProps {
  skins: Skin[];
  stats: GameStats;
  onUnlockSkin: (skinId: string, cost: number) => void;
  onEquipSkin: (skinId: string) => void;
  onStateChange: (state: GameState) => void;
  onUpdateStats?: (updated: GameStats) => void;
}

export const SkinSelector: React.FC<SkinSelectorProps> = ({
  skins,
  stats,
  onUnlockSkin,
  onEquipSkin,
  onStateChange,
  onUpdateStats,
}) => {
  const [activeTab, setActiveTab] = useState<'skins' | 'upgrades'>('skins');
  const [selectedId, setSelectedId] = useState(stats.selectedSkinId);
  const [selectedUpgradeId, setSelectedUpgradeId] = useState<string>('passive_attack');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

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

  const selectedSkin = skins.find(s => s.id === selectedId) || skins[0];

  const BACKGROUND_IMAGES = {
    [WeatherType.KURINJI]: kurinjiBg,
    [WeatherType.MULLAI]: mullaiBg,
    [WeatherType.MARUTHAM]: maruthamBg,
    [WeatherType.NEITHAL]: neithalBg,
    [WeatherType.PALAI]: palaiBg
  };

  const currentBg = BACKGROUND_IMAGES[stats.selectedWeather] || BACKGROUND_IMAGES[WeatherType.KURINJI];

  const upgrades = [
    {
      id: 'shield' as const,
      name: 'Shield of Shiva',
      description: 'Generates an atmospheric protective shield that deflects pillar collisions and high-energy laser traps.',
      icon: Shield,
      maxLevel: 5,
      currentLevel: stats.upgradeShieldLevel || 0,
      baseBenefit: 'Unlocks divine light shield protection',
      nextBenefit: (level: number) => `Extends shield duration by +${((level + 1) * 1.5).toFixed(1)}s`,
      cost: (level: number) => (level >= 5 ? 0 : 25 * (level + 1)),
      statKey: 'upgradeShieldLevel' as const,
    },
    {
      id: 'boost' as const,
      name: 'Vayu’s Swiftness',
      description: 'Supercharges flight acceleration thruster capacity and extends hyper-boost glide distance.',
      icon: Zap,
      maxLevel: 5,
      currentLevel: stats.upgradeBoostLevel || 0,
      baseBenefit: 'Unlocks divine flight acceleration speed',
      nextBenefit: (level: number) => `Extends boost duration by +${((level + 1) * 1.2).toFixed(1)}s`,
      cost: (level: number) => (level >= 5 ? 0 : 30 * (level + 1)),
      statKey: 'upgradeBoostLevel' as const,
    },
    {
      id: 'magnet' as const,
      name: 'Siddhar’s Attractor',
      description: 'Spiritual magnetic force fields that automatically pull nearby sacred feathers and floating soul fragments.',
      icon: Magnet,
      maxLevel: 5,
      currentLevel: stats.upgradeMagnetLevel || 0,
      baseBenefit: 'Unlocks dynamic fragment magnet attraction',
      nextBenefit: (level: number) => `Increases pull range by +${(level + 1) * 55} pixels`,
      cost: (level: number) => (level >= 5 ? 0 : 35 * (level + 1)),
      statKey: 'upgradeMagnetLevel' as const,
    },
  ];

  const selectedUpgrade = upgrades.find(u => u.id === selectedUpgradeId) || upgrades[0];

  const handleBackClick = () => {
    AudioEngine.playButton();
    onStateChange(GameState.MENU);
  };

  const handleSelectSkin = (id: string) => {
    setSelectedId(id);
    AudioEngine.playButton();
  };

  const handleSelectUpgrade = (id: string) => {
    setSelectedUpgradeId(id);
    AudioEngine.playButton();
  };

  const handleEquipClick = () => {
    AudioEngine.playButton();
    onEquipSkin(selectedSkin.id);
  };

  const handleUnlockClick = () => {
    if (stats.feathersCount >= selectedSkin.cost) {
      onUnlockSkin(selectedSkin.id, selectedSkin.cost);
      AudioEngine.playCollect();
    } else {
      AudioEngine.playCrash();
    }
  };

  const handleBuyUpgrade = () => {
    if (!onUpdateStats) return;
    const cost = selectedUpgrade.cost(selectedUpgrade.currentLevel);
    if (stats.feathersCount >= cost && selectedUpgrade.currentLevel < selectedUpgrade.maxLevel) {
      const nextStats = {
        ...stats,
        feathersCount: stats.feathersCount - cost,
        [selectedUpgrade.statKey]: (stats[selectedUpgrade.statKey as keyof GameStats] as number || 0) + 1,
      };
      onUpdateStats(nextStats);
      AudioEngine.playCollect();
    } else {
      AudioEngine.playCrash();
    }
  };

  // Draw the animated skin preview in a mini 2D Canvas!
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    let animationId: number;

    const drawPreview = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Draw glowing circular background
      const radGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, 70);
      radGrad.addColorStop(0, `${selectedSkin.glowColor}`);
      radGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 80, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.translate(cx, cy + Math.sin(frame * 0.05) * 8); // gentle bobbing

      ctx.shadowBlur = 20;
      ctx.shadowColor = selectedSkin.color;

      const wingAngle = Math.sin(frame * 0.1) * (Math.PI / 5);

      if (selectedSkin.type === 'phoenix' || selectedSkin.id === 'rudra') {
        // Tail Plumes
        ctx.save();
        ctx.lineWidth = 3;
        ctx.strokeStyle = selectedSkin.trailColor;
        const waveOffset = Math.sin(frame * 0.07) * 4;
        
        [-0.15, 0, 0.15].forEach((angle, idx) => {
          ctx.save();
          ctx.rotate(angle);
          ctx.beginPath();
          ctx.moveTo(-10, waveOffset * (idx - 1));
          ctx.quadraticCurveTo(-22, -8 + waveOffset, -38, -5 + (idx * 4) + waveOffset);
          ctx.stroke();

          ctx.fillStyle = selectedSkin.color;
          ctx.beginPath();
          ctx.arc(-38, -5 + (idx * 4) + waveOffset, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
        ctx.restore();

        // Main bird body
        ctx.fillStyle = selectedSkin.color;
        ctx.beginPath();
        ctx.moveTo(18, 0);
        ctx.quadraticCurveTo(0, -14, -15, 0);
        ctx.quadraticCurveTo(0, 14, 18, 0);
        ctx.fill();

        ctx.fillStyle = '#fff8e1';
        ctx.beginPath();
        ctx.moveTo(18, 0);
        ctx.quadraticCurveTo(8, -6, 2, 0);
        ctx.quadraticCurveTo(8, 6, 18, 0);
        ctx.fill();

        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.moveTo(17, -3);
        ctx.lineTo(25, 1);
        ctx.lineTo(17, 4);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(10, -4, 2, 0, Math.PI * 2);
        ctx.fill();

        // Flapping wings
        ctx.save();
        ctx.rotate(wingAngle);
        const wingGrad = ctx.createLinearGradient(0, 0, -8, -35);
        wingGrad.addColorStop(0, selectedSkin.color);
        wingGrad.addColorStop(0.5, selectedSkin.trailColor);
        wingGrad.addColorStop(1, '#ffffff');
        ctx.fillStyle = wingGrad;
        ctx.beginPath();
        ctx.moveTo(-5, 0);
        ctx.bezierCurveTo(-15, -15, -8, -35, 5, -30);
        ctx.bezierCurveTo(0, -15, 2, -5, -5, 0);
        ctx.fill();
        ctx.restore();

      } else if (selectedSkin.type === 'garuda') {
        // Golden Eagle wings
        ctx.save();
        ctx.lineWidth = 3;
        ctx.strokeStyle = selectedSkin.trailColor;
        const waveOffset = Math.sin(frame * 0.07) * 4;
        
        [-0.15, 0, 0.15].forEach((angle, idx) => {
          ctx.save();
          ctx.rotate(angle);
          ctx.beginPath();
          ctx.moveTo(-10, waveOffset * (idx - 1));
          ctx.quadraticCurveTo(-22, -8 + waveOffset, -38, -5 + (idx * 4) + waveOffset);
          ctx.stroke();

          ctx.fillStyle = selectedSkin.color;
          ctx.beginPath();
          ctx.arc(-38, -5 + (idx * 4) + waveOffset, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
        ctx.restore();

        // Body
        ctx.fillStyle = selectedSkin.color;
        ctx.beginPath();
        ctx.moveTo(18, 0);
        ctx.quadraticCurveTo(0, -14, -15, 0);
        ctx.quadraticCurveTo(0, 14, 18, 0);
        ctx.fill();

        // Flapping wings
        ctx.save();
        ctx.rotate(wingAngle);
        ctx.fillStyle = selectedSkin.color;
        ctx.beginPath();
        ctx.moveTo(-5, 0);
        ctx.bezierCurveTo(-15, -15, -8, -35, 5, -30);
        ctx.bezierCurveTo(0, -15, 2, -5, -5, 0);
        ctx.fill();
        ctx.restore();
      } else if (selectedSkin.type === 'drone') {
        ctx.fillStyle = '#1e1e38';
        ctx.strokeStyle = selectedSkin.color;
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = selectedSkin.color;
        ctx.beginPath();
        ctx.arc(-8, 0, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ff0055';
        ctx.beginPath();
        ctx.arc(12, 0, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        ctx.strokeStyle = selectedSkin.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -20);
        ctx.lineTo(Math.cos(wingAngle) * -12, -32);
        ctx.moveTo(0, 20);
        ctx.lineTo(Math.cos(wingAngle) * -12, 32);
        ctx.stroke();
        ctx.restore();

      } else if (selectedSkin.type === 'spirit') {
        const rGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, 22);
        rGrad.addColorStop(0, '#ffffff');
        rGrad.addColorStop(0.4, selectedSkin.color);
        rGrad.addColorStop(1, 'rgba(213,0,249,0)');
        ctx.fillStyle = rGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 26, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 3; i++) {
          const orbitAngle = frame * 0.08 + (i * Math.PI * 2 / 3);
          ctx.beginPath();
          ctx.arc(Math.cos(orbitAngle) * 11, Math.sin(orbitAngle) * 11, 2.5, 0, Math.PI * 2);
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
          ctx.quadraticCurveTo(-25, -12, -40, 0);
          ctx.strokeStyle = '#0066FF';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Peacock eyespot
          ctx.fillStyle = '#00E676';
          ctx.beginPath();
          ctx.arc(-40, 0, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#0066FF';
          ctx.beginPath();
          ctx.arc(-40, 0, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        ctx.restore();

        // Peacock body
        ctx.fillStyle = selectedSkin.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 11, 0, 0, Math.PI * 2);
        ctx.fill();

        // Peacock crest
        ctx.strokeStyle = selectedSkin.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(8, -10);
        ctx.lineTo(12, -18);
        ctx.stroke();
        ctx.fillStyle = '#00E676';
        ctx.beginPath();
        ctx.arc(12, -18, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Eye & Beak
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(10, -3, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.moveTo(17, -2);
        ctx.lineTo(24, 1);
        ctx.lineTo(17, 4);
        ctx.closePath();
        ctx.fill();

        // Wings
        ctx.save();
        ctx.rotate(wingAngle);
        ctx.fillStyle = '#00E676';
        ctx.beginPath();
        ctx.moveTo(-5, 0);
        ctx.bezierCurveTo(-15, -12, -8, -32, 5, -28);
        ctx.bezierCurveTo(0, -12, 2, -5, -5, 0);
        ctx.fill();
        ctx.restore();

      } else if (selectedSkin.type === 'sparrow') {
        // Kuruvi (Sparrow) - Tiny body, very cute
        ctx.fillStyle = selectedSkin.color;
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2); // smaller radius
        ctx.fill();

        // Cute face details
        ctx.fillStyle = '#5d4037';
        ctx.beginPath();
        ctx.arc(-4, -2, 10, -0.5, 1.2);
        ctx.fill();

        // Beak & Eye
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.moveTo(10, -1);
        ctx.lineTo(16, 1);
        ctx.lineTo(10, 3);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(5, -3, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Tail
        ctx.strokeStyle = selectedSkin.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-10, 2);
        ctx.lineTo(-24, 6);
        ctx.moveTo(-10, -2);
        ctx.lineTo(-24, -2);
        ctx.stroke();

        // Tiny wings flapping
        ctx.save();
        ctx.rotate(wingAngle * 1.4); // faster wing movement
        ctx.fillStyle = selectedSkin.trailColor;
        ctx.beginPath();
        ctx.moveTo(-2, 0);
        ctx.bezierCurveTo(-10, -8, -5, -24, 3, -20);
        ctx.bezierCurveTo(0, -8, 1, -4, -2, 0);
        ctx.fill();
        ctx.restore();

      } else if (selectedSkin.type === 'yali') {
        // Yali Spirit Bird - Crested lion-head/dragon aesthetic with fiery sparks
        const rGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, 20);
        rGrad.addColorStop(0, '#ffffff');
        rGrad.addColorStop(0.3, selectedSkin.color);
        rGrad.addColorStop(1, 'rgba(224,64,251,0)');
        ctx.fillStyle = rGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 25, 0, Math.PI * 2);
        ctx.fill();

        // Draw Yali horn/crest
        ctx.strokeStyle = '#FF3D00';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(6, -10);
        ctx.quadraticCurveTo(15, -22, 22, -15);
        ctx.stroke();

        // Main Head body
        ctx.fillStyle = selectedSkin.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, 16, 13, 0, 0, Math.PI * 2);
        ctx.fill();

        // Glowing red eyes
        ctx.fillStyle = '#FF3D00';
        ctx.shadowColor = '#FF3D00';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(8, -3, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Tail spikes
        ctx.fillStyle = '#FF3D00';
        ctx.beginPath();
        ctx.moveTo(-12, 0);
        ctx.lineTo(-26, -8);
        ctx.lineTo(-20, 0);
        ctx.lineTo(-26, 8);
        ctx.closePath();
        ctx.fill();

        // Spectral wings
        ctx.save();
        ctx.rotate(wingAngle);
        ctx.fillStyle = 'rgba(255, 61, 0, 0.7)';
        ctx.beginPath();
        ctx.moveTo(-3, 0);
        ctx.bezierCurveTo(-12, -15, -6, -32, 6, -26);
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();
      animationId = requestAnimationFrame(drawPreview);
    };

    drawPreview();
    return () => cancelAnimationFrame(animationId);
  }, [selectedSkin]);

  const canUnlock = stats.feathersCount >= selectedSkin.cost;
  const currentUpgradeCost = selectedUpgrade.cost(selectedUpgrade.currentLevel);
  const canBuyUpgrade = stats.feathersCount >= currentUpgradeCost && selectedUpgrade.currentLevel < selectedUpgrade.maxLevel;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full min-h-screen mx-auto flex flex-col gap-10 p-6 md:p-12 md:py-24 font-serif justify-start items-center relative" 
      id="skins_selector_panel"
    >
      {/* Dynamic Background Image (Matching Main Menu) */}
      <div 
        className="fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat transition-all duration-700 ease-out"
        style={{ 
          backgroundImage: `url(${currentBg})`,
          transform: `scale(1.1) translate(${mousePos.x * -12}px, ${mousePos.y * -12}px)`,
        }}
      />
      <div className="fixed inset-0 -z-10 bg-black/65 backdrop-blur-[3px]" />
      
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between border-b border-[#ffcc33]/20 pb-6 relative z-20 w-full">
        <button
          onClick={handleBackClick}
          className="px-5 py-2.5 rounded-2xl bg-black/70 hover:bg-black/90 border border-[#ffcc33]/40 text-xs text-slate-200 hover:text-white flex items-center gap-3 cursor-pointer transition-all shadow-xl hover:scale-105 active:scale-95 group"
          id="back_to_menu_btn"
        >
          <ArrowLeft className="w-4 h-4 text-[#ffcc33] group-hover:-translate-x-1 transition-transform" />
          <span className="font-sans font-bold tracking-wider uppercase">Back to Sanctum</span>
        </button>

        {/* TABS SELECTOR */}
        <div className="flex bg-black/60 backdrop-blur-xl border border-[#ffcc33]/25 rounded-[1.25rem] p-1.5 font-sans text-xs shadow-2xl relative">
          <button
            onClick={() => { AudioEngine.playButton(); setActiveTab('skins'); }}
            className={`px-6 py-2 rounded-xl font-black transition-all cursor-pointer relative z-10 ${
              activeTab === 'skins'
                ? 'bg-[#ffcc33] text-black shadow-[0_0_20px_rgba(255,204,51,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Avian Skins
          </button>
          <button
            onClick={() => { AudioEngine.playButton(); setActiveTab('upgrades'); }}
            className={`px-6 py-2 rounded-xl font-black transition-all cursor-pointer relative z-10 ${
              activeTab === 'upgrades'
                ? 'bg-[#ffcc33] text-black shadow-[0_0_20px_rgba(255,204,51,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Spiritual Upgrades
          </button>
        </div>

        <div className="text-right hidden sm:block">
          <div className="text-[10px] font-mono text-[#ffcc33]/60 uppercase tracking-[0.3em] font-black">Soul Fragments</div>
          <div className="text-xl font-black font-sans text-white flex items-center justify-end gap-2">
            <span className="text-[#ffcc33]">🪶</span>
            {stats.feathersCount}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* SKIN TAB ACTIVE */}
        {activeTab === 'skins' ? (
          <motion.div 
            key="skins-tab"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch flex-1 w-full relative z-10"
          >
            
            {/* LEFTSIDE: VERTICAL SKINS LIST (5/12 width) */}
            <div className="md:col-span-5 flex flex-col gap-4 font-sans">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-[10px] font-mono text-[#ffcc33]/80 uppercase tracking-[0.4em] font-black">
                  Choose Avian Avatar
                </h3>
                <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">{skins.length} Presets</span>
              </div>

              <div className="flex flex-col gap-3 max-h-[420px] overflow-y-auto pr-3 custom-scrollbar scroll-indicator-mask">
                {skins.map(skin => {
                  const isSelected = skin.id === selectedId;
                  const isEquipped = skin.id === stats.selectedSkinId;
                  
                  return (
                    <button
                      key={skin.id}
                      onClick={() => handleSelectSkin(skin.id)}
                      className={`w-full p-4 rounded-[1.5rem] border text-left flex items-center justify-between transition-all duration-300 cursor-pointer group relative overflow-hidden ${
                        isSelected
                          ? 'bg-[#ffcc33]/15 border-[#ffcc33] shadow-[0_0_30px_rgba(255,204,51,0.15)] ring-1 ring-[#ffcc33]/30 scale-[1.02]'
                          : 'bg-black/50 border-[#ffcc33]/10 hover:border-[#ffcc33]/40 hover:bg-black/60'
                      }`}
                    >
                      <div className="flex items-center gap-4 relative z-10">
                        <div className="relative">
                          <span 
                            className="w-4 h-4 rounded-full border border-white/20 block" 
                            style={{ backgroundColor: skin.color, boxShadow: `0 0 15px ${skin.color}` }} 
                          />
                          {isSelected && (
                            <motion.div 
                              layoutId="selection-ring"
                              className="absolute inset-[-4px] border border-[#ffcc33] rounded-full"
                            />
                          )}
                        </div>
                        
                        <div>
                          <div className="text-sm font-black font-sans text-white tracking-tight flex items-center gap-2">
                            {skin.name}
                            {isEquipped && (
                              <span className="text-[8px] font-mono bg-emerald-500 text-black px-1.5 py-0.5 rounded-md font-black uppercase tracking-tighter shadow-[0_0_10px_rgba(16,185,129,0.3)]">Active</span>
                            )}
                          </div>
                          <div className="text-[10px] text-white/40 mt-1 line-clamp-1 font-medium group-hover:text-white/70 transition-colors">{skin.description}</div>
                        </div>
                      </div>

                      <div className="relative z-10">
                        {skin.unlocked ? (
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest font-black">Unlocked</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-[#ffcc33]" />}
                          </div>
                        ) : (
                          <span className="text-[10px] font-mono text-[#ffcc33] font-black flex items-center gap-1.5 bg-[#ffcc33]/10 px-3 py-1.5 rounded-xl border border-[#ffcc33]/20 shadow-inner">
                            <span className="text-xs">🪶</span> {skin.cost}
                          </span>
                        )}
                      </div>
                      
                      {/* Hover Glow Effect */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-r from-[#ffcc33] to-transparent transition-opacity duration-500" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* RIGHTSIDE: CHOSEN SKIN LARGE PREVIEW AND ACTION CRADLE (7/12 width) */}
            <div 
              className="md:col-span-7 flex flex-col justify-between bg-black/75 backdrop-blur-3xl border border-[#ffcc33]/30 rounded-[2.5rem] p-8 relative overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8)] transition-transform duration-700 ease-out min-h-[480px]"
              style={{ 
                transform: `translate(${mousePos.x * 25}px, ${mousePos.y * 25}px)`
              }}
            >
              <div className="absolute top-6 left-8 text-white/5 font-mono text-[120px] font-black pointer-events-none select-none italic tracking-tighter">
                0{skins.findIndex(s => s.id === selectedSkin.id) + 1}
              </div>

              <div className="flex flex-col items-center relative z-10 pt-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-[#ffcc33]/20 blur-[60px] rounded-full group-hover:bg-[#ffcc33]/40 transition-colors duration-1000" />
                  <canvas
                    ref={previewCanvasRef}
                    width={320}
                    height={160}
                    className="bg-black/60 rounded-[2rem] border border-[#ffcc33]/30 relative z-10 shadow-2xl"
                    id="skin_preview_canvas"
                  />
                </div>

                <motion.div 
                  key={selectedSkin.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mt-8"
                >
                  <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 uppercase tracking-tighter flex items-center justify-center gap-3">
                    {selectedSkin.name}
                    <Sparkles className="w-6 h-6 text-[#ffcc33] animate-pulse" />
                  </h2>
                  <p className="text-sm text-white/50 font-sans mt-3 max-w-sm mx-auto leading-relaxed italic">
                    "{selectedSkin.description}"
                  </p>
                </motion.div>
              </div>

              <div className="mt-8 pt-8 border-t border-[#ffcc33]/20 flex flex-col gap-3 font-sans relative z-10">
                {selectedSkin.unlocked ? (
                  selectedSkin.id === stats.selectedSkinId ? (
                    <button
                      disabled
                      className="w-full py-5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-sans font-black text-xs uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 cursor-not-allowed shadow-[0_0_30px_rgba(16,185,129,0.1)]"
                    >
                      <Check className="w-5 h-5" />
                      EQUIPPED AVIAN PRESENCE
                    </button>
                  ) : (
                    <button
                      onClick={handleEquipClick}
                      className="w-full py-5 bg-gradient-to-r from-[#ffcc33] to-[#ff6600] hover:from-[#ff6600] hover:to-[#ff3300] font-sans font-black text-xs uppercase tracking-[0.2em] rounded-2xl text-black shadow-[0_15px_30px_rgba(255,102,0,0.3)] hover:shadow-[0_20px_40px_rgba(255,102,0,0.4)] transition-all cursor-pointer flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                      EQUIP AVIAN AVATAR
                    </button>
                  )
                ) : (
                  <button
                    onClick={handleUnlockClick}
                    disabled={!canUnlock}
                    className={`w-full py-5 font-sans font-black text-xs uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] ${
                      canUnlock
                        ? 'bg-gradient-to-r from-[#ff6600] to-[#ff3300] hover:from-[#ff3300] hover:to-red-700 text-white shadow-[0_15px_30px_rgba(255,51,0,0.3)] cursor-pointer'
                        : 'bg-black/80 border border-white/5 text-white/20 cursor-not-allowed'
                    }`}
                  >
                    {!canUnlock && <Lock className="w-5 h-5 text-white/20" />}
                    ACTIVATE PRESET FOR 🪶 {selectedSkin.cost} FRAGMENTS
                  </button>
                )}

                {!selectedSkin.unlocked && !canUnlock && (
                  <p className="text-center text-[10px] text-red-500/80 font-black uppercase tracking-[0.3em] bg-red-500/5 py-2 rounded-lg border border-red-500/10">
                    ⚠️ INSUFFICIENT BALANCE. NEED {selectedSkin.cost - stats.feathersCount}🪶 MORE FRAGMENTS!
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          /* ALCHEMICAL SKILLS UPGRADE TAB ACTIVE */
          <motion.div 
            key="upgrades-tab"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch flex-1 w-full relative z-10"
          >
            
            {/* LEFTSIDE: LIST OF SKILLS (5/12 width) */}
            <div className="md:col-span-5 flex flex-col gap-4 font-sans">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-[10px] font-mono text-[#ffcc33]/80 uppercase tracking-[0.4em] font-black">
                  Select Spiritual Alchemy
                </h3>
                <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">{upgrades.length} Skills</span>
              </div>

              <div className="flex flex-col gap-3 max-h-[420px] overflow-y-auto pr-3 custom-scrollbar scroll-indicator-mask">
                {upgrades.map(upgrade => {
                  const isSelected = upgrade.id === selectedUpgradeId;
                  const UpgradeIcon = upgrade.icon;
                  
                  return (
                    <button
                      key={upgrade.id}
                      onClick={() => handleSelectUpgrade(upgrade.id)}
                      className={`w-full p-4 rounded-[1.5rem] border text-left flex items-center justify-between transition-all duration-300 cursor-pointer group relative overflow-hidden ${
                        isSelected
                          ? 'bg-[#ffcc33]/15 border-[#ffcc33] shadow-[0_0_30px_rgba(255,204,51,0.15)] ring-1 ring-[#ffcc33]/30 scale-[1.02]'
                          : 'bg-black/50 border-[#ffcc33]/10 hover:border-[#ffcc33]/40 hover:bg-black/60'
                      }`}
                    >
                      <div className="flex items-center gap-4 relative z-10">
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl group-hover:bg-amber-500/20 transition-colors">
                          <UpgradeIcon className="w-5 h-5 text-[#ffcc33]" />
                        </div>
                        
                        <div>
                          <div className="text-sm font-black font-sans text-white tracking-tight flex items-center gap-2">
                            {upgrade.name}
                          </div>
                          <div className="text-[10px] text-white/40 mt-1 line-clamp-1 font-medium group-hover:text-white/70 transition-colors">{upgrade.description}</div>
                        </div>
                      </div>

                      <div className="text-right relative z-10">
                        <div className="text-[10px] font-mono font-black text-slate-200">
                          LVL {upgrade.currentLevel}/5
                        </div>
                        <div className="text-[10px] text-[#ffcc33] uppercase font-black mt-1.5 flex items-center gap-1 justify-end">
                          {upgrade.currentLevel >= 5 ? (
                            <span className="text-emerald-400 font-black tracking-widest text-[9px]">MAX</span>
                          ) : (
                            <>🪶 {upgrade.cost(upgrade.currentLevel)}</>
                          )}
                        </div>
                      </div>
                      
                      {/* Hover Glow Effect */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-r from-[#ffcc33] to-transparent transition-opacity duration-500" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* RIGHTSIDE: UPGRADE DETAILS & PURCHASE PANEL */}
            <div 
              className="md:col-span-7 flex flex-col justify-between bg-black/75 backdrop-blur-3xl border border-[#ffcc33]/30 rounded-[2.5rem] p-8 relative overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8)] transition-transform duration-700 ease-out min-h-[480px]"
              style={{ 
                transform: `translate(${mousePos.x * 25}px, ${mousePos.y * 25}px)`
              }}
            >
              <div className="absolute top-6 left-8 text-white/5 font-mono text-[120px] font-black pointer-events-none select-none italic tracking-tighter">
                0{upgrades.findIndex(u => u.id === selectedUpgrade.id) + 1}
              </div>

              <div className="flex flex-col items-center text-center justify-center flex-1 py-4 relative z-10">
                <div className="relative group">
                  <div className="absolute inset-0 bg-[#ffcc33]/20 blur-[60px] rounded-full group-hover:bg-[#ffcc33]/30 transition-colors duration-1000" />
                  <div className="p-8 bg-gradient-to-br from-amber-500/20 to-orange-600/10 border-2 border-[#ffcc33]/40 rounded-full shadow-2xl shadow-amber-500/10 mb-6 animate-pulse relative z-10">
                    {React.createElement(selectedUpgrade.icon, { className: "w-12 h-12 text-[#ffcc33]" })}
                  </div>
                </div>

                <motion.div
                  key={selectedUpgrade.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 uppercase tracking-tighter flex flex-col items-center gap-3">
                    {selectedUpgrade.name}
                    <span className="text-[10px] font-mono bg-[#ffcc33] text-black px-3 py-1 rounded-lg font-black tracking-widest shadow-lg shadow-[#ffcc33]/20">
                      LEVEL {selectedUpgrade.currentLevel} / 5
                    </span>
                  </h2>
                  
                  <p className="text-sm text-white/50 font-sans mt-4 max-w-sm leading-relaxed italic">
                    "{selectedUpgrade.description}"
                  </p>
                </motion.div>

                {/* UPGRADE BENEFITS TRACK */}
                <div className="w-full max-w-sm mt-8 p-6 bg-black/60 border border-[#ffcc33]/15 rounded-[1.5rem] font-sans text-xs flex flex-col gap-3 text-left shadow-inner">
                  <div className="text-[#ffcc33]/60 uppercase text-[9px] tracking-[0.3em] font-black">Alchemy Specifications</div>
                  
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white/40 font-bold uppercase text-[10px]">Base Power:</span>
                      <span className="text-emerald-400 font-black uppercase tracking-tight">{selectedUpgrade.baseBenefit}</span>
                    </div>
                    
                    {selectedUpgrade.currentLevel < selectedUpgrade.maxLevel && (
                      <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                        <span className="text-white/40 font-bold uppercase text-[10px]">Next Catalyst:</span>
                        <span className="text-[#ffcc33] font-black uppercase tracking-tight">{selectedUpgrade.nextBenefit(selectedUpgrade.currentLevel)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-[#ffcc33]/20 flex flex-col gap-3 font-sans relative z-10">
                {selectedUpgrade.currentLevel >= selectedUpgrade.maxLevel ? (
                  <button
                    disabled
                    className="w-full py-5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-sans font-black text-xs uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 cursor-not-allowed shadow-[0_0_30px_rgba(16,185,129,0.1)]"
                  >
                    <Check className="w-5 h-5" />
                    ALCHEMICAL CONCORD ACHIEVED (MAX LEVEL)
                  </button>
                ) : (
                  <button
                    onClick={handleBuyUpgrade}
                    disabled={!canBuyUpgrade}
                    className={`w-full py-5 font-sans font-black text-xs uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] ${
                      canBuyUpgrade
                        ? 'bg-gradient-to-r from-[#ffcc33] to-[#ff6600] hover:from-[#ff6600] hover:to-[#ff3300] text-black shadow-[0_15px_30px_rgba(255,102,0,0.3)] hover:shadow-[0_20px_40px_rgba(255,102,0,0.4)] cursor-pointer'
                        : 'bg-black/80 border border-white/5 text-white/20 cursor-not-allowed'
                    }`}
                  >
                    {!canBuyUpgrade && <Lock className="w-5 h-5 text-white/20" />}
                    UPGRADE SKILL FOR 🪶 {currentUpgradeCost} FRAGMENTS
                  </button>
                )}

                {selectedUpgrade.currentLevel < selectedUpgrade.maxLevel && !canBuyUpgrade && (
                  <p className="text-center text-[10px] text-red-500/80 font-black uppercase tracking-[0.3em] bg-red-500/5 py-2 rounded-lg border border-red-500/10">
                    ⚠️ INSUFFICIENT BALANCE. NEED {currentUpgradeCost - stats.feathersCount}🪶 MORE FRAGMENTS!
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};
