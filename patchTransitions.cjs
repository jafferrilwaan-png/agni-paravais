const fs = require('fs');
let code = fs.readFileSync('src/components/GameCanvas.tsx', 'utf-8');

// 1. Rewrite getAinthinaiLand
code = code.replace(
  /export const getAinthinaiLand = \(score: number\): AinthinaiLand => \{[\s\S]*?\};/,
  `export const getAinthinaiLand = (distance: number): AinthinaiLand => {
  if (distance < 400) return AinthinaiLand.KURINJI;
  if (distance < 800) return AinthinaiLand.MULLAI;
  if (distance < 1200) return AinthinaiLand.MARUTHAM;
  if (distance < 1600) return AinthinaiLand.NEITHAL;
  return AinthinaiLand.PAALAI;
};`
);

// 2. Rewrite spawnObstacle usage
code = code.replace(
  'const currentLand = getAinthinaiLand(currentScoreVal);',
  'const distanceMeters = Math.floor(stateRef.current.distanceRun / 10);\n    const currentLand = getAinthinaiLand(distanceMeters);'
);

// 3. Remove transition logic from passOccurred
const passBlockRegex = /        const scoreLand = getAinthinaiLand\(state\.currentScore\);\n        if \(scoreLand !== state\.currentLand\) \{[\s\S]*?\}        \}\n/m;
code = code.replace(passBlockRegex, '');

// 4. Add transition logic near distanceMeters calculation
const mainLoopDistanceRegex = /const distanceMeters = Math\.floor\(state\.distanceRun \/ 10\);/;
const transitionCode = `const distanceMeters = Math.floor(state.distanceRun / 10);
      
      // Smooth Land Transition Check (Time/Distance based)
      const distanceLand = getAinthinaiLand(distanceMeters);
      if (distanceLand !== state.currentLand) {
        state.lastLandBeforeTransition = state.currentLand;
        state.currentLand = distanceLand;
        state.landTransitionAlpha = 0.0; // trigger crossfade fade-in
        
        if (weather === WeatherType.DREAM_MODE || weather === WeatherType.STORY_MODE) {
          AudioEngine.setLand(distanceLand);
          state.nearMissAlerts.push({
            x: dimensions.width / 2,
            y: dimensions.height / 3,
            text: \`🌌 SHIFTING TO \${distanceLand} LANDSCAPE 🌌\`,
            alpha: 2.2,
            customColor: '#ffcc33',
            sizeScale: 1.3,
          });
        }
      }`;
code = code.replace(mainLoopDistanceRegex, transitionCode);

fs.writeFileSync('src/components/GameCanvas.tsx', code);
