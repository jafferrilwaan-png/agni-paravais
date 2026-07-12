const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf8');

file = file.replace(/<SkinSelector skins=\{skins\}\s*onUpdateStats=\{saveStats\}\s*/, '<SkinSelector skins={skins}\n              ');
fs.writeFileSync('src/App.tsx', file);
