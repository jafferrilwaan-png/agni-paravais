const fs = require('fs');
let code = fs.readFileSync('src/components/GameCanvas.tsx', 'utf-8');

const mayilLogic = `
            if (player.shieldTimeLeft > 0 || player.goldenAuraTimeLeft > 0 || state.sanjeeviniActive || state.rageActive) {
              // Protected
              if (player.shieldTimeLeft > 0) player.shieldTimeLeft -= 60;
              if (player.goldenAuraTimeLeft > 0) player.goldenAuraTimeLeft -= 60;
              
              if (state.bossPowerActive && selectedSkin.id === 'mayil') {
                state.boss.health = Math.max(0, state.boss.health - 25);
                state.screenShake = 15;
              }
`;

code = code.replace(
  '            if (player.shieldTimeLeft > 0 || player.goldenAuraTimeLeft > 0 || state.sanjeeviniActive || state.rageActive) {\n              // Protected\n              if (player.shieldTimeLeft > 0) player.shieldTimeLeft -= 60;\n              if (player.goldenAuraTimeLeft > 0) player.goldenAuraTimeLeft -= 60;',
  mayilLogic
);
fs.writeFileSync('src/components/GameCanvas.tsx', code);
