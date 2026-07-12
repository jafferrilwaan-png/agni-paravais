const fs = require('fs');
let file = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

const regex = /\/\/ Guardian monolithic body[\s\S]*?(?=\/\/ Health bar - ancient style)/;
const newBoss = `// Majestic Boss Creature (Yali / Guardian hybrid)
    ctx.fillStyle = '#0a0000';
    
    // Core body (floating upper torso)
    ctx.beginPath();
    ctx.ellipse(0, 0, 40, 60, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Wings / Horns spreading out
    ctx.fillStyle = '#110000';
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.quadraticCurveTo(-60, -80 - pulse * 20, -100, -30);
    ctx.quadraticCurveTo(-40, 10, -20, 20);
    ctx.moveTo(0, -20);
    ctx.quadraticCurveTo(60, -80 - pulse * 20, 100, -30);
    ctx.quadraticCurveTo(40, 10, 20, 20);
    ctx.fill();

    // Sacred geometric internal rings (corrupted)
    ctx.strokeStyle = '#ff3300';
    ctx.lineWidth = 4;
    ctx.rotate(stateRef.current.frameCount * 0.03);
    ctx.beginPath();
    ctx.arc(0, 0, 75 + pulse * 5, 0, Math.PI * 2);
    ctx.setLineDash([15, 20, 5, 20]);
    ctx.stroke();
    
    ctx.rotate(-stateRef.current.frameCount * 0.07);
    ctx.strokeStyle = '#ff0055';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 95 - pulse * 5, 0, Math.PI * 2);
    ctx.setLineDash([30, 10]);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Glowing Core / Heart
    ctx.fillStyle = '#ff1100';
    ctx.beginPath();
    ctx.arc(0, 20, 15 + pulse * 5, 0, Math.PI*2);
    ctx.fill();
    
    // Corrupted Evil Eyes (Multiple)
    ctx.fillStyle = '#ffea00';
    ctx.shadowColor = '#ffea00';
    ctx.shadowBlur = 20;
    
    // Main eye
    ctx.beginPath();
    ctx.ellipse(0, -20, 18, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Side eyes
    ctx.beginPath();
    ctx.ellipse(-25, -30, 8, 4, -Math.PI/6, 0, Math.PI * 2);
    ctx.ellipse(25, -30, 8, 4, Math.PI/6, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#000000';
    // Pupils tracking player (approx)
    const eyeTrackingY = (stateRef.current.player.y - boss.y) * 0.02;
    ctx.beginPath();
    ctx.ellipse(0, -20 + Math.max(-3, Math.min(3, eyeTrackingY)), 4, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-25, -30 + Math.max(-2, Math.min(2, eyeTrackingY)), 2, 3, 0, 0, Math.PI * 2);
    ctx.ellipse(25, -30 + Math.max(-2, Math.min(2, eyeTrackingY)), 2, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0; // reset for health bar
    
    `;
file = file.replace(regex, newBoss);
fs.writeFileSync('src/components/GameCanvas.tsx', file);
console.log('Patched boss look');
