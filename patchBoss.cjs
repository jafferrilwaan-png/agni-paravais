const fs = require('fs');
let file = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

// 1. Add distanceRun update
file = file.replace(
  /state\.gameSpeed = state\.baseSpeed \* ts;/,
  `state.gameSpeed = state.bossEncounterActive && !state.bossDefeated ? 0 : state.baseSpeed * ts;
      state.distanceRun += (state.bossEncounterActive && !state.bossDefeated ? 0.5 : state.gameSpeed) * 10;`
);

// 2. Add power firing mechanism to the boss physics update loop
const bossUpdateRegex = /(if \(state\.bossEncounterActive && !state\.bossDefeated\) \{[\s\S]*?)(?=\/\/\s*BOSS PROJECTILE COLLISION)/;
const powerInjection = `
        // --- BIRD SPECIFIC ABILITIES ---
        state.powerTimer = (state.powerTimer || 0) + ts;
        if (state.powerTimer > 100) { // Fire power every ~1.5 seconds
          state.powerTimer = 0;
          const powerType = selectedSkin.powerName;
          
          if (powerType === 'Solar Flare') {
            state.playerProjectiles.push({ x: player.x, y: player.y, vx: 12, vy: -2, radius: 15, color: '#FF4F00' });
            state.playerProjectiles.push({ x: player.x, y: player.y, vx: 12, vy: 2, radius: 15, color: '#FF4F00' });
          } else if (powerType === 'Sonic Screech') {
             // Slows down boss projectiles
             state.bossProjectiles.forEach(p => { p.vx *= 0.5; });
             state.playerProjectiles.push({ x: player.x, y: player.y, vx: 15, vy: 0, radius: 25, color: 'rgba(170,0,255,0.5)' });
          } else if (powerType === 'Purifying Shield') {
             player.shieldActive = true;
             player.shieldTimeLeft = 60;
             state.playerProjectiles.push({ x: player.x, y: player.y, vx: 10, vy: 0, radius: 20, color: '#FFFFFF' });
          } else if (powerType === 'Feather Storm') {
             for(let i=-2; i<=2; i++) {
               state.playerProjectiles.push({ x: player.x, y: player.y, vx: 14, vy: i*1.5, radius: 8, color: '#00E5FF' });
             }
          } else if (powerType === 'Divine Dive') {
             player.invincibilityTimeLeft = 30;
             player.vx = 20; // Dash
             state.playerProjectiles.push({ x: player.x, y: player.y, vx: 20, vy: 0, radius: 30, color: '#FFC400' });
          } else if (powerType === 'Roar of the Ancients') {
             state.bossProjectiles = [];
             state.playerProjectiles.push({ x: player.x, y: player.y, vx: 18, vy: 0, radius: 40, color: '#E040FB' });
          } else if (powerType === 'Laser Beam') {
             state.playerProjectiles.push({ x: player.x, y: player.y, vx: 25, vy: 0, radius: 5, color: '#00E5FF', width: 200 });
          } else if (powerType === 'Soul Burn') {
             state.playerProjectiles.push({ x: player.x, y: player.y, vx: 8, vy: 0, radius: 25, color: '#D500F9', homing: true });
          } else if (powerType === 'Apocalypse Nova') {
             state.bossProjectiles = [];
             state.playerProjectiles.push({ x: player.x, y: player.y, vx: 20, vy: 0, radius: 50, color: '#FF0055' });
          } else {
             state.playerProjectiles.push({ x: player.x, y: player.y, vx: 10, vy: 0, radius: 10, color: '#FFFFFF' });
          }
        }
`;
file = file.replace(bossUpdateRegex, `$1${powerInjection}\n        `);

// 3. Boss incoming indicator in story mode
file = file.replace(/const distanceLand = getWeatherType\(distanceMeters\);/, `
      const distanceLand = getWeatherType(distanceMeters, weather);
`);

// 4. Update the render boss distance text
const renderHudRegex = /(ctx\.fillText\(\`SCORE: \$\{stateRef\.current\.currentScore\}\`, 20, 40\);)/;
file = file.replace(renderHudRegex, `$1
      if (!stateRef.current.bossEncounterActive && !stateRef.current.bossDefeated && stateRef.current.nextBossTriggerDistance) {
        const distLeft = stateRef.current.nextBossTriggerDistance - Math.floor(stateRef.current.distanceRun / 10);
        if (distLeft < 500 && distLeft > 0) {
          ctx.fillStyle = 'rgba(255, 50, 50, ' + (0.5 + Math.sin(stateRef.current.frameCount * 0.1)*0.5) + ')';
          ctx.font = 'bold 20px "JetBrains Mono"';
          ctx.fillText(\`BOSS INCOMING: \${distLeft}m\`, 20, 70);
        }
      }
`);

// 5. Endless mode boss trigger
// Wait, infinite mode boss trigger is already in GameCanvas.tsx, setting nextBossTriggerDistance
// But we need to make sure initial nextBossTriggerDistance is set.
file = file.replace(/highScoreCloseAlertTriggered: false,/, `
    highScoreCloseAlertTriggered: false,
    nextBossTriggerDistance: isStoryMode ? 600 : 1000,
`);

fs.writeFileSync('src/components/GameCanvas.tsx', file);
console.log('Fixed Boss Logic');
