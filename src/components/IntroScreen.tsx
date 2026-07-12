/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, SkipForward, ArrowRight } from 'lucide-react';
import { AudioEngine } from '../audio';

interface IntroScreenProps {
  onComplete: () => void;
}

interface PrologueSlide {
  textTamil: string;
  textEnglish: string;
  highlight: string;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onComplete }) => {
  const [slideIndex, setSlideIndex] = useState(0);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  const slides: PrologueSlide[] = [
    {
      textTamil: "தொல் தமிழ் வான வீதியில், விண்வெளி கோபுரங்கள் ஒளிரும் சுடராக நிலைத்திருந்தன...",
      textEnglish: "In the high heights of the ancient Tamil skies, the sacred floating Gopurams of Vaanam stood as eternal beacons of light...",
      highlight: "Vaanam Gopurams"
    },
    {
      textTamil: "ஆனால், கொடுஞ்சீற்றப் புயல் அக்னியை அணைத்து, வானவூரை இருளிலும் சிதைவிலும் வீழ்த்தியது...",
      textEnglish: "But a dark storm of cosmic wrath extinguished the sacred fires, collapsing the magnificent sky civilization into ashes and silent ruins...",
      highlight: "Cosmic Shadow"
    },
    {
      textTamil: "இப்போது, சாம்பலில் இருந்து எழும் 'அக்னி பறவை' மட்டுமே விண்வெளியை மீண்டும் மீட்க முடியும்!",
      textEnglish: "Now, only 'Agni Paravai', the mythical fire-born bird of light, can reignite the temple shrines and restore the fallen skies!",
      highlight: "Agni Paravai Rise"
    }
  ];

  // Canvas animation logic driven by slideIndex
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let frameCount = 0;

    // Set high-DPI canvas size
    const width = 600;
    const height = 260;
    canvas.width = width;
    canvas.height = height;

    // Smooth transition variables
    let templeY = 160;
    let templeAlpha = 1.0;
    let stormAlpha = 0.0;
    let birdX = 300;
    let birdY = 75;
    let birdAlpha = 1.0;
    let birdFlapSpeed = 0.03;
    let burstRadius = 0;
    let lightningFlash = 0;

    // Particle system
    interface StoryParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      decay: number;
      glow?: boolean;
    }
    const particles: StoryParticle[] = [];

    // Pre-populate stars
    const stars: { x: number; y: number; size: number; alpha: number; speed: number }[] = [];
    for (let i = 0; i < 40; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * (height - 80),
        size: 1 + Math.random() * 2,
        alpha: 0.3 + Math.random() * 0.7,
        speed: 0.01 + Math.random() * 0.02,
      });
    }

    const drawGopuram = (c: CanvasRenderingContext2D, x: number, y: number, alpha: number, scale = 1.0) => {
      c.save();
      c.globalAlpha = alpha;
      c.translate(x, y);
      c.scale(scale, scale);

      // Base stone platform
      c.fillStyle = '#2d1f10';
      c.shadowColor = '#ffaa00';
      c.shadowBlur = alpha > 0.5 ? 10 : 0;
      c.fillRect(-45, 0, 90, 10);

      // Tier 1 (Bottom)
      c.fillStyle = '#3c2b18';
      c.beginPath();
      c.moveTo(-35, 0);
      c.lineTo(-30, -25);
      c.lineTo(30, -25);
      c.lineTo(35, 0);
      c.closePath();
      c.fill();
      // Decorative ridges on sides
      c.fillStyle = '#d4af37';
      c.fillRect(-35, -5, 4, 5);
      c.fillRect(31, -5, 4, 5);

      // Tier 2
      c.fillStyle = '#4c361e';
      c.beginPath();
      c.moveTo(-28, -25);
      c.lineTo(-24, -45);
      c.lineTo(24, -45);
      c.lineTo(28, -25);
      c.closePath();
      c.fill();
      c.fillStyle = '#d4af37';
      c.fillRect(-28, -30, 3, 5);
      c.fillRect(25, -30, 3, 5);

      // Tier 3
      c.fillStyle = '#5c4326';
      c.beginPath();
      c.moveTo(-22, -45);
      c.lineTo(-17, -65);
      c.lineTo(17, -65);
      c.lineTo(22, -45);
      c.closePath();
      c.fill();

      // Tier 4 (Peak)
      c.fillStyle = '#6c4f2e';
      c.beginPath();
      c.moveTo(-15, -65);
      c.lineTo(-10, -85);
      c.lineTo(10, -85);
      c.lineTo(15, -65);
      c.closePath();
      c.fill();

      // Kalasam (Golden spires on top)
      c.fillStyle = '#ffd700';
      c.shadowColor = '#ffd700';
      c.shadowBlur = alpha > 0.5 ? 15 : 0;
      // Center Kalasa dome
      c.beginPath();
      c.arc(0, -90, 4, 0, Math.PI * 2);
      c.fill();
      c.fillRect(-1, -96, 2, 7);

      // Side Kalasas
      c.beginPath();
      c.arc(-7, -88, 2.5, 0, Math.PI * 2);
      c.arc(7, -88, 2.5, 0, Math.PI * 2);
      c.fill();

      // Glowing details in temple carvings
      if (alpha > 0.5) {
        c.fillStyle = '#ffd700';
        c.fillRect(-3, -15, 6, 6); // sacred portal center
        c.fillRect(-2, -37, 4, 5);
        c.fillRect(-1, -57, 2, 4);
      }

      c.restore();
    };

    const drawBird = (c: CanvasRenderingContext2D, x: number, y: number, alpha: number, flap: number, power: boolean) => {
      c.save();
      c.globalAlpha = alpha;
      c.translate(x, y);

      const wingSpan = power ? 32 : 22;
      const birdColor = power ? '#ff3d00' : '#ffa000';
      const wingColor = power ? '#ffea00' : '#ff6d00';

      // Sacred Aura Glow
      c.shadowColor = power ? '#ff5722' : '#ffb300';
      c.shadowBlur = power ? 25 : 12;

      // Draw gorgeous flame tail feathers
      c.fillStyle = wingColor;
      c.beginPath();
      c.moveTo(-4, 4);
      c.quadraticCurveTo(-15, 15 + Math.sin(frameCount * 0.1) * 3, -8, 25);
      c.quadraticCurveTo(-3, 15, 0, 5);
      c.quadraticCurveTo(3, 15, 8, 25);
      c.quadraticCurveTo(15, 15 + Math.cos(frameCount * 0.1) * 3, 4, 4);
      c.closePath();
      c.fill();

      // Draw stylized wings (bezier curves with flapping height)
      const flapY = Math.sin(flap) * wingSpan * 0.7;

      // Left Wing
      c.fillStyle = birdColor;
      c.beginPath();
      c.moveTo(-2, -2);
      c.bezierCurveTo(-15, -15 + flapY, -28, -8 + flapY * 0.5, -wingSpan, flapY);
      c.bezierCurveTo(-20, 8 + flapY * 0.3, -8, 5, -2, 2);
      c.closePath();
      c.fill();

      // Left wing fiery accent highlights
      c.fillStyle = '#ffd700';
      c.beginPath();
      c.moveTo(-4, -4);
      c.bezierCurveTo(-12, -10 + flapY, -20, -5 + flapY, -wingSpan + 6, flapY + 2);
      c.bezierCurveTo(-14, 4, -6, 2, -4, 1);
      c.closePath();
      c.fill();

      // Right Wing
      c.fillStyle = birdColor;
      c.beginPath();
      c.moveTo(2, -2);
      c.bezierCurveTo(15, -15 + flapY, 28, -8 + flapY * 0.5, wingSpan, flapY);
      c.bezierCurveTo(20, 8 + flapY * 0.3, 8, 5, 2, 2);
      c.closePath();
      c.fill();

      // Right wing fiery highlights
      c.fillStyle = '#ffd700';
      c.beginPath();
      c.moveTo(4, -4);
      c.bezierCurveTo(12, -10 + flapY, 20, -5 + flapY, wingSpan - 6, flapY + 2);
      c.bezierCurveTo(14, 4, 6, 2, 4, 1);
      c.closePath();
      c.fill();

      // Sleek Phoenix Body
      const bodyGrad = c.createLinearGradient(0, -12, 0, 6);
      bodyGrad.addColorStop(0, '#ffd700');
      bodyGrad.addColorStop(1, '#ff3300');
      c.fillStyle = bodyGrad;
      c.beginPath();
      c.moveTo(0, -12);
      c.quadraticCurveTo(-6, -6, -4, 4);
      c.lineTo(4, 4);
      c.quadraticCurveTo(6, -6, 0, -12);
      c.closePath();
      c.fill();

      // Head Crown Feather (Sacred Flame Peak)
      c.fillStyle = '#ffd700';
      c.beginPath();
      c.moveTo(0, -12);
      c.quadraticCurveTo(-4, -18, -2, -22);
      c.quadraticCurveTo(0, -16, 2, -22);
      c.quadraticCurveTo(4, -18, 0, -12);
      c.fill();

      // Glowing Sacred Center Dot (Spirit Core)
      c.fillStyle = '#ffffff';
      c.beginPath();
      c.arc(0, -3, 2, 0, Math.PI * 2);
      c.fill();

      c.restore();
    };

    const renderLoop = () => {
      frameCount++;
      ctx.clearRect(0, 0, width, height);

      // Smooth interpolation targets based on active story slide
      let targetTempleY = 160;
      let targetTempleAlpha = 1.0;
      let targetStormAlpha = 0.0;
      let targetBirdX = 300;
      let targetBirdY = 75;
      let targetBirdAlpha = 1.0;
      let targetFlapSpeed = 0.03;
      let isPowerState = false;

      if (slideIndex === 0) {
        // Scene 1: The Era of Light
        targetTempleY = 190;
        targetTempleAlpha = 1.0;
        targetStormAlpha = 0.0;
        targetBirdX = 300;
        targetBirdY = 92; // resting perfectly on the peak Kalasa spire!
        targetBirdAlpha = 1.0;
        targetFlapSpeed = 0.02; // slow breathing wings
        isPowerState = false;

        // Spawn gentle golden stardust particles
        if (Math.random() < 0.2) {
          particles.push({
            x: Math.random() * width,
            y: 0,
            vx: -0.2 - Math.random() * 0.4,
            vy: 0.3 + Math.random() * 0.6,
            size: 1 + Math.random() * 2,
            color: '#ffd700',
            alpha: 1.0,
            decay: 0.005,
            glow: true,
          });
        }
      } else if (slideIndex === 1) {
        // Scene 2: The Cosmic Wrath Storm
        targetTempleY = 245; // temple sinking & collapsing
        targetTempleAlpha = 0.35; // cracked & faded
        targetStormAlpha = 0.95; // heavy stormy background
        targetBirdX = 300;
        targetBirdY = 220; // falling down
        targetBirdAlpha = 0.0; // extinguished & gone
        targetFlapSpeed = 0.15;
        isPowerState = false;

        // Lightning random triggers
        if (lightningFlash > 0) lightningFlash--;
        else if (Math.random() < 0.015) {
          lightningFlash = 12; // strike!
          if (!AudioEngine.getSettings().muted) {
            AudioEngine.playCrash();
          }
        }

        // Spawn ash and storm debris particles (swirling purple/smoke)
        if (Math.random() < 0.5) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: -1.5 - Math.random() * 2,
            vy: 0.5 + Math.random() * 1,
            size: 2 + Math.random() * 4,
            color: Math.random() > 0.5 ? '#2c1035' : '#424242',
            alpha: 0.8,
            decay: 0.015,
          });
        }
      } else if (slideIndex === 2) {
        // Scene 3: Rebirth & Rise of Agni Paravai
        targetTempleY = 250; // remains ruined
        targetTempleAlpha = 0.15;
        targetStormAlpha = 0.25; // storm dissipating
        targetBirdX = 300;
        // Bobbing floating flight motion
        targetBirdY = 90 + Math.sin(frameCount * 0.08) * 12;
        targetBirdAlpha = 1.0;
        targetFlapSpeed = 0.16; // rapid powerful flying strokes!
        isPowerState = true;

        // Blazing sacred burst circle expanding
        if (burstRadius < 180) {
          burstRadius += 3.5;
        }

        // Spawn heavy fiery combustion sparks from wings and aura
        for (let i = 0; i < 2; i++) {
          particles.push({
            x: targetBirdX + (Math.random() - 0.5) * 40,
            y: targetBirdY + 10,
            vx: (Math.random() - 0.5) * 4,
            vy: 1 + Math.random() * 3, // moving downwards from bird
            size: 2 + Math.random() * 4,
            color: Math.random() > 0.4 ? '#ff5722' : '#ffd700',
            alpha: 1.0,
            decay: 0.02,
            glow: true,
          });
        }
      }

      // Smoothly interpolate positions to make scene changes look incredibly premium
      templeY += (targetTempleY - templeY) * 0.08;
      templeAlpha += (targetTempleAlpha - templeAlpha) * 0.08;
      stormAlpha += (targetStormAlpha - stormAlpha) * 0.08;
      birdX += (targetBirdX - birdX) * 0.08;
      birdY += (targetBirdY - birdY) * 0.08;
      birdAlpha += (targetBirdAlpha - birdAlpha) * 0.08;
      birdFlapSpeed += (targetFlapSpeed - birdFlapSpeed) * 0.08;

      // 1. Draw Background Sky
      if (slideIndex === 0) {
        // Soft evening celestial sky
        const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
        skyGrad.addColorStop(0, '#120400');
        skyGrad.addColorStop(0.6, '#3a1200');
        skyGrad.addColorStop(1, '#1c0700');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, width, height);
      } else if (slideIndex === 1) {
        // Angry Storm Sky
        const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
        skyGrad.addColorStop(0, '#0a0210');
        skyGrad.addColorStop(0.5, '#1b0324');
        skyGrad.addColorStop(1, '#050008');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, width, height);
      } else if (slideIndex === 2) {
        // Golden sunrise / Fire Sky
        const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
        skyGrad.addColorStop(0, '#1a0500');
        skyGrad.addColorStop(0.4, '#6b1b00');
        skyGrad.addColorStop(0.8, '#d45d00');
        skyGrad.addColorStop(1, '#ffc400');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, width, height);
      }

      // 2. Draw Stars (Gently twinkling)
      stars.forEach(star => {
        star.alpha += (Math.random() - 0.5) * star.speed * 2;
        star.alpha = Math.max(0.1, Math.min(1.0, star.alpha));
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha * (1 - stormAlpha * 0.8)})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Draw Cosmic Storm Overlay
      if (stormAlpha > 0.02) {
        ctx.fillStyle = `rgba(18, 4, 30, ${stormAlpha * 0.75})`;
        ctx.fillRect(0, 0, width, height);

        // Swirling storm wind lines
        ctx.strokeStyle = `rgba(147, 51, 234, ${stormAlpha * 0.15})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          const sy = 40 + i * 50 + Math.sin(frameCount * 0.02 + i) * 15;
          ctx.moveTo(-50 + (frameCount * 1.5 + i * 200) % (width + 100), sy);
          ctx.quadraticCurveTo(
            width / 2, sy + Math.cos(frameCount * 0.01) * 30,
            width + 50 + (frameCount * 1.5 + i * 200) % (width + 100), sy
          );
        }
        ctx.stroke();
      }

      // 4. Draw Collapsed ground / Floating mountain rocks
      ctx.fillStyle = '#0f0601';
      ctx.beginPath();
      ctx.moveTo(0, height - 30);
      ctx.quadraticCurveTo(150, height - 45, 300, height - 35);
      ctx.quadraticCurveTo(450, height - 25, width, height - 35);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      // Bottom landscape accent lava / golden steam
      if (slideIndex === 2) {
        ctx.strokeStyle = '#ff6a00';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, height - 32);
        ctx.quadraticCurveTo(150, height - 43, 300, height - 33);
        ctx.quadraticCurveTo(450, height - 23, width, height - 33);
        ctx.stroke();
      }

      // 5. Draw Floating temple ruins/Gopurams
      drawGopuram(ctx, width / 2, templeY, templeAlpha, 1.1);

      // Minor side spires
      drawGopuram(ctx, width / 2 - 140, templeY + 25, templeAlpha * 0.6, 0.7);
      drawGopuram(ctx, width / 2 + 140, templeY + 25, templeAlpha * 0.6, 0.7);

      // 6. Draw Rebirth Shockwave Ring
      if (slideIndex === 2 && burstRadius > 0 && burstRadius < 185) {
        ctx.save();
        ctx.strokeStyle = `rgba(255, 215, 0, ${1 - burstRadius / 185})`;
        ctx.lineWidth = 5 * (1 - burstRadius / 185);
        ctx.shadowColor = '#ff6a00';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(birdX, 100, burstRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 7. Render Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        if (p.glow) {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = p.size * 3;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 8. Draw the Sacred Bird
      if (birdAlpha > 0.01) {
        drawBird(ctx, birdX, birdY, birdAlpha, frameCount * birdFlapSpeed, isPowerState);
      }

      // 9. Draw lightning strike effect (flash overlay)
      if (lightningFlash > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${(lightningFlash / 12) * 0.85})`;
        ctx.fillRect(0, 0, width, height);

        // Drawn lightning bolt
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.moveTo(width / 2 + (Math.random() - 0.5) * 100, 0);
        ctx.lineTo(width / 2 - 30, height / 3);
        ctx.lineTo(width / 2 + 20, height / 2);
        ctx.lineTo(width / 2 - 10, templeY - 80);
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    // Begin looping
    renderLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [slideIndex]);

  useEffect(() => {
    // Play a mystical, low sound on slide change
    AudioEngine.playScore();
    
    const interval = setInterval(() => {
      if (slideIndex < slides.length - 1) {
        setSlideIndex(prev => prev + 1);
      } else {
        handleFinish();
      }
    }, 8500); // Expanded slightly for better storyboard reading and animation appreciation

    return () => clearInterval(interval);
  }, [slideIndex]);

  const handleNext = () => {
    AudioEngine.playButton();
    if (slideIndex < slides.length - 1) {
      setSlideIndex(prev => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    AudioEngine.playTempleBellMilestone();
    onComplete();
  };

  return (
    <div className="w-full h-full min-h-[500px] bg-gradient-to-b from-[#110500] via-[#220a00] to-black flex flex-col justify-between p-4 sm:p-8 font-serif relative overflow-hidden select-none" id="intro_screen_container">
      {/* Background ambient stars and flying embers */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,102,0,0.12),transparent_70%)] pointer-events-none" />
      
      {/* Skip Button at Top Right */}
      <div className="flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-[#ff6a00] animate-pulse" />
          <span className="text-xs font-mono uppercase tracking-widest text-[#ffcc33]/60">Temple Sky Prologue</span>
        </div>
        <button
          onClick={handleFinish}
          className="px-4 py-1.5 rounded-full bg-black/40 hover:bg-[#ff6a00]/20 border border-[#ffcc33]/20 hover:border-[#ffcc33]/60 text-xs font-mono uppercase text-[#ffcc33] tracking-widest flex items-center gap-1.5 transition duration-300 cursor-pointer"
          id="skip_intro_btn"
        >
          Skip Intro <SkipForward className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Slide Content Area */}
      <div className="flex-1 flex flex-col justify-center items-center text-center max-w-2xl mx-auto py-4 z-10">
        {/* Animated Sacred Lore Canvas Illustration */}
        <div className="relative w-full max-w-lg aspect-[30/13] border border-amber-500/25 bg-black/55 rounded-2xl shadow-[0_0_25px_rgba(255,106,0,0.15)] mb-5 overflow-hidden">
          <canvas 
            ref={canvasRef} 
            className="w-full h-full block cursor-pointer"
            onClick={handleNext}
            title="Click to advance story"
          />
          {/* Subtle scene badge in corner */}
          <div className="absolute bottom-2 right-3 text-[8px] font-mono tracking-widest text-[#ffd700]/70 bg-black/60 px-2 py-0.5 rounded border border-[#ffd700]/20 uppercase">
            Scene {slideIndex + 1} / 3
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={slideIndex}
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex flex-col gap-3"
          >
            {/* Thematic Accent badge */}
            <div className="text-[10px] font-mono tracking-widest text-[#ffcc33] uppercase bg-amber-950/40 px-3 py-1 rounded-full border border-amber-500/20 w-fit mx-auto animate-pulse">
              {slides[slideIndex].highlight}
            </div>

            {/* Tamil Text (Large, beautiful classical serif look) */}
            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-amber-200 leading-snug tracking-wide filter drop-shadow-[0_2px_8px_rgba(255,102,0,0.2)]">
              {slides[slideIndex].textTamil}
            </h2>

            {/* Divider line */}
            <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#ff6a00]/60 to-transparent mx-auto my-0.5" />

            {/* English Text (Slighter smaller, soft italics) */}
            <p className="text-xs sm:text-sm text-stone-300/90 italic leading-relaxed font-serif tracking-wide px-4">
              "{slides[slideIndex].textEnglish}"
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress & Next Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 z-10 border-t border-amber-950/40 pt-4">
        {/* Step dots */}
        <div className="flex gap-2.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                AudioEngine.playButton();
                setSlideIndex(idx);
              }}
              className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                idx === slideIndex ? 'w-8 bg-[#ff6a00]' : 'w-2 bg-[#ffcc33]/20 hover:bg-[#ffcc33]/50'
              }`}
              title={`Go to scene ${idx + 1}`}
            />
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={handleNext}
          className="group px-6 py-2 rounded-xl bg-gradient-to-r from-[#ffcc33]/15 to-[#ff6a00]/15 hover:from-[#ffcc33]/30 hover:to-[#ff6a00]/30 border border-[#ffcc33]/30 hover:border-[#ffcc33]/80 text-[#ffcc33] text-sm font-semibold tracking-wider flex items-center gap-1.5 transition-all duration-300 cursor-pointer hover:scale-[1.03] active:scale-[0.98]"
          id="next_slide_btn"
        >
          {slideIndex === slides.length - 1 ? "Restore Sky (தொடங்கு)" : "Continue Journey"}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
