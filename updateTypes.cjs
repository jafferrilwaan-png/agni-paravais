const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf-8');
code = code.replace(
  /export interface GameState \{/,
  `export interface GameState {
  bossPowerFeathers: number;
  bossPowerActive: boolean;
  bossPowerTimeLeft: number;`
);
fs.writeFileSync('src/types.ts', code);
