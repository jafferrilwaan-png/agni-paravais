const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf8');

file = file.replace(/const handleFeatherCollect = \(amount: number\) => \{/, 
`const handleCoinCollect = (amount: number) => {
    setStats(prev => ({
      ...prev,
      coinsCount: (prev.coinsCount || 0) + amount
    }));
  };
  
  const handleFeatherCollect = (amount: number) => {`);

file = file.replace(/onFeatherCollect=\{handleFeatherCollect\}/, 
`onFeatherCollect={handleFeatherCollect}
              onCoinCollect={handleCoinCollect}`);

fs.writeFileSync('src/App.tsx', file);
console.log('Fixed App Coins');
