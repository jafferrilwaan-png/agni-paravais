const fs = require('fs');
let file = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

file = file.replace(/state\.bossEncounterActive = true;/g, 'state.bossEncounterActive = true;\n        state.obstacles = [];\n        state.powerUps = [];');

fs.writeFileSync('src/components/GameCanvas.tsx', file);
console.log('Fixed');
