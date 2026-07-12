const fs = require('fs');
let file = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

file = file.replace(/state\.gameSpeed = state\.bossEncounterActive && !state\.bossDefeated \? 0 : state\.baseSpeed \* ts;/, 'state.gameSpeed = state.baseSpeed * ts;');

fs.writeFileSync('src/components/GameCanvas.tsx', file);
console.log('Fixed Game Speed during Boss');
