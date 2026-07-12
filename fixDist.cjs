const fs = require('fs');
let file = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

file = file.replace(/state\.distanceRun \+= \(state\.bossEncounterActive && !state\.bossDefeated \? 0\.5 : state\.gameSpeed\) \* 10;/,
'state.distanceRun += (state.bossEncounterActive && !state.bossDefeated ? 0 : state.gameSpeed) * 10;');

fs.writeFileSync('src/components/GameCanvas.tsx', file);
console.log('Fixed Dist');
