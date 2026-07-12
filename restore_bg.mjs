import fs from 'fs';

const code = fs.readFileSync('src/components/GameCanvas.tsx', 'utf-8');
const searchStr = '  const drawBackground = (ctx: CanvasRenderingContext2D, dim: typeof stateRef.current.dimensions) => {';

const replacement = `  const drawClassicBackground = (ctx: CanvasRenderingContext2D, dim: typeof stateRef.current.dimensions) => {
    const colors = getActiveWeatherColors();
    
    // 1. SKY GRADIENT
    const skyGrad = ctx.createLinearGradient(0, 0, 0, dim.height);
    skyGrad.addColorStop(0, colors.skyTop);
    skyGrad.addColorStop(1, colors.skyBottom);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, dim.width, dim.height);

    // 2. PARALLAX LAYER 1: Giant Sun/Moon or Neon lines
    const p1 = stateRef.current.bgParallax[0];
    if (weather === WeatherType.COSMIC_NEON) {
      // Retrowave Synthwave Grid
      ctx.strokeStyle = 'rgba(191, 90, 242, 0.15)';
      ctx.lineWidth = 1;
      const gridInterval = 40;
      const offset = p1.x % gridInterval;
      
      // Draw grid lines
      for (let x = offset; x < dim.width; x += gridInterval) {
        ctx.beginPath();
        ctx.moveTo(x, dim.height - 100);
        ctx.lineTo(x, dim.height);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(0, dim.height - 100);
      ctx.lineTo(dim.width, dim.height - 100);
      ctx.stroke();

      // Cosmic wireframe sun
      ctx.fillStyle = 'rgba(255, 0, 127, 0.4)';
      ctx.shadowBlur = 40;
      ctx.shadowColor = '#ff007f';
      ctx.beginPath();
      ctx.arc(dim.width / 2, 160, 60, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0; // reset
    } else {
      // Elegant traditional sun/moon
      const sunY = weather === WeatherType.SUNSET ? dim.height - 150 : 100;
      const sunR = weather === WeatherType.SUNSET ? 80 : 50;
      const sunGrad = ctx.createRadialGradient(
        dim.width / 2 + p1.x * 0.1, sunY, 10,
        dim.width / 2 + p1.x * 0.1, sunY, sunR
      );
      
      if (weather === WeatherType.SUNSET) {
        sunGrad.addColorStop(0, '#ffffff');
        sunGrad.addColorStop(0.2, '#fff176');
        sunGrad.addColorStop(0.5, '#f57c00');
        sunGrad.addColorStop(1, 'rgba(211, 84, 0, 0)');
      } else {
        // Soft silver moon
        sunGrad.addColorStop(0, '#ffffff');
        sunGrad.addColorStop(0.4, '#e2e8f0');
        sunGrad.addColorStop(1, 'rgba(255,255,255,0)');
      }

      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(dim.width / 2 + p1.x * 0.1, sunY, sunR, 0, Math.PI * 2);
      ctx.fill();

      // Draw divine golden rays proportional to temple restoration progress (score)
      const currentScoreVal = stateRef.current.currentScore;
      const restorationRatio = Math.min(1.0, currentScoreVal / 20);
      if (weather === WeatherType.SUNSET && restorationRatio > 0.05) {
        ctx.save();
        ctx.translate(dim.width / 2 + p1.x * 0.1, sunY);
        ctx.globalAlpha = restorationRatio * 0.28;
        const numRays = 8;
        const baseAngle = stateRef.current.frameCount * 0.002;
        for (let r = 0; r < numRays; r++) {
          const angle = baseAngle + (r * Math.PI * 2 / numRays);
          ctx.fillStyle = 'rgba(255, 204, 51, 0.25)';
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(angle - 0.12) * 600, Math.sin(angle - 0.12) * 600);
          ctx.lineTo(Math.cos(angle + 0.12) * 600, Math.sin(angle + 0.12) * 600);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }
    }

    // Distant soft clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    const cloudOffset = p1.x;
    for (let i = 0; i < 4; i++) {
      const cX = (cloudOffset + i * 350) % (dim.width + 200) - 100;
      const cY = 60 + (i % 2) * 40;
      ctx.beginPath();
      ctx.arc(cX, cY, 30, 0, Math.PI * 2);
      ctx.arc(cX + 20, cY - 10, 35, 0, Math.PI * 2);
      ctx.arc(cX + 45, cY, 25, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. PARALLAX LAYER 2: Ancient Temple Towers (Gopurams) silhouettes (Restoring over score!)
    const p2 = stateRef.current.bgParallax[1];
    const towerWidth = 100;
    const gopuramOffset = p2.x;
    const currentScoreVal = stateRef.current.currentScore;

    // Transition the silhouette fill color from dark/ash granite to a warm glowing copper-gold base
    const baseColorFactor = Math.min(1.0, currentScoreVal / 15);
    const regularGopuramFill = weather === WeatherType.COSMIC_NEON 
      ? '#11052C' 
      : \`rgb(\${Math.round(24 + baseColorFactor * 32)}, \${Math.round(15 + baseColorFactor * 15)}, \${Math.round(41 + baseColorFactor * 5)})\`;
    ctx.fillStyle = regularGopuramFill;

    for (let i = 0; i < 6; i++) {
      const startX = (gopuramOffset + i * 220) % (dim.width + towerWidth * 2) - towerWidth;
      const startY = dim.height - 40;

      // Draw a South Indian temple tower pyramid shape based on restoration level
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(startX + towerWidth, startY);

      if (currentScoreVal < 6) {
        // Ruined / broken temple tower silhouette (Half-collapsed)
        ctx.lineTo(startX + towerWidth * 0.85, startY - 45);
        ctx.lineTo(startX + towerWidth * 0.72, startY - 70);
        // Jagged crack lines at top
        ctx.lineTo(startX + towerWidth * 0.62, startY - 58);
        ctx.lineTo(startX + towerWidth * 0.52, startY - 82);
        ctx.lineTo(startX + towerWidth * 0.42, startY - 68);
        ctx.lineTo(startX + towerWidth * 0.28, startY - 52);
        ctx.lineTo(startX + towerWidth * 0.15, startY - 25);
      } else if (currentScoreVal < 15) {
        // Partly restored temple tower silhouette (Missing Kalasam dome)
        ctx.lineTo(startX + towerWidth * 0.9, startY - 50);
        ctx.lineTo(startX + towerWidth * 0.8, startY - 100);
        ctx.lineTo(startX + towerWidth * 0.7, startY - 145);
        // Jagged flat cut top
        ctx.lineTo(startX + towerWidth * 0.62, startY - 155);
        ctx.lineTo(startX + towerWidth * 0.38, startY - 155);
        ctx.lineTo(startX + towerWidth * 0.3, startY - 145);
        ctx.lineTo(startX + towerWidth * 0.2, startY - 100);
        ctx.lineTo(startX + towerWidth * 0.1, startY - 50);
      } else {
        // Fully Restored Ancient Grand Gopuram Tower silhouette
        ctx.lineTo(startX + towerWidth * 0.9, startY - 50);
        ctx.lineTo(startX + towerWidth * 0.8, startY - 100);
        ctx.lineTo(startX + towerWidth * 0.7, startY - 150);
        ctx.lineTo(startX + towerWidth * 0.6, startY - 200);
        // Ornate dome top (Kalasam)
        ctx.lineTo(startX + towerWidth * 0.5 + 5, startY - 215);
        ctx.lineTo(startX + towerWidth * 0.5, startY - 228);
        ctx.lineTo(startX + towerWidth * 0.5 - 5, startY - 215);
        ctx.lineTo(startX + towerWidth * 0.4, startY - 200);
        ctx.lineTo(startX + towerWidth * 0.3, startY - 150);
        ctx.lineTo(startX + towerWidth * 0.2, startY - 100);
        ctx.lineTo(startX + towerWidth * 0.1, startY - 50);
      }
      ctx.closePath();
      ctx.fill();

      // EXTRA DETAIL OVERLAYS ON THE TEMPLE BACKGROUND AS THE SCORE GROWS
      if (weather !== WeatherType.COSMIC_NEON) {
        if (currentScoreVal < 6) {
          // Glow cracks on ruined gopurams to show volatile fire spirit energy
          ctx.strokeStyle = '#ff4500';
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          ctx.moveTo(startX + towerWidth * 0.45, startY - 10);
          ctx.lineTo(startX + towerWidth * 0.55, startY - 35);
          ctx.lineTo(startX + towerWidth * 0.40, startY - 55);
          ctx.stroke();
        } else {
          // Fully restored/partly restored: Draw South Indian Gopuram tiered horizontal bands (Bhumis)
          ctx.strokeStyle = \`rgba(255, 204, 51, \${currentScoreVal >= 15 ? 0.25 : 0.12})\`;
          ctx.lineWidth = 1;
          const tierSpacing = currentScoreVal >= 15 ? 15 : 25;
          const maxTierHeight = currentScoreVal >= 15 ? 200 : 130;
          
          for (let th = 15; th < maxTierHeight; th += tierSpacing) {
            const widthAtTier = towerWidth * (1 - (th / 250));
            const leftX = startX + (towerWidth - widthAtTier) / 2;
            const rightX = startX + (towerWidth + widthAtTier) / 2;
            ctx.beginPath();
            ctx.moveTo(leftX, startY - th);
            ctx.lineTo(rightX, startY - th);
            ctx.stroke();
          }

          // Draw small glowing temple lamps or window shrines on the towers for majestic depth
          if (currentScoreVal >= 10) {
            ctx.fillStyle = 'rgba(255, 170, 0, 0.7)';
            ctx.shadowColor = '#ff6a00';
            ctx.shadowBlur = 6;
            
            // Draw centered doorway shrine near base
            ctx.beginPath();
            ctx.arc(startX + towerWidth * 0.5, startY - 18, 4, 0, Math.PI, true);
            ctx.lineTo(startX + towerWidth * 0.5 + 4, startY);
            ctx.lineTo(startX + towerWidth * 0.5 - 4, startY);
            ctx.closePath();
            ctx.fill();

            // Draw high shrines
            if (currentScoreVal >= 15) {
              ctx.beginPath();
              ctx.arc(startX + towerWidth * 0.5, startY - 80, 2.5, 0, Math.PI * 2);
              ctx.arc(startX + towerWidth * 0.5, startY - 140, 2.0, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.shadowBlur = 0; // reset
          }
        }
      }

      // Fully restored towers emit ascending energy particles/sparks!
      if (currentScoreVal >= 15) {
        ctx.save();
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#ffcc33';
        ctx.fillStyle = 'rgba(255, 204, 51, 0.65)';
        const sparkTime = stateRef.current.frameCount * 0.04 + i;
        const sX = startX + towerWidth * 0.5 + Math.sin(sparkTime * 2.2) * 5;
        const sY = startY - 232 - ((stateRef.current.frameCount + i * 15) % 35) * 1.0;
        ctx.beginPath();
        ctx.arc(sX, sY, 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // 3.5 DRAW GLOWING OIL LAMPS (தீபம்) along the sacred ground
    ctx.save();
    const groundY = dim.height - 15;
    const numLamps = 4;
    for (let l = 0; l < numLamps; l++) {
      const lampX = ((p2.x + l * 260) % (dim.width + 100)) - 50;
      const flicker = Math.sin(stateRef.current.frameCount * 0.12 + l) * 2.2;
      
      // Diya clay bowl base
      ctx.fillStyle = '#8d5032';
      ctx.beginPath();
      ctx.arc(lampX, groundY, 9, 0, Math.PI, false);
      ctx.fill();
      
      // Wick
      ctx.fillStyle = '#5c3826';
      ctx.fillRect(lampX - 3, groundY, 6, 2);

      // Flickering golden divine flame
      ctx.shadowBlur = 11 + Math.abs(flicker) * 2;
      ctx.shadowColor = '#ff6a00';
      const flameGrad = ctx.createRadialGradient(lampX, groundY - 5, 0.5, lampX, groundY - 5, 7);
      flameGrad.addColorStop(0, '#ffffff');
      flameGrad.addColorStop(0.3, '#ffcc33');
      flameGrad.addColorStop(0.8, '#ff3300');
      flameGrad.addColorStop(1, 'rgba(255, 51, 0, 0)');
      
      ctx.fillStyle = flameGrad;
      ctx.beginPath();
      ctx.moveTo(lampX, groundY - 13 - flicker * 0.35); // top tip
      ctx.quadraticCurveTo(lampX + 4.5, groundY - 3.5, lampX, groundY - 1.5);
      ctx.quadraticCurveTo(lampX - 4.5, groundY - 3.5, lampX, groundY - 13 - flicker * 0.35);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // 4. PARALLAX LAYER 3: Misty mountains & hanging bells
    const p3 = stateRef.current.bgParallax[2];
    ctx.fillStyle = weather === WeatherType.COSMIC_NEON ? '#240046' : 'rgba(44, 24, 61, 0.6)';
    const hillOffset = p3.x;
    for (let i = 0; i < 4; i++) {
      const startX = (hillOffset + i * 360) % (dim.width + 400) - 200;
      ctx.beginPath();
      ctx.moveTo(startX, dim.height);
      ctx.quadraticCurveTo(startX + 180, dim.height - 180, startX + 360, dim.height);
      ctx.closePath();
      ctx.fill();
    }

    // Swaying Hanging Bells/Lanterns
    ctx.save();
    stateRef.current.bellSwingAngle = Math.sin(stateRef.current.frameCount * 0.02) * 0.12;
    ctx.strokeStyle = 'rgba(218, 165, 32, 0.4)';
    ctx.fillStyle = 'rgba(218, 165, 32, 0.6)';
    ctx.lineWidth = 1.5;

    const bellOffset = p3.x * 1.2;
    for (let b = 0; b < 4; b++) {
      const bX = (bellOffset + b * 280) % (dim.width + 100) - 30;
      const bY = 0;
      const threadLen = 60 + (b % 3) * 20;

      ctx.save();
      ctx.translate(bX, bY);
      ctx.rotate(stateRef.current.bellSwingAngle);

      // Thread line
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, threadLen);
      ctx.stroke();

      // Ancient temple bell shape
      ctx.beginPath();
      ctx.moveTo(-10, threadLen + 15);
      ctx.lineTo(10, threadLen + 15);
      ctx.quadraticCurveTo(8, threadLen, 0, threadLen);
      ctx.quadraticCurveTo(-8, threadLen, -10, threadLen + 15);
      ctx.fill();

      // Bell clapper
      ctx.beginPath();
      ctx.arc(0, threadLen + 17, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
    ctx.restore();

    // Weather effects rain
    if (weather === WeatherType.MONSOON) {
      ctx.strokeStyle = 'rgba(156, 163, 175, 0.2)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 15; i++) {
        const rX = Math.random() * dim.width;
        const rY = Math.random() * dim.height;
        ctx.beginPath();
        ctx.moveTo(rX, rY);
        ctx.lineTo(rX - 8, rY + 25);
        ctx.stroke();
      }
    }
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
  };`;

const newCode = code.replace(searchStr, replacement);
fs.writeFileSync('src/components/GameCanvas.tsx', newCode);
console.log('Successfully updated GameCanvas.tsx');
