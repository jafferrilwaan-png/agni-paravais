const fs = require('fs');
let file = fs.readFileSync('src/gameConfig.ts', 'utf8');

file = file.replace(/name: 'Kurinji \(Mountains\)',/, "name: 'Kurinji (Mountains) குறிஞ்சி',\n    icon: '⛰️🌸',");
file = file.replace(/name: 'Mullai \(Forests\)',/, "name: 'Mullai (Forests) முல்லை',\n    icon: '🌲🍃',");
file = file.replace(/name: 'Marutham \(Croplands\)',/, "name: 'Marutham (Croplands) மருதம்',\n    icon: '🌾🧑‍🌾',");
file = file.replace(/name: 'Neithal \(Seashore\)',/, "name: 'Neithal (Seashore) நெய்தல்',\n    icon: '🌊🐟',");
file = file.replace(/name: 'Palai \(Desert\)',/, "name: 'Palai (Desert) பாலை',\n    icon: '☀️🏜️',");

fs.writeFileSync('src/gameConfig.ts', file);
