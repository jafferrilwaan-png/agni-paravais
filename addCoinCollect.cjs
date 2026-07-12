const fs = require('fs');
let file = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

file = file.replace(/onFeatherCollect: \(amount: number\) => void;/, 
`onFeatherCollect: (amount: number) => void;
  onCoinCollect?: (amount: number) => void;`);

file = file.replace(/onFeatherCollect\(1\);/, `onFeatherCollect(1);`);
file = file.replace(/\/\/ Assume we might want to callback for coins but for now we just track it./, 
`if (onCoinCollect) onCoinCollect(1);`);

// And add coins display to HUD
const featherHudRegex = /\{feathersEarned\}<\span>/;
const featherHudRepl = `{feathersEarned}</span>
        </div>
        <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-yellow-500/30">
          <span className="text-xl">🪙</span>
          <span className="font-bold text-yellow-400 drop-shadow-md">{stateRef.current?.coinsEarned || 0}</span>`;
// But stateRef isn't reactive in the JSX rendering here. `feathersEarned` is passed as a prop! Wait, GameCanvas is rendered by App.tsx, which passes down feathers? No, `GameCanvas` renders HUD? Let's check `GameCanvas` props.

fs.writeFileSync('src/components/GameCanvas.tsx', file);
