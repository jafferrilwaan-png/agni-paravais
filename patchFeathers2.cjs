const fs = require('fs');
let code = fs.readFileSync('src/components/GameCanvas.tsx', 'utf-8');
code = code.replace(
  /if \(pw\.type === PowerUpType\.SACRED_FEATHER\) \{/,
  `if (pw.type === PowerUpType.SACRED_FEATHER) {
      if (stateRef.current.boss.active && !stateRef.current.bossPowerActive) {
        stateRef.current.bossPowerFeathers = Math.min(3, stateRef.current.bossPowerFeathers + 1);
      }`
);
fs.writeFileSync('src/components/GameCanvas.tsx', code);
