const fs = require('fs');
let file = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

// Increase base boss health
file = file.replace(/health: 30,/g, 'health: 200,');
file = file.replace(/maxHealth: 30,/g, 'maxHealth: 200,');

// Make the boss attack much faster and shoot more projectiles
file = file.replace(/state\.boss\.attackTimer \+= ts;/g, 'state.boss.attackTimer += ts * 2;');
file = file.replace(/state\.bossProjectiles\.push\(\{ x: state\.boss\.x \- 50, y: state\.boss\.y/g, 
`
              for(let i = -1; i <= 1; i++) {
                state.bossProjectiles.push({ x: state.boss.x - 50, y: state.boss.y + i * 30, vx: -12 - Math.random() * 5, vy: i * 2, radius: 12, color: '#FF0000' });
              }
              state.bossProjectiles.push({ x: state.boss.x - 50, y: state.boss.y`);

fs.writeFileSync('src/components/GameCanvas.tsx', file);
console.log('Fixed Boss Health');
