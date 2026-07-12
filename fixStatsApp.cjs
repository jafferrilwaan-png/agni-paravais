const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf8');

file = file.replace(/selectedSkinId: 'phoenix',/, "selectedSkinId: 'phoenix',\n    unlockedSkins: ['phoenix'],");
fs.writeFileSync('src/App.tsx', file);
