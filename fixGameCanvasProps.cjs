const fs = require('fs');
let file = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

file = file.replace(/  onFeatherCollect: \(count: number\) => void;\n\}/, 
`  onFeatherCollect: (count: number) => void;
  isStoryMode?: boolean;
  storyLevel?: number;
  onStoryLevelComplete?: () => void;
}`);

fs.writeFileSync('src/components/GameCanvas.tsx', file);
console.log('Fixed GameCanvas Props');
