const fs = require('fs');
let file = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

const regex = /state\.bossEncounterActive = true;\n\s*state\.obstacles = \[\];\n\s*state\.powerUps = \[\];/;
const repl = `state.bossEncounterActive = true;
        state.obstacles = [];
        state.powerUps = [];
        state.boss.x = dimensions.width + 200;
        state.boss.y = dimensions.height / 2;
        state.boss.targetY = dimensions.height / 2;
        state.boss.alpha = 0;`;

file = file.replace(regex, repl);
fs.writeFileSync('src/components/GameCanvas.tsx', file);
console.log('Fixed boss spawn');
