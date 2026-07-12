const fs = require('fs');
let code = fs.readFileSync('src/components/GameCanvas.tsx', 'utf-8');

const btnHtml = `
      {/* BOSS POWER BUTTON */}
      {stateRef.current?.boss?.active && (
        <div className="absolute bottom-24 right-8 z-50">
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-1">
              {[1, 2, 3].map((f) => (
                <div key={f} className={\`w-4 h-4 rounded-full border-2 \${stateRef.current.bossPowerFeathers >= f ? 'bg-yellow-400 border-yellow-200 shadow-[0_0_10px_#ffd700]' : 'bg-black/50 border-gray-600'}\`} />
              ))}
            </div>
            {stateRef.current.bossPowerFeathers >= 3 && !stateRef.current.bossPowerActive && (
              <button 
                onClick={(e) => { e.stopPropagation(); activateBossPower(); }}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-yellow-500 rounded-xl font-bold text-white shadow-[0_0_20px_#ff0000] animate-pulse uppercase tracking-wider border-2 border-white/50"
              >
                UNLEASH POWER
              </button>
            )}
          </div>
        </div>
      )}
`;

code = code.replace(
  '{/* BIG INNER PAUSE BOARD */}',
  btnHtml + '\n      {/* BIG INNER PAUSE BOARD */}'
);
fs.writeFileSync('src/components/GameCanvas.tsx', code);
