const fs = require('fs');
let file = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

// The base layers speed
file = file.replace(/\{ x: 0, speed: 0\.1 \},/g, '{ x: 0, speed: 0.3 },');
file = file.replace(/\{ x: 0, speed: 0\.2 \},/g, '{ x: 0, speed: 0.6 },');
file = file.replace(/\{ x: 0, speed: 0\.4 \},/g, '{ x: 0, speed: 1.2 },');
file = file.replace(/\{ x: 0, speed: 0\.8 \},/g, '{ x: 0, speed: 2.0 },');

// The drawLandscapeLayer speeds
file = file.replace(/0\.05, p1\.x/g, '0.15, p1.x');
file = file.replace(/0\.1, p2\.x/g, '0.3, p2.x');
file = file.replace(/0\.3, p3\.x/g, '0.8, p3.x');

fs.writeFileSync('src/components/GameCanvas.tsx', file);
console.log('Fixed Parallax');
