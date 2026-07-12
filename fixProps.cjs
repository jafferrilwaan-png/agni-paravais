const fs = require('fs');
let file = fs.readFileSync('src/components/MainMenu.tsx', 'utf8');

file = file.replace(/skins: Skin\[\];/, "skins: Skin[];\n  onUpdateStats?: (stats: GameStats) => void;");
file = file.replace(/skins,/, "skins,\n  onUpdateStats,");

fs.writeFileSync('src/components/MainMenu.tsx', file);
