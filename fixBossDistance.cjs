const fs = require('fs');
let file = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

// 1. Add state
file = file.replace(/const \[weatherPhase, setWeatherPhase\] = useState<'CLEAR SKY' \| 'SACRED FOG' \| 'THUNDER SHIELD' \| 'EMBER STORM'>\('CLEAR SKY'\);/,
  "const [weatherPhase, setWeatherPhase] = useState<'CLEAR SKY' | 'SACRED FOG' | 'THUNDER SHIELD' | 'EMBER STORM'>('CLEAR SKY');\n  const [bossDistance, setBossDistance] = useState<number | null>(null);");

// 2. Sync state
const syncRegex = /\/\/ ADVANCED HUD SYNCS/;
const syncRepl = `// ADVANCED HUD SYNCS
        const distM = Math.floor(state.distanceRun / 10);
        if (state.bossEncounterActive && !state.bossDefeated) {
          setBossDistance(null);
        } else {
          const diff = state.nextBossTriggerDistance - distM;
          setBossDistance(diff > 0 ? diff : 0);
        }`;
file = file.replace(syncRegex, syncRepl);

// 3. Render in HUD
const hudRegex = /\{\/\* ACTIVE POWER-UPS METERS \(Bottom left HUD\) \*\/\}/;
const hudRepl = `{/* ACTIVE POWER-UPS METERS (Bottom left HUD) */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-2 pointer-events-none select-none z-20 font-sans">
        {bossDistance !== null && (
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md border border-red-500/40 px-3 py-1.5 rounded-lg text-red-200 text-xs shadow-[0_0_12px_rgba(255,0,0,0.2)]">
            <span className="animate-pulse">⚠️</span>
            <span>Boss Incoming: <strong>{bossDistance}m</strong></span>
          </div>
        )}
`;
file = file.replace(hudRegex, hudRepl);
// Remove the existing absolute bottom-4 left-4 div start since I included it in my replacement
file = file.replace(/<div className="absolute bottom-4 left-4 flex flex-col gap-2 pointer-events-none select-none z-20 font-sans">\s*\{bossDistance/g, '{bossDistance');

fs.writeFileSync('src/components/GameCanvas.tsx', file);
console.log('Fixed Boss Distance');
