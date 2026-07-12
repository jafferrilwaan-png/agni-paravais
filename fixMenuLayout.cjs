const fs = require('fs');
let file = fs.readFileSync('src/components/MainMenu.tsx', 'utf8');

file = file.replace(/className="w-full max-w-4xl flex flex-col md:flex-row gap-8 items-center mt-10 relative"/, 
'className="w-full h-full flex flex-col md:flex-row gap-8 items-center justify-center mt-12 relative px-10"');

// And maybe make the individual columns wider or use more screen real estate.
file = file.replace(/className="flex-1 flex flex-col gap-6 w-full max-w-sm"/, 
'className="flex-1 flex flex-col gap-6 w-full max-w-lg"');

file = file.replace(/className="flex-1 flex flex-col gap-4 w-full max-w-sm"/, 
'className="flex-1 flex flex-col gap-4 w-full max-w-lg"');

fs.writeFileSync('src/components/MainMenu.tsx', file);
console.log('Fixed Menu Layout');
