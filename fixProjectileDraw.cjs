const fs = require('fs');
let file = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

file = file.replace(/playerProjectiles\.forEach\(p => \{/, 
`playerProjectiles.forEach(p => {
      ctx.fillStyle = p.color || '#FFFFFF';`);

fs.writeFileSync('src/components/GameCanvas.tsx', file);
console.log('Fixed Projectile Drawing');
