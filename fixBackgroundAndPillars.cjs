const fs = require('fs');
let file = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

// 1. Force procedural background
file = file.replace(/const hasImage = img && img\.complete && img\.naturalWidth > 0;/, 'const hasImage = false; // Forced to procedural for absolute beautiness');

// 2. Pillar color based on weather
const pillarColorRegex = /const sideColor = scoreVal < 6 \? '#1b1b1b' : \(scoreVal < 15 \? '#3a2517' : '#543118'\);\n\s*const centerColor = scoreVal < 6 \? '#383838' : \(scoreVal < 15 \? '#9e741b' : '#ffcc33'\);\n\s*topGrad\.addColorStop\(0, sideColor\);\n\s*topGrad\.addColorStop\(0\.5, centerColor\);\n\s*topGrad\.addColorStop\(1, sideColor\);\n\s*\}\n\n\s*ctx\.fillStyle = topGrad;\n\s*ctx\.fillRect\(obs\.x, 0, obs\.width, topH\);\n\n\s*\/\/ Ornate pillar capital \/ rims \(traditional South Indian pillar brackets and bands\)\n\s*const primaryAccent = isNeon \? '#4facfe' : \(scoreVal < 6 \? '#3a332d' : \(scoreVal < 15 \? '#9e741b' : '#ffcc33'\)\);\n\s*const secondaryAccent = isNeon \? '#00f2fe' : \(scoreVal < 6 \? '#201c18' : \(scoreVal < 15 \? '#ffd700' : '#ffffff'\)\);/;

const pillarColorReplacement = `let sideColor = '#1b1b1b';
        let centerColor = '#383838';
        let primaryAccent = '#3a332d';
        let secondaryAccent = '#201c18';

        if (weather === WeatherType.KURINJI) {
          sideColor = '#1a0629'; centerColor = '#5e2a84'; primaryAccent = '#a855f7'; secondaryAccent = '#d8b4e2';
        } else if (weather === WeatherType.MULLAI) {
          sideColor = '#001a0b'; centerColor = '#166534'; primaryAccent = '#4ade80'; secondaryAccent = '#a7f3d0';
        } else if (weather === WeatherType.MARUTHAM) {
          sideColor = '#3f1a04'; centerColor = '#b45309'; primaryAccent = '#f59e0b'; secondaryAccent = '#fde68a';
        } else if (weather === WeatherType.NEITHAL) {
          sideColor = '#01152d'; centerColor = '#1e3a8a'; primaryAccent = '#60a5fa'; secondaryAccent = '#bfdbfe';
        } else if (weather === WeatherType.PALAI) {
          sideColor = '#4a1900'; centerColor = '#9a3412'; primaryAccent = '#f97316'; secondaryAccent = '#fed7aa';
        }

        topGrad.addColorStop(0, sideColor);
        topGrad.addColorStop(0.5, centerColor);
        topGrad.addColorStop(1, sideColor);
      }

      ctx.fillStyle = topGrad;
      ctx.fillRect(obs.x, 0, obs.width, topH);

      // Ornate pillar capital / rims (traditional South Indian pillar brackets and bands)
      const primaryAccent = isNeon ? '#4facfe' : (weather === WeatherType.KURINJI ? '#a855f7' : weather === WeatherType.MULLAI ? '#4ade80' : weather === WeatherType.MARUTHAM ? '#f59e0b' : weather === WeatherType.NEITHAL ? '#60a5fa' : '#f97316');
      const secondaryAccent = isNeon ? '#00f2fe' : (weather === WeatherType.KURINJI ? '#d8b4e2' : weather === WeatherType.MULLAI ? '#a7f3d0' : weather === WeatherType.MARUTHAM ? '#fde68a' : weather === WeatherType.NEITHAL ? '#bfdbfe' : '#fed7aa');
`;

file = file.replace(pillarColorRegex, pillarColorReplacement);

// We need to do the same for the bottom pillar (botGrad)
const botColorRegex = /const botGrad = ctx\.createLinearGradient\(obs\.x, centerY \+ obs\.gap \/ 2, obs\.x \+ obs\.width, centerY \+ obs\.gap \/ 2\);\n\s*if \(isNeon\) \{\n\s*botGrad\.addColorStop\(0, '#090514'\);\n\s*botGrad\.addColorStop\(0\.5, '#00f2fe'\);\n\s*botGrad\.addColorStop\(1, '#090514'\);\n\s*\} else \{\n\s*botGrad\.addColorStop\(0, sideColor\);\n\s*botGrad\.addColorStop\(0\.5, centerColor\);\n\s*botGrad\.addColorStop\(1, sideColor\);\n\s*\}/;

const botColorReplacement = `const botGrad = ctx.createLinearGradient(obs.x, centerY + obs.gap / 2, obs.x + obs.width, centerY + obs.gap / 2);
      if (isNeon) {
        botGrad.addColorStop(0, '#090514');
        botGrad.addColorStop(0.5, '#00f2fe');
        botGrad.addColorStop(1, '#090514');
      } else {
        let sideColor = '#1b1b1b';
        let centerColor = '#383838';
        if (weather === WeatherType.KURINJI) {
          sideColor = '#1a0629'; centerColor = '#5e2a84';
        } else if (weather === WeatherType.MULLAI) {
          sideColor = '#001a0b'; centerColor = '#166534';
        } else if (weather === WeatherType.MARUTHAM) {
          sideColor = '#3f1a04'; centerColor = '#b45309';
        } else if (weather === WeatherType.NEITHAL) {
          sideColor = '#01152d'; centerColor = '#1e3a8a';
        } else if (weather === WeatherType.PALAI) {
          sideColor = '#4a1900'; centerColor = '#9a3412';
        }
        botGrad.addColorStop(0, sideColor);
        botGrad.addColorStop(0.5, centerColor);
        botGrad.addColorStop(1, sideColor);
      }`;

file = file.replace(botColorRegex, botColorReplacement);


fs.writeFileSync('src/components/GameCanvas.tsx', file);
console.log('Fixed background and pillars');
