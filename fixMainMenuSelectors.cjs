const fs = require('fs');
let file = fs.readFileSync('src/components/MainMenu.tsx', 'utf8');

// Replace the right decor with the map selection and skin selection
const rightDecorRegex = /\{\/\* Optional Right Decor or Empty \*\/\}[\s\S]*?<\/div>\s*<\/div>\s*\{\/\* Pre-Game Selection Overlay \*\/\}/;

const mapSelectionUI = `
        {/* Right Column: Settings / Thinais */}
        <div className="flex-1 flex flex-col gap-6 w-full max-w-sm">
           <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl">
              <h3 className="text-sm font-mono text-white/50 uppercase tracking-widest mb-4 flex items-center justify-between">
                <span>Map / திணை</span>
              </h3>
              <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                {WEATHER_PRESETS.map((preset) => (
                  <button
                    key={preset.type}
                    onClick={() => { setRandomWeather(false); onSelectWeather(preset.type); }}
                    className={\`p-2 rounded-xl border text-left transition-all flex items-center gap-3 \${
                      !randomWeather && stats.selectedWeather === preset.type 
                        ? 'bg-amber-500/20 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                        : 'bg-black/40 border-white/10 hover:border-white/30'
                    }\`}
                  >
                    <span className="text-xl">{preset.icon || '🌲'}</span>
                    <div>
                      <div className={\`text-sm font-bold \${!randomWeather && stats.selectedWeather === preset.type ? 'text-amber-400' : 'text-slate-300'}\`}>
                        {preset.name.split(" ")[0]} {preset.name.split(" ")[2] || ""}
                      </div>
                      <div className="text-[10px] text-slate-400">{preset.name.split(' ')[1]}</div>
                    </div>
                  </button>
                ))}
              </div>
           </div>

           <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl">
              <h3 className="text-sm font-mono text-white/50 uppercase tracking-widest mb-4 flex items-center justify-between">
                <span>Bird / பறவை</span>
                <button onClick={() => onStateChange(GameState.SKINS)} className="text-xs text-amber-400 hover:text-amber-300 underline">Change ➜</button>
              </h3>
              <div className="flex items-center gap-4 bg-black/40 p-3 rounded-xl border border-white/10">
                <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center bg-black/50" style={{ borderColor: selectedSkin.color }}>🪶</div>
                <div>
                  <div className="text-sm font-bold" style={{ color: selectedSkin.color }}>{selectedSkin.name}</div>
                  <div className="text-[10px] text-slate-400">{selectedSkin.powerName}</div>
                </div>
              </div>
           </div>
        </div>
      </div>

      {/* Pre-Game Selection Overlay (REMOVED logic) */}
`;

file = file.replace(rightDecorRegex, mapSelectionUI);

// Fix top bar labels
const topBarRegex = /<Flame className="w-5 h-5 text-amber-500" \/>\s*<span className="text-white font-mono font-bold">\{stats\.feathersCount\}<\/span>/;
const topBarRepl = `<Flame className="w-5 h-5 text-amber-500" />
            <span className="text-white font-mono font-bold mr-2" title="Feathers / இறகுகள்">{stats.feathersCount}</span>
            <div className="w-px h-4 bg-white/20 mx-1"></div>
            <span className="text-xl mx-1" title="Coins / நாணயங்கள்">🪙</span>
            <span className="text-white font-mono font-bold" title="Coins / நாணயங்கள்">{stats.coinsCount || 0}</span>`;

file = file.replace(topBarRegex, topBarRepl);

// Fix start button to NOT show pre game overlay
file = file.replace(/const handleStart = \(\) => \{\n\s*if \(!showPreGame\) \{\n\s*setShowPreGame\(true\);\n\s*return;\n\s*\}/, 
`const handleStart = () => {`);

fs.writeFileSync('src/components/MainMenu.tsx', file);
console.log('Fixed main menu layout for maps and coins');
