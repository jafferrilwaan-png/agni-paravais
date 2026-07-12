const fs = require('fs');
let file = fs.readFileSync('src/components/MainMenu.tsx', 'utf8');

const regex = /<div className="absolute inset-0 z-50 flex items-center justify-center bg-black\/80 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-200">\n\s*<div className="w-full max-w-2xl bg-black\/90 border border-amber-500\/30 rounded-3xl p-6 relative flex flex-col gap-6">/;

const repl = `<div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xl p-8 animate-in fade-in duration-300">
          <div className="w-full max-w-5xl h-full max-h-[800px] flex flex-col relative gap-8">`;

file = file.replace(regex, repl);
fs.writeFileSync('src/components/MainMenu.tsx', file);
console.log('Fixed PreGame Layout');
