const fs = require('fs');
let file = fs.readFileSync('src/components/MainMenu.tsx', 'utf8');

file = file.replace(/className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar"/, 'className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar scroll-indicator-mask"');

fs.writeFileSync('src/components/MainMenu.tsx', file);
console.log('Fixed Scroll Mask');
