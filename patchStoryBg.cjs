const fs = require('fs');
let code = fs.readFileSync('src/components/GameCanvas.tsx', 'utf-8');

const dynamicBg = `
    let skyGrad = ctx.createLinearGradient(0, 0, 0, dim.height);
    if (land === AinthinaiLand.KURINJI) {
      skyGrad.addColorStop(0, '#120521'); 
      skyGrad.addColorStop(0.5, '#2e1245');
      skyGrad.addColorStop(1, '#662244');
    } else if (land === AinthinaiLand.MULLAI) {
      skyGrad.addColorStop(0, '#021510');
      skyGrad.addColorStop(0.5, '#0a2e1d');
      skyGrad.addColorStop(1, '#1b5e39');
    } else if (land === AinthinaiLand.MARUTHAM) {
      skyGrad.addColorStop(0, '#051221');
      skyGrad.addColorStop(0.5, '#122b4a');
      skyGrad.addColorStop(1, '#2c5e8f');
    } else if (land === AinthinaiLand.NEITHAL) {
      skyGrad.addColorStop(0, '#01111a');
      skyGrad.addColorStop(0.5, '#072e42');
      skyGrad.addColorStop(1, '#1a648c');
    } else { // PAALAI
      skyGrad.addColorStop(0, '#2e0f02');
      skyGrad.addColorStop(0.5, '#5e2a0b');
      skyGrad.addColorStop(1, '#a6541f');
    }
`;

code = code.replace(
  /let skyGrad = ctx\.createLinearGradient\(0, 0, 0, dim\.height\);\s*skyGrad\.addColorStop\(0, '#120521'\);\s*skyGrad\.addColorStop\(0\.5, '#2e1245'\);\s*skyGrad\.addColorStop\(1, '#662244'\);/m,
  dynamicBg
);

code = code.replace(
  /if \(weather === WeatherType\.DREAM_MODE\) \{/g,
  "if (weather === WeatherType.DREAM_MODE || weather === WeatherType.STORY_MODE) {"
);

fs.writeFileSync('src/components/GameCanvas.tsx', code);
