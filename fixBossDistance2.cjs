const fs = require('fs');
let file = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

const regex = /\{\/\* ACTIVE POWER-UPS METERS \(Bottom left HUD\) \*\/\}\n\s*<div className="absolute bottom-4 left-4 flex flex-col gap-2 pointer-events-none select-none z-20 font-sans">\n\s*\{bossDistance !== null && \(\n\s*<div className="flex items-center gap-2 bg-black\/60 backdrop-blur-md border border-red-500\/40 px-3 py-1\.5 rounded-lg text-red-200 text-xs shadow-\[0_0_12px_rgba\(255,0,0,0\.2\)\]">\n\s*<span className="animate-pulse">⚠️<\/span>\n\s*<span>Boss Incoming: <strong>\{bossDistance\}m<\/strong><\/span>\n\s*<\/div>\n\s*\)\}\n\n\s*<div className="absolute bottom-4 left-4 flex flex-col gap-2 pointer-events-none select-none z-20 font-sans">/;

const repl = `{/* ACTIVE POWER-UPS METERS (Bottom left HUD) */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-2 pointer-events-none select-none z-20 font-sans">
        {bossDistance !== null && bossDistance > 0 && (
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md border border-red-500/40 px-3 py-1.5 rounded-lg text-red-200 text-xs shadow-[0_0_12px_rgba(255,0,0,0.2)]">
            <span className="animate-pulse">⚠️</span>
            <span>Boss Incoming: <strong>{bossDistance}m</strong></span>
          </div>
        )}`;

file = file.replace(regex, repl);
fs.writeFileSync('src/components/GameCanvas.tsx', file);
console.log('Fixed HUD div');
