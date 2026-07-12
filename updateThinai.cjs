const fs = require('fs');
let code = fs.readFileSync('src/components/GameCanvas.tsx', 'utf-8');
code = code.replace(
  /export const getAinthinaiLand = \(score: number\): AinthinaiLand => \{[\s\S]*?\};/,
  `export const getAinthinaiLand = (score: number): AinthinaiLand => {
  if (score < 20) return AinthinaiLand.KURINJI;
  if (score < 40) return AinthinaiLand.MULLAI;
  if (score < 60) return AinthinaiLand.MARUTHAM;
  if (score < 80) return AinthinaiLand.NEITHAL;
  return AinthinaiLand.PAALAI;
};`
);
fs.writeFileSync('src/components/GameCanvas.tsx', code);
