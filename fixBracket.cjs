const fs = require('fs');
let code = fs.readFileSync('src/components/GameCanvas.tsx', 'utf-8');
code = code.replace(/  \};\n  \};\n  const drawBossEncounter/g, '  };\n  const drawBossEncounter');
fs.writeFileSync('src/components/GameCanvas.tsx', code);
