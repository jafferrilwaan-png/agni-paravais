const fs = require('fs');
let code = fs.readFileSync('src/components/GameCanvas.tsx', 'utf-8');
const lines = code.split(/\r?\n/);
const bossIdx = lines.findIndex(l => l.includes('const drawBossEncounter'));
if (lines[bossIdx - 1].trim() === '};' && lines[bossIdx - 2].trim() === '};') {
  lines.splice(bossIdx - 1, 1);
}
fs.writeFileSync('src/components/GameCanvas.tsx', lines.join('\n'));
