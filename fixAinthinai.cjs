const fs = require('fs');
let file = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

// Replace AinthinaiLand with WeatherType
file = file.replace(/export enum AinthinaiLand \{[\s\S]*?\}/g, '');
file = file.replace(/AinthinaiLand\.KURINJI/g, 'WeatherType.KURINJI');
file = file.replace(/AinthinaiLand\.MULLAI/g, 'WeatherType.MULLAI');
file = file.replace(/AinthinaiLand\.MARUTHAM/g, 'WeatherType.MARUTHAM');
file = file.replace(/AinthinaiLand\.NEITHAL/g, 'WeatherType.NEITHAL');
file = file.replace(/AinthinaiLand\.PAALAI/g, 'WeatherType.PALAI');
file = file.replace(/AinthinaiLand/g, 'WeatherType');

// Update getAinthinaiLand to start from the selected weather
file = file.replace(/export const getAinthinaiLand = \([^\{]+\{/, 'export const getAinthinaiLand = (distance: number, startWeather: WeatherType): WeatherType => {');

// We'll replace getAinthinaiLand completely
const newGetAinthinaiLand = `
export const getAinthinaiLand = (distance: number, startWeather: WeatherType): WeatherType => {
  const lands = [
    WeatherType.KURINJI,
    WeatherType.MULLAI,
    WeatherType.MARUTHAM,
    WeatherType.NEITHAL,
    WeatherType.PALAI
  ];
  const startIdx = lands.indexOf(startWeather) !== -1 ? lands.indexOf(startWeather) : 0;
  const cycleIdx = Math.floor(distance / 400);
  return lands[(startIdx + cycleIdx) % lands.length];
};
`;
file = file.replace(/export const getAinthinaiLand[\s\S]*?};/, newGetAinthinaiLand);

// Update drawBackground to always use the new logic
file = file.replace(/if \(weather === WeatherType\.DREAM_MODE \|\| weather === WeatherType\.STORY_MODE\) \{/, 'if (true) {');

// Fix the classic background fallback - though if it's `if (true)` we don't need to touch much, it just always executes the Ainthinai logic.

// We need to fix the calls to getAinthinaiLand
file = file.replace(/let distanceLand = getAinthinaiLand\(distanceMeters\);/g, 'let distanceLand = getAinthinaiLand(distanceMeters, weather);');
file = file.replace(/const currentLand = getAinthinaiLand\(distanceMeters\);/g, 'const currentLand = getAinthinaiLand(distanceMeters, weather);');

// The `weather === WeatherType.DREAM_MODE` checks in obstacle spawning and such
file = file.replace(/weather === WeatherType\.DREAM_MODE \|\| weather === WeatherType\.STORY_MODE/g, 'true');

// Fix Classic background references? Wait, we're not using classic background anymore.

fs.writeFileSync('src/components/GameCanvas.tsx', file);
console.log('Fixed AinthinaiLand');
