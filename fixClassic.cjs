const fs = require('fs');
let code = fs.readFileSync('src/components/GameCanvas.tsx', 'utf-8');

const classicBg = `
  const drawClassicBackground = (ctx: CanvasRenderingContext2D, dim: {width: number, height: number}) => {
    const state = stateRef.current;
    ctx.save();
    let grad = ctx.createLinearGradient(0, 0, 0, dim.height);
    if (weather === WeatherType.RAIN) {
      grad.addColorStop(0, '#1a2636');
      grad.addColorStop(1, '#2c3e50');
    } else if (weather === WeatherType.THUNDER) {
      grad.addColorStop(0, '#111');
      grad.addColorStop(1, '#222');
    } else if (weather === WeatherType.STORM) {
      grad.addColorStop(0, '#0a0a0a');
      grad.addColorStop(1, '#1a1a1a');
    } else {
      // Clear sky
      grad.addColorStop(0, '#87CEEB');
      grad.addColorStop(1, '#e0f6ff');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, dim.width, dim.height);
    ctx.restore();
  };
`;

code = code.replace(
  'const drawBackground = (',
  classicBg + '\n  const drawBackground = ('
);
fs.writeFileSync('src/components/GameCanvas.tsx', code);
