const fs = require('fs');
let file = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

// The user requested: "ensure the procedural background layers retain their integrity and scrolling speed regardless of the current game difficulty or boss encounter state."
// We can use the baseline speed of 3.5 multiplied by ts (timeScale) so it scrolls consistently.

// Replace: layer.x -= state.gameSpeed * layer.speed;
// With: layer.x -= (3.5 * ts) * layer.speed;
file = file.replace(/layer\.x -= state\.gameSpeed \* layer\.speed;/g, 'layer.x -= (3.5 * ts) * layer.speed;');

fs.writeFileSync('src/components/GameCanvas.tsx', file);
console.log('Fixed Parallax Speed');
