const fs = require('fs');
let file = fs.readFileSync('src/components/MainMenu.tsx', 'utf8');

const regex = /\{\/\* Pre-Game Selection Overlay \(REMOVED logic\) \*\/\}[\s\S]*?\{showPreGame && \([\s\S]*?<\/div>\s*\)\}/;
file = file.replace(regex, '{/* Pre-Game Selection Overlay (REMOVED logic) */}');
fs.writeFileSync('src/components/MainMenu.tsx', file);
console.log('Removed PreGame Div');
