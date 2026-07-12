const fs = require('fs');
let file = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

file = file.replace(/const hasImage = false; \/\/ Forced to procedural for absolute beautiness/, 'const hasImage = img && img.complete && img.naturalWidth > 0;');

fs.writeFileSync('src/components/GameCanvas.tsx', file);
