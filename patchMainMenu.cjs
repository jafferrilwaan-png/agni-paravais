const fs = require('fs');
let file = fs.readFileSync('src/components/MainMenu.tsx', 'utf8');

// Replace the top div
const regex = /<div className="absolute inset-0 z-50 flex items-center justify-center bg-black\/60 backdrop-blur-sm p-4">/;
const newDiv = `
  const BACKGROUND_IMAGES = {
    [WeatherType.KURINJI]: '/src/assets/images/kurinji_bg_1783843688465.jpg',
    [WeatherType.MULLAI]: '/src/assets/images/mullai_bg_1783843701035.jpg',
    [WeatherType.MARUTHAM]: '/src/assets/images/marutham_bg_1783843712358.jpg',
    [WeatherType.NEITHAL]: '/src/assets/images/neithal_bg_1783843723561.jpg',
    [WeatherType.PALAI]: '/src/assets/images/palai_bg_1783843735587.jpg'
  };

  const currentBg = BACKGROUND_IMAGES[stats.selectedWeather] || BACKGROUND_IMAGES[WeatherType.KURINJI];

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center animate-parallax-slow opacity-60"
        style={{ backgroundImage: \`url(\${currentBg})\`, transform: 'scale(1.1)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
`;

file = file.replace(regex, newDiv);
fs.writeFileSync('src/components/MainMenu.tsx', file);
console.log('Patched MainMenu background');
