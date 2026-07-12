const fs = require('fs');
let code = fs.readFileSync('src/components/GameCanvas.tsx', 'utf-8');

const newClassicBg = `
  const drawClassicBackground = (ctx: CanvasRenderingContext2D, dim: {width: number, height: number}) => {
    ctx.save();
    let grad = ctx.createLinearGradient(0, 0, 0, dim.height);
    if (weather === WeatherType.MONSOON) {
      grad.addColorStop(0, '#0a1a2a');
      grad.addColorStop(1, '#1a2a3a');
    } else if (weather === WeatherType.COSMIC_NEON) {
      grad.addColorStop(0, '#10002b');
      grad.addColorStop(0.5, '#3c096c');
      grad.addColorStop(1, '#7b2cbf');
    } else if (weather === WeatherType.MISTY_DAWN) {
      grad.addColorStop(0, '#e0e5ec');
      grad.addColorStop(1, '#f7f9fc');
    } else {
      // SUNSET
      grad.addColorStop(0, '#ff7e5f');
      grad.addColorStop(1, '#feb47b');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, dim.width, dim.height);
    ctx.restore();
  };`;

code = code.replace(
  /const drawClassicBackground = \(ctx: CanvasRenderingContext2D, dim: \{width: number, height: number\}\) => \{[\s\S]*?ctx\.restore\(\);\n  \};/,
  newClassicBg
);

fs.writeFileSync('src/components/GameCanvas.tsx', code);
