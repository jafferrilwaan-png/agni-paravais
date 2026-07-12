const fs = require('fs');
let code = fs.readFileSync('src/components/GameCanvas.tsx', 'utf-8');

const updateLogic = `
      // Boss Power Update
      if (state.bossPowerActive) {
        state.bossPowerTimeLeft -= ts;
        if (state.bossPowerTimeLeft <= 0) {
          state.bossPowerActive = false;
          setIsBossPowerActive(false);
        } else {
          if (selectedSkin.id === 'agni') {
             // Flame burst: continuous damage
             if (state.frameCount % 5 === 0) state.boss.health = Math.max(0, state.boss.health - 2);
             state.particles.push({
                x: player.x + player.radius,
                y: player.y + (Math.random()-0.5)*10,
                vx: 15,
                vy: 0,
                radius: 10 + Math.random()*10,
                color: '#ff3d00',
                alpha: 1,
                decay: 0.05,
                glow: true
             });
             // Destroy incoming obstacles handled by boost (I will add boost to Agni)
             player.boostTimeLeft = Math.max(player.boostTimeLeft, 2);
          } else if (selectedSkin.id === 'garuda') {
             // Sky Dash
             if (state.frameCount % 10 === 0) state.boss.health = Math.max(0, state.boss.health - 5);
             player.boostTimeLeft = Math.max(player.boostTimeLeft, 2);
             state.screenShake = 5;
          } else if (selectedSkin.id === 'mayil') {
             // Shield
             player.shieldTimeLeft = Math.max(player.shieldTimeLeft, 2);
          } else if (selectedSkin.id === 'koel') {
             // Shadow phase (boss stops attacking - handled in boss fire logic)
             player.invincibilityTimeLeft = Math.max(player.invincibilityTimeLeft, 2);
          } else if (selectedSkin.id === 'swan') {
             // Healing aura
             player.goldenAuraTimeLeft = Math.max(player.goldenAuraTimeLeft, 2);
          }
        }
      }
      
      // Rage & Weather Phase updates in main loop!`;

code = code.replace(
  '// Rage & Weather Phase updates in main loop!',
  updateLogic
);
fs.writeFileSync('src/components/GameCanvas.tsx', code);
