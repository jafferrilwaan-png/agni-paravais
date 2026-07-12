const fs = require('fs');
let file = fs.readFileSync('src/components/MainMenu.tsx', 'utf8');

file = file.replace(/<div className="grid grid-cols-1 md:grid-cols-2 gap-8">/g, '<div className="grid grid-cols-1 md:grid-cols-2 gap-12 flex-1 min-h-0">');
file = file.replace(/max-h-60 overflow-y-auto/g, 'h-full overflow-y-auto flex-1');
file = file.replace(/className="absolute top-4 right-4/g, 'className="absolute -top-4 -right-4 md:-right-8');

fs.writeFileSync('src/components/MainMenu.tsx', file);
console.log('Fixed PreGame Inner Layout');
