const fs = require('fs');
let file = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

// Replace everything inside the skin geometry drawing
const skinDrawRegex = /\/\/ --- DRAW SPECIFIC SKINS GEOMETRY ---[\s\S]*?(?=\/\/ --- EYES ---)/;
const newSkinDraw = `// --- DRAW SPECIFIC SKINS GEOMETRY ---
    ctx.save();
    ctx.scale(1.2, 1.2);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.shadowBlur = 0;
    
    // Animate wing flap
    const flap = Math.sin(stateRef.current.frameCount * 0.4);
    
    if (selectedSkin.type === 'phoenix' || selectedSkin.type === 'garuda') {
      // Body
      ctx.fillStyle = selectedSkin.color;
      ctx.beginPath();
      ctx.ellipse(5, 0, 18, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      // Wing
      ctx.fillStyle = selectedSkin.trailColor;
      ctx.beginPath();
      ctx.moveTo(5, -2);
      ctx.quadraticCurveTo(0, -15 * flap - 10, -15, -12 * flap - 15);
      ctx.quadraticCurveTo(8, -8, 12, -2);
      ctx.fill();
      // Tail
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.quadraticCurveTo(-25, Math.sin(stateRef.current.frameCount*0.2)*5, -35, Math.sin(stateRef.current.frameCount*0.2)*10);
      ctx.lineTo(-20, 2);
      ctx.fill();
      // Head
      ctx.fillStyle = selectedSkin.color;
      ctx.beginPath();
      ctx.arc(18, -2, 6, 0, Math.PI * 2);
      ctx.fill();
      // Beak
      ctx.fillStyle = '#ffcc00';
      ctx.beginPath();
      ctx.moveTo(22, -4);
      ctx.lineTo(30, -2);
      ctx.lineTo(22, 0);
      ctx.fill();
    } else if (selectedSkin.type === 'sparrow') {
      ctx.fillStyle = selectedSkin.color;
      ctx.beginPath();
      ctx.ellipse(2, 0, 14, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      // Wing
      ctx.fillStyle = selectedSkin.trailColor;
      ctx.beginPath();
      ctx.moveTo(2, -2);
      ctx.quadraticCurveTo(-5, -12 * flap - 5, -10, -8 * flap - 10);
      ctx.quadraticCurveTo(5, -5, 8, -2);
      ctx.fill();
      // Head
      ctx.fillStyle = selectedSkin.color;
      ctx.beginPath();
      ctx.arc(12, -2, 5, 0, Math.PI * 2);
      ctx.fill();
      // Beak
      ctx.fillStyle = '#ffaa00';
      ctx.beginPath();
      ctx.moveTo(16, -3);
      ctx.lineTo(21, -1);
      ctx.lineTo(16, 1);
      ctx.fill();
      // Tail
      ctx.fillStyle = selectedSkin.trailColor;
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(-20, -5 + Math.sin(stateRef.current.frameCount*0.3)*2);
      ctx.lineTo(-18, 3);
      ctx.fill();
    } else if (selectedSkin.type === 'peacock') {
      ctx.fillStyle = selectedSkin.color;
      ctx.beginPath();
      ctx.ellipse(5, 2, 16, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      // Wing
      ctx.fillStyle = '#1DE9B6';
      ctx.beginPath();
      ctx.moveTo(5, -1);
      ctx.quadraticCurveTo(0, -12 * flap - 5, -12, -10 * flap - 10);
      ctx.quadraticCurveTo(6, -4, 10, -1);
      ctx.fill();
      // Head
      ctx.fillStyle = selectedSkin.color;
      ctx.beginPath();
      ctx.arc(16, -6, 5, 0, Math.PI * 2);
      ctx.fill();
      // Neck
      ctx.beginPath();
      ctx.moveTo(12, -4);
      ctx.lineTo(16, -2);
      ctx.lineTo(12, 4);
      ctx.fill();
      // Beak
      ctx.fillStyle = '#ffcc00';
      ctx.beginPath();
      ctx.moveTo(20, -7);
      ctx.lineTo(25, -5);
      ctx.lineTo(20, -4);
      ctx.fill();
      // Crest
      ctx.strokeStyle = '#ffcc00';
      ctx.beginPath();
      ctx.moveTo(16, -10); ctx.lineTo(14, -14);
      ctx.moveTo(17, -10); ctx.lineTo(17, -15);
      ctx.moveTo(18, -10); ctx.lineTo(20, -14);
      ctx.stroke();
      // Tail
      ctx.fillStyle = selectedSkin.trailColor;
      ctx.beginPath();
      ctx.moveTo(-8, 2);
      ctx.quadraticCurveTo(-30, -5, -45, Math.sin(stateRef.current.frameCount*0.1)*5);
      ctx.quadraticCurveTo(-30, 15, -8, 6);
      ctx.fill();
    } else if (selectedSkin.type === 'yali') {
      ctx.fillStyle = selectedSkin.color;
      ctx.beginPath();
      ctx.ellipse(5, 0, 18, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      // Wing
      ctx.fillStyle = selectedSkin.trailColor;
      ctx.beginPath();
      ctx.moveTo(5, -2);
      ctx.quadraticCurveTo(-5, -20 * flap - 10, -20, -15 * flap - 15);
      ctx.quadraticCurveTo(8, -8, 12, -2);
      ctx.fill();
      // Lion Head
      ctx.fillStyle = selectedSkin.color;
      ctx.beginPath();
      ctx.arc(20, -2, 8, 0, Math.PI * 2);
      ctx.fill();
      // Elephant Trunk
      ctx.strokeStyle = selectedSkin.color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(27, 0);
      ctx.quadraticCurveTo(35, 5, 30, 15);
      ctx.stroke();
      // Horns
      ctx.strokeStyle = '#ffcc00';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(20, -8);
      ctx.lineTo(15, -15);
      ctx.moveTo(22, -8);
      ctx.lineTo(27, -15);
      ctx.stroke();
    } else if (selectedSkin.type === 'drone' || selectedSkin.type === 'spirit') {
       // Leave these abstract
       ctx.fillStyle = selectedSkin.color;
       ctx.beginPath();
       ctx.arc(5, 0, 12, 0, Math.PI*2);
       ctx.fill();
       ctx.fillStyle = selectedSkin.trailColor;
       ctx.beginPath();
       ctx.arc(5, 0, 6, 0, Math.PI*2);
       ctx.fill();
    }
    
    ctx.restore();
    
    // --- EYES ---`;

file = file.replace(skinDrawRegex, newSkinDraw);
fs.writeFileSync('src/components/GameCanvas.tsx', file);
console.log('Fixed Birds Geometry');
