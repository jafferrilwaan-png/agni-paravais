const fs = require('fs');
let code = fs.readFileSync('src/components/GameCanvas.tsx', 'utf-8');

const targetStr = `
        const scoreLand = getAinthinaiLand(state.currentScore);
        if (scoreLand !== state.currentLand) {
          state.lastLandBeforeTransition = state.currentLand;
          state.currentLand = scoreLand;
          state.landTransitionAlpha = 0.0; // trigger crossfade fade-in
          
          if (weather === WeatherType.DREAM_MODE || weather === WeatherType.STORY_MODE) {
            AudioEngine.setLand(scoreLand);
            state.nearMissAlerts.push({
              x: state.dimensions.width / 2,
              y: state.dimensions.height / 3,
              text: \`🌌 SHIFTING TO \${scoreLand} LANDSCAPE 🌌\`,
              alpha: 2.2,
              customColor: '#ffcc33',
              sizeScale: 1.3,
            });
          }
        }`;

code = code.replace(targetStr, '');
fs.writeFileSync('src/components/GameCanvas.tsx', code);
