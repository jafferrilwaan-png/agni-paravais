const fs = require('fs');
let file = fs.readFileSync('src/components/MainMenu.tsx', 'utf8');

// The Right column starts with {/* Right Column: Settings / Thinais */}
const regex = /\{\/\* Right Column: Settings \/ Thinais \*\/\}[\s\S]*?(?=<\/div>\s*\{\/\* Pre-Game Selection Overlay \*\/\})/;

file = file.replace(regex, `
        {/* Optional Right Decor or Empty */}
        <div className="hidden md:flex flex-col flex-1 items-center justify-center opacity-40 hover:opacity-100 transition-opacity duration-1000">
           {/* Mystical visual decor */}
           <div className="w-64 h-64 rounded-full border-4 border-amber-500/20 border-dashed animate-spin-slow flex items-center justify-center">
             <div className="w-48 h-48 rounded-full border-2 border-orange-500/30 flex items-center justify-center animate-reverse-spin">
               <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-amber-600/20 to-orange-400/10 backdrop-blur-md shadow-[0_0_50px_rgba(255,102,0,0.3)]"></div>
             </div>
           </div>
        </div>
      `);

fs.writeFileSync('src/components/MainMenu.tsx', file);
console.log('Fixed Right Column');
