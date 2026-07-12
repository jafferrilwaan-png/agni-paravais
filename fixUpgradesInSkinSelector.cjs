const fs = require('fs');
let file = fs.readFileSync('src/components/SkinSelector.tsx', 'utf8');

const regex = /const upgrades = \[\s*\{\s*id: 'shield' as const,[\s\S]*?cost: \(level: number\) => \(level >= 5 \? 0 : 20 \* \(level \+ 1\)\),\s*\}\s*\];/;
// Let's just redefine the whole upgrades array and state

file = file.replace(/const \[selectedUpgradeId, setSelectedUpgradeId\] = useState<'shield' \| 'boost' \| 'magnet'>\('shield'\);/, 
`const [selectedUpgradeId, setSelectedUpgradeId] = useState<string>('passive_attack');`);

file = file.replace(/const upgrades = \[\s*\{[\s\S]*?cost: \(level: number\) => \(level >= 5 \? 0 : 20 \* \(level \+ 1\)\),\s*\}\s*\];/, 
`const upgrades = [
    {
      id: 'passive_attack',
      name: 'Divine Strike (Passive)',
      description: 'Increases the damage of your bird\\'s passive auto-attack against bosses.',
      icon: Flame,
      maxLevel: 5,
      currentLevel: stats.upgradePassiveLevel || 0,
      baseBenefit: 'Unlocks passive boss damage',
      nextBenefit: (level) => \`+\${((level + 1) * 20)}% damage output\`,
      cost: (level) => (level >= 5 ? 0 : 30 * (level + 1)),
      statKey: 'upgradePassiveLevel'
    },
    {
      id: 'ability_duration',
      name: 'Yantra Persistence',
      description: 'Increases the duration of all active power-ups and abilities.',
      icon: Sparkles,
      maxLevel: 5,
      currentLevel: stats.upgradeAbilityDuration || 0,
      baseBenefit: 'Unlocks base ability duration',
      nextBenefit: (level) => \`+\${((level + 1) * 0.5).toFixed(1)}s duration\`,
      cost: (level) => (level >= 5 ? 0 : 25 * (level + 1)),
      statKey: 'upgradeAbilityDuration'
    },
    {
      id: 'ability_cooldown',
      name: 'Vayu\\'s Breath (Cooldown)',
      description: 'Reduces the time it takes for your primary ability to recharge.',
      icon: Zap,
      maxLevel: 5,
      currentLevel: stats.upgradeAbilityCooldown || 0,
      baseBenefit: 'Standard ability cooldown',
      nextBenefit: (level) => \`-\${((level + 1) * 5)}% cooldown time\`,
      cost: (level) => (level >= 5 ? 0 : 35 * (level + 1)),
      statKey: 'upgradeAbilityCooldown'
    },
    {
      id: 'health',
      name: 'Sanjeevini Vitality',
      description: 'Enhances your bird\\'s innate health and survival capability (Heal faster during boss fights).',
      icon: Shield,
      maxLevel: 5,
      currentLevel: stats.upgradeHealth || 0,
      baseBenefit: 'Base vitality',
      nextBenefit: (level) => \`+\${((level + 1) * 10)}% heal rate\`,
      cost: (level) => (level >= 5 ? 0 : 40 * (level + 1)),
      statKey: 'upgradeHealth'
    }
  ];`);

fs.writeFileSync('src/components/SkinSelector.tsx', file);
