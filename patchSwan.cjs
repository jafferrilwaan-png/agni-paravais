const fs = require('fs');
let code = fs.readFileSync('src/components/GameCanvas.tsx', 'utf-8');

const swanLogic = `          if (dist < player.radius + bp.radius) {
            if (state.bossPowerActive && selectedSkin.id === 'swan') {
              state.bossProjectiles.splice(i, 1);
              state.currentScore += 5;
              setScore(state.currentScore);
              if (player.lives < 3) {
                 player.lives++;
                 setLives(player.lives);
              }
              AudioEngine.playPowerUp();
              for (let k = 0; k < 10; k++) {
                state.particles.push({
                  x: bp.x, y: bp.y,
                  vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10,
                  radius: 2 + Math.random() * 4,
                  color: '#ffffff', alpha: 1, decay: 0.05, glow: true
                });
              }
              continue;
            }`;

code = code.replace(
  '          if (dist < player.radius + bp.radius) {',
  swanLogic
);
fs.writeFileSync('src/components/GameCanvas.tsx', code);
