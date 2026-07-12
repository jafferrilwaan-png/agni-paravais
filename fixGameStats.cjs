const fs = require('fs');
let file = fs.readFileSync('src/types.ts', 'utf8');

file = file.replace(/feathersCount: number;/, 'feathersCount: number;\n  coinsCount: number;');
fs.writeFileSync('src/types.ts', file);

let appFile = fs.readFileSync('src/App.tsx', 'utf8');
appFile = appFile.replace(/feathersCount: 0,/, 'feathersCount: 0,\n    coinsCount: 0,');
fs.writeFileSync('src/App.tsx', appFile);

console.log('Added coins to stats');
