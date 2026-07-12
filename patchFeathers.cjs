const fs = require('fs');
let code = fs.readFileSync('src/components/GameCanvas.tsx', 'utf-8');
code = code.replace(
  'const onFeatherCollect = (amount: number) => {',
  `const onFeatherCollect = (amount: number) => {
    if (stateRef.current.boss.active && !stateRef.current.bossPowerActive) {
      stateRef.current.bossPowerFeathers = Math.min(3, stateRef.current.bossPowerFeathers + 1);
    }`
);
fs.writeFileSync('src/components/GameCanvas.tsx', code);
