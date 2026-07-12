const fs = require('fs');
let code = fs.readFileSync('src/components/GameCanvas.tsx', 'utf-8');

// I will just make drawSingleLandBackground always render the Kurinji mountain aesthetic,
// but with a central moon and bells.
code = code.replace(
  /const drawSingleLandBackground = \([\s\S]*?\} else \{\s*drawClassicBackground\(ctx, dim\);\s*\}/,
  `const drawSingleLandBackground = (
    ctx: CanvasRenderingContext2D,
    dim: typeof stateRef.current.dimensions,
    land: AinthinaiLand
  ) => {
    const state = stateRef.current;
    const frameCount = state.frameCount;
    const p1 = state.bgParallax[0] || { x: 0 };
    const p2 = state.bgParallax[1] || { x: 0 };
    const p3 = state.bgParallax[2] || { x: 0 };

    ctx.save();

    // 1. SKY GRADIENT (Deep mystical purple to pink horizon)
    let skyGrad = ctx.createLinearGradient(0, 0, 0, dim.height);
    skyGrad.addColorStop(0, '#120521'); // Deep space purple
    skyGrad.addColorStop(0.5, '#2e1245'); // Mid purple
    skyGrad.addColorStop(1, '#662244'); // Warm pink/magenta horizon
    
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, dim.width, dim.height);

    // 2. SPARKLING STARS
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 80; i++) {
      const starX = (Math.sin(i * 123) * 0.5 + 0.5) * dim.width;
      const starY = (Math.cos(i * 321) * 0.5 + 0.5) * (dim.height * 0.8);
      const twinkle = 0.4 + Math.sin(frameCount * 0.05 + i) * 0.6;
      ctx.globalAlpha = twinkle;
      ctx.beginPath();
      ctx.arc(starX, starY, Math.random() > 0.8 ? 2 : 1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    // 3. CENTRAL GLOWING FULL MOON
    const moonX = dim.width / 2;
    const moonY = dim.height * 0.25;
    const moonRadius = 60;
    
    // Moon glow
    const moonGlow = ctx.createRadialGradient(moonX, moonY, moonRadius * 0.5, moonX, moonY, moonRadius * 3);
    moonGlow.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
    moonGlow.addColorStop(0.5, 'rgba(168, 85, 247, 0.2)');
    moonGlow.addColorStop(1, 'rgba(168, 85, 247, 0)');
    ctx.fillStyle = moonGlow;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius * 3, 0, Math.PI * 2);
    ctx.fill();

    // Moon body
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
    ctx.fill();
    // Moon craters
    ctx.fillStyle = 'rgba(200, 200, 220, 0.2)';
    ctx.beginPath(); ctx.arc(moonX - 15, moonY - 10, 12, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(moonX + 20, moonY + 15, 18, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(moonX + 5, moonY - 25, 8, 0, Math.PI * 2); ctx.fill();

    // 4. LAYERED MOUNTAINS (Parallax)
    const drawMountainLayer = (yOffset: number, colorTop: string, colorBot: string, amplitude: number, frequency: number, speed: number, parallaxX: number) => {
      ctx.beginPath();
      ctx.moveTo(0, dim.height);
      for (let x = 0; x <= dim.width; x += 10) {
        const y = dim.height - yOffset + Math.sin((x + parallaxX * speed) * frequency) * amplitude + Math.sin((x + parallaxX * speed) * frequency * 2) * (amplitude * 0.3);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(dim.width, dim.height);
      ctx.closePath();
      
      const grad = ctx.createLinearGradient(0, dim.height - yOffset - amplitude, 0, dim.height);
      grad.addColorStop(0, colorTop);
      grad.addColorStop(1, colorBot);
      ctx.fillStyle = grad;
      ctx.fill();
    };

    // Distant mountains
    drawMountainLayer(dim.height * 0.45, '#3b1c54', '#150824', 40, 0.005, 0.05, p1.x);
    // Mid mountains
    drawMountainLayer(dim.height * 0.35, '#2e1245', '#0f041c', 60, 0.008, 0.1, p2.x);
    // Foreground hills
    drawMountainLayer(dim.height * 0.2, '#1a0629', '#05010a', 30, 0.012, 0.3, p3.x);

    // 5. GLOWING LAMPS / DIYAS IN FOREGROUND
    ctx.globalAlpha = 0.9;
    for (let i = 0; i < 5; i++) {
      const hillX = (dim.width * 0.2 * i + p3.x * 0.3) % (dim.width * 1.2) - dim.width * 0.1;
      const hillY = dim.height - (dim.height * 0.15) + Math.sin(hillX * 0.012) * 30;
      
      if (hillX > -50 && hillX < dim.width + 50) {
        // Flame
        ctx.fillStyle = '#ffaa00';
        ctx.shadowColor = '#ff6a00';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(hillX, hillY, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Diya base
        ctx.fillStyle = '#4a2511';
        ctx.beginPath();
        ctx.ellipse(hillX, hillY + 4, 8, 4, 0, 0, Math.PI);
        ctx.fill();
      }
    }

    // 6. HANGING BELLS (Top)
    ctx.fillStyle = '#ffd700';
    for(let i=0; i<3; i++) {
      const bx = dim.width * (0.2 + i * 0.3) + Math.sin(frameCount * 0.01 + i) * 10;
      const by = 40;
      // String
      ctx.strokeStyle = 'rgba(255,215,0,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(bx, 0); ctx.lineTo(bx, by - 10); ctx.stroke();
      // Bell
      ctx.beginPath();
      ctx.arc(bx, by, 8, Math.PI, 0);
      ctx.lineTo(bx + 8, by + 10);
      ctx.lineTo(bx - 8, by + 10);
      ctx.closePath();
      ctx.fill();
      // Clapper
      ctx.fillStyle = '#aa8800';
      ctx.beginPath(); ctx.arc(bx, by + 12, 3, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#ffd700';
    }

    ctx.restore();
  };

  const drawBackground = (ctx: CanvasRenderingContext2D, dim: typeof stateRef.current.dimensions) => {
    if (weather === WeatherType.DREAM_MODE) {
      const state = stateRef.current;
      ctx.save();
      
      if (state.landTransitionAlpha < 1.0) {
        // Draw old land background
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
  };`
);
fs.writeFileSync('src/components/GameCanvas.tsx', code);
