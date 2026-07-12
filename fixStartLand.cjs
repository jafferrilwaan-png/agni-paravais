const fs = require('fs');
let file = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

// The logic inside endless mode (else block)
const regex = /\} else \{\s*const landSequence = \[\s*WeatherType\.KURINJI,\s*WeatherType\.MULLAI,\s*WeatherType\.MARUTHAM,\s*WeatherType\.NEITHAL,\s*WeatherType\.PALAI\s*\];\s*\/\/ Sequentially switch lands every 15 score\s*const index = Math\.floor\(state\.currentScore \/ 15\) \% landSequence\.length;\s*distanceLand = landSequence\[index\];\s*\}/;

const newLogic = `} else {
        const lands = [
          WeatherType.KURINJI,
          WeatherType.MULLAI,
          WeatherType.MARUTHAM,
          WeatherType.NEITHAL,
          WeatherType.PALAI
        ];
        const startIdx = lands.indexOf(weather) !== -1 ? lands.indexOf(weather) : 0;
        const cycleIdx = Math.floor(distanceMeters / 400); // 400 meters per land
        distanceLand = lands[(startIdx + cycleIdx) % lands.length];
      }`;

file = file.replace(regex, newLogic);

// also update the fallback getWeatherType function
const getWeatherTypeRegex = /export const getWeatherType = \(distance: number\): WeatherType => \{[\s\S]*?\};/;
const newGetWeatherType = `export const getWeatherType = (distance: number, startWeather: WeatherType = WeatherType.KURINJI): WeatherType => {
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
};`;

file = file.replace(getWeatherTypeRegex, newGetWeatherType);

// Update calls to getWeatherType to include weather
file = file.replace(/getWeatherType\(distanceMeters\)/g, 'getWeatherType(distanceMeters, weather)');

fs.writeFileSync('src/components/GameCanvas.tsx', file);
console.log('Fixed Starting Land');
