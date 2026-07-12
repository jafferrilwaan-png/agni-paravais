const fs = require('fs');
let file = fs.readFileSync('src/types.ts', 'utf8');

file = file.replace(/upgradeMagnetLevel\?: number;/, 
`upgradeMagnetLevel?: number;
  upgradePassiveLevel?: number;
  upgradeAbilityDuration?: number;
  upgradeAbilityCooldown?: number;
  upgradeHealth?: number;`);

fs.writeFileSync('src/types.ts', file);
console.log('Added upgrade stats');
