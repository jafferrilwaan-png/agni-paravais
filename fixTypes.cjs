const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(/WeatherType\.SUNSET/g, 'WeatherType.KURINJI');
app = app.replace(/WeatherType\.STORY_MODE/g, 'WeatherType.STORY_MODE');
fs.writeFileSync('src/App.tsx', app);

let audio = fs.readFileSync('src/audio.ts', 'utf8');
audio = audio.replace(/WeatherType\.SUNSET/g, 'WeatherType.KURINJI');
audio = audio.replace(/WeatherType\.MISTY_DAWN/g, 'WeatherType.MULLAI');
audio = audio.replace(/WeatherType\.MONSOON/g, 'WeatherType.MARUTHAM');
audio = audio.replace(/WeatherType\.COSMIC_NEON/g, 'WeatherType.NEITHAL');
audio = audio.replace(/WeatherType\.DREAM_MODE/g, 'WeatherType.PALAI');
fs.writeFileSync('src/audio.ts', audio);

let gameCanvas = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');
gameCanvas = gameCanvas.replace(/WeatherType\.SUNSET/g, 'WeatherType.KURINJI');
gameCanvas = gameCanvas.replace(/WeatherType\.MISTY_DAWN/g, 'WeatherType.MULLAI');
gameCanvas = gameCanvas.replace(/WeatherType\.MONSOON/g, 'WeatherType.MARUTHAM');
gameCanvas = gameCanvas.replace(/WeatherType\.COSMIC_NEON/g, 'WeatherType.NEITHAL');
gameCanvas = gameCanvas.replace(/WeatherType\.DREAM_MODE/g, 'WeatherType.PALAI');
fs.writeFileSync('src/components/GameCanvas.tsx', gameCanvas);

let mainMenu = fs.readFileSync('src/components/MainMenu.tsx', 'utf8');
mainMenu = mainMenu.replace(/WeatherType\.SUNSET/g, 'WeatherType.KURINJI');
mainMenu = mainMenu.replace(/WeatherType\.MISTY_DAWN/g, 'WeatherType.MULLAI');
mainMenu = mainMenu.replace(/WeatherType\.MONSOON/g, 'WeatherType.MARUTHAM');
mainMenu = mainMenu.replace(/WeatherType\.COSMIC_NEON/g, 'WeatherType.NEITHAL');
mainMenu = mainMenu.replace(/WeatherType\.DREAM_MODE/g, 'WeatherType.PALAI');
fs.writeFileSync('src/components/MainMenu.tsx', mainMenu);
console.log('Fixed Enum Usages');
