const fs = require('fs');
let file = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

// 1. Add state coinsEarned
file = file.replace(/feathersEarned: 0,/, 'feathersEarned: 0,\n      coinsEarned: 0,');
// twice (for reset and init)
file = file.replace(/feathersEarned: 0,/g, 'feathersEarned: 0,\n        coinsEarned: 0,');

// 2. Add coin spawn logic
file = file.replace(/let pType: PowerUpType = PowerUpType\.SACRED_FEATHER;/, 
`let pType: PowerUpType = Math.random() > 0.5 ? PowerUpType.SACRED_FEATHER : PowerUpType.COIN;`);

// 3. Collection logic
const collectFeatherRegex = /if \(pw\.type === PowerUpType\.SACRED_FEATHER\) \{[\s\S]*?onFeatherCollect\(1\);\n\s*\}/;
const collectFeatherRepl = `if (pw.type === PowerUpType.SACRED_FEATHER || pw.type === PowerUpType.COIN) {
      if (pw.type === PowerUpType.COIN) {
         stateRef.current.coinsEarned = (stateRef.current.coinsEarned || 0) + 1;
         // Assume we might want to callback for coins but for now we just track it.
         // Wait, onFeatherCollect might need to save both. 
         // Let's just handle it at game over or emit a new event if needed.
      } else {
        if (stateRef.current.boss.active && !stateRef.current.bossPowerActive) {
          stateRef.current.bossPowerFeathers = Math.min(3, stateRef.current.bossPowerFeathers + 1);
        }
        stateRef.current.feathersEarned += 1;
        onFeatherCollect(1);
      }
    }`;
file = file.replace(collectFeatherRegex, collectFeatherRepl);

// 4. Visual rendering
const drawFeatherRegex = /if \(pw\.type === PowerUpType\.SACRED_FEATHER\) \{\n\s*\/\/ Golden plume feather/;
const drawFeatherRepl = `if (pw.type === PowerUpType.COIN) {
        ctx.shadowColor = '#FFD700';
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(pw.x, pw.y, pw.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.arc(pw.x, pw.y, pw.radius * 0.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = '12px "JetBrains Mono"';
        ctx.fillText('₹', pw.x - 4, pw.y + 4);
      } else if (pw.type === PowerUpType.SACRED_FEATHER) {
        // Golden plume feather`;
file = file.replace(drawFeatherRegex, drawFeatherRepl);

// 5. Magnet condition
file = file.replace(/const isFeatherOrOrb = pw\.type === PowerUpType\.SACRED_FEATHER \|\|/, 
  'const isFeatherOrOrb = pw.type === PowerUpType.SACRED_FEATHER || pw.type === PowerUpType.COIN ||');

// 6. Fix Particle color
file = file.replace(/pw\.type === PowerUpType\.SACRED_FEATHER \? '#FFD700'/, 
  'pw.type === PowerUpType.SACRED_FEATHER || pw.type === PowerUpType.COIN ? \'#FFD700\'');

// 7. Fix collision hitbox
file = file.replace(/pType === PowerUpType\.SACRED_FEATHER \|\| pType === PowerUpType\.SOUL_FRAGMENT\)/, 
  'pType === PowerUpType.SACRED_FEATHER || pType === PowerUpType.COIN || pType === PowerUpType.SOUL_FRAGMENT)');

fs.writeFileSync('src/components/GameCanvas.tsx', file);
console.log('Fixed Coins in GameCanvas');
