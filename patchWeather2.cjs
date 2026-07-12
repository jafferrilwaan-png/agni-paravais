const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf-8');
code = code.replace(
  /DREAM_MODE = 'DREAM_MODE',/,
  "DREAM_MODE = 'DREAM_MODE',\n  STORY_MODE = 'STORY_MODE',"
);
fs.writeFileSync('src/types.ts', code);
