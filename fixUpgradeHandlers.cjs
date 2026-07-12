const fs = require('fs');
let file = fs.readFileSync('src/components/SkinSelector.tsx', 'utf8');

file = file.replace(/const handleSelectUpgrade = \(id: 'shield' \| 'boost' \| 'magnet'\) => \{/, 'const handleSelectUpgrade = (id: string) => {');

const handleBuyRegex = /const handleBuyUpgrade = \(\) => \{[\s\S]*?AudioEngine\.playCrash\(\);\n\s*\}\n\s*\};/;
const handleBuyRepl = `const handleBuyUpgrade = () => {
    if (!onUpdateStats) return;
    const cost = selectedUpgrade.cost(selectedUpgrade.currentLevel);
    if (stats.feathersCount >= cost && selectedUpgrade.currentLevel < selectedUpgrade.maxLevel) {
      const nextStats = {
        ...stats,
        feathersCount: stats.feathersCount - cost,
        [selectedUpgrade.statKey]: (stats[selectedUpgrade.statKey as keyof GameStats] as number || 0) + 1,
      };
      onUpdateStats(nextStats);
      AudioEngine.playCollect();
    } else {
      AudioEngine.playCrash();
    }
  };`;

file = file.replace(handleBuyRegex, handleBuyRepl);

fs.writeFileSync('src/components/SkinSelector.tsx', file);
