const fs = require('fs');
let file = fs.readFileSync('src/types.ts', 'utf8');
file = file.replace(/SACRED_FEATHER = 'SACRED_FEATHER', \/\/ collectible currency/, 
`SACRED_FEATHER = 'SACRED_FEATHER', // collectible currency
  COIN = 'COIN',`);
fs.writeFileSync('src/types.ts', file);
