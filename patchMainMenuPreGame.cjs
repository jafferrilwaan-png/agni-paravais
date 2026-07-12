const fs = require('fs');
let file = fs.readFileSync('src/components/MainMenu.tsx', 'utf8');

// Replace the handleStart with our custom pre-game logic
file = file.replace(/const handleStart = \(\) => \{[\s\S]*?\};/, 
`
  const [showPreGame, setShowPreGame] = useState(false);
  const [randomWeather, setRandomWeather] = useState(false);

  const handleStart = () => {
    if (!showPreGame) {
      setShowPreGame(true);
      return;
    }
    
    // Start the game!
    if (randomWeather) {
      const presets = WEATHER_PRESETS.map(p => p.type);
      const random = presets[Math.floor(Math.random() * presets.length)];
      onSelectWeather(random);
    }
    onStartGame();
  };
`);

// Add the pregame overlay before tasks overlay
const overlayRegex = /\{\/\* Tasks Overlay \*\/\}/;
const preGameOverlay = `
      {/* Pre-Game Selection Overlay */}
      {showPreGame && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-200">
          <div className="w-full max-w-2xl bg-black/90 border border-amber-500/30 rounded-3xl p-6 relative flex flex-col gap-6">
            <button 
              onClick={() => setShowPreGame(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            >✕</button>
            <h2 className="text-3xl font-serif text-[#ffcc33] font-bold text-center uppercase tracking-widest">
              Ready to Play
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Bird Selection */}
              <div>
                <h3 className="text-sm font-mono text-white/50 uppercase tracking-widest mb-4">Select Guardian</h3>
                <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {skins.filter(s => stats.unlockedSkins.includes(s.id)).map(skin => (
                    <button
                      key={skin.id}
                      onClick={() => onUpdateStats && onUpdateStats({ ...stats, selectedSkinId: skin.id })}
                      className={\`p-3 rounded-xl border text-left transition-all flex items-center gap-3 \${
                        stats.selectedSkinId === skin.id 
                          ? 'bg-amber-500/20 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                          : 'bg-black/40 border-white/10 hover:border-white/30'
                      }\`}
                    >
                      <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center bg-black/50" style={{ borderColor: skin.color }}>🪶</div>
                      <div>
                        <div className="text-sm font-bold" style={{ color: stats.selectedSkinId === skin.id ? skin.color : '#ccc' }}>{skin.name}</div>
                        <div className="text-[10px] text-slate-400">{skin.powerName}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Place Selection */}
              <div>
                <h3 className="text-sm font-mono text-white/50 uppercase tracking-widest mb-4">Select Starting Thinai</h3>
                <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  <button
                    onClick={() => setRandomWeather(true)}
                    className={\`p-3 rounded-xl border text-left transition-all flex items-center gap-3 \${
                      randomWeather 
                        ? 'bg-purple-500/20 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                        : 'bg-black/40 border-white/10 hover:border-white/30'
                    }\`}
                  >
                    <span className="text-2xl">🎲</span>
                    <div>
                      <div className={\`text-sm font-bold \${randomWeather ? 'text-purple-400' : 'text-slate-300'}\`}>Random Thinai</div>
                      <div className="text-[10px] text-slate-400">Let fate decide</div>
                    </div>
                  </button>
                  {WEATHER_PRESETS.map((preset) => (
                    <button
                      key={preset.type}
                      onClick={() => { setRandomWeather(false); onSelectWeather(preset.type); }}
                      className={\`p-3 rounded-xl border text-left transition-all flex items-center gap-3 \${
                        !randomWeather && stats.selectedWeather === preset.type 
                          ? 'bg-amber-500/20 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                          : 'bg-black/40 border-white/10 hover:border-white/30'
                      }\`}
                    >
                      <span className="text-2xl">{preset.icon || '🌲'}</span>
                      <div>
                        <div className={\`text-sm font-bold \${!randomWeather && stats.selectedWeather === preset.type ? 'text-amber-400' : 'text-slate-300'}\`}>
                          {preset.name.split(' ')[0]}
                        </div>
                        <div className="text-[10px] text-slate-400">{preset.name.split(' ')[1]}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <button
              onClick={handleStart}
              className="mt-4 w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 font-black text-black text-xl uppercase tracking-widest border border-amber-300 shadow-[0_0_40px_rgba(245,158,11,0.4)] hover:scale-105 active:scale-95 transition-all"
            >
              Start Run ➜
            </button>
          </div>
        </div>
      )}
      {/* Tasks Overlay */}
`;

file = file.replace(overlayRegex, preGameOverlay);
fs.writeFileSync('src/components/MainMenu.tsx', file);
console.log('Patched MainMenu pre-game');
