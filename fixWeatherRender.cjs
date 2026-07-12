const fs = require('fs');
let file = fs.readFileSync('src/components/MainMenu.tsx', 'utf8');

file = file.replace(/<span className="text-2xl">\{'🌲'\}<\/span>/, '<span className="text-xl">{preset.icon || \'🌲\'}</span>');
file = file.replace(/\{preset\.name\.split\(' '\)\[0\]\}/, '{preset.name.split(" ")[0]} {preset.name.split(" ")[2] || ""}');

fs.writeFileSync('src/components/MainMenu.tsx', file);
