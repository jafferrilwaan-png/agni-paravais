const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf-8');
code = code.replace(
  /STORM = 'storm',/,
  "STORM = 'storm',\n  STORY_MODE = 'story_mode',"
);
fs.writeFileSync('src/types.ts', code);
