const fs = require('fs');
let file = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

file = file.replace(/state\.boss\.x \+= \(650 - state\.boss\.x\) \* 0\.05 \* ts;/g, "const bossTargetX = Math.min(800, dimensions.width - 150);\n        state.boss.x += (bossTargetX - state.boss.x) * 0.05 * ts;");

fs.writeFileSync('src/components/GameCanvas.tsx', file);
console.log('Fixed boss target X');
