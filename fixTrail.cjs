const fs = require('fs');
let file = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

file = file.replace(/grad\.addColorStop\(0, 'rgba\\(0, 229, 255, 1\\)'\);/, "grad.addColorStop(0, p.color || 'rgba(0, 229, 255, 1)');");
file = file.replace(/grad\.addColorStop\(1, 'rgba\\(0, 229, 255, 0\\)'\);/, "grad.addColorStop(1, 'transparent');");

fs.writeFileSync('src/components/GameCanvas.tsx', file);
console.log('Fixed Trail');
