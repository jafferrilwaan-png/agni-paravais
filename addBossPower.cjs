const fs = require('fs');
let code = fs.readFileSync('src/components/GameCanvas.tsx', 'utf-8');

const activateFn = `
  const activateBossPower = () => {
    const state = stateRef.current;
    if (state.bossPowerFeathers < 3 || state.bossPowerActive) return;
    
    state.bossPowerActive = true;
    state.bossPowerFeathers = 0;
    state.bossPowerTimeLeft = 240; // 4 seconds
    
    AudioEngine.playPowerUp();
    
    if (selectedSkin.id === 'agni') {
      AudioEngine.speakSpiritual("FLAME BURST!");
      state.screenShake = 30;
      // Spawn massive flame particles
    } else if (selectedSkin.id === 'mayil') {
      AudioEngine.speakSpiritual("DIVINE SHIELD!");
      state.player.shieldTimeLeft = 240;
    } else if (selectedSkin.id === 'garuda') {
      AudioEngine.speakSpiritual("SKY DASH!");
      state.player.boostTimeLeft = 240;
    } else if (selectedSkin.id === 'koel') {
      AudioEngine.speakSpiritual("SHADOW PHASE!");
      state.player.invincibilityTimeLeft = 240;
    } else if (selectedSkin.id === 'swan') {
      AudioEngine.speakSpiritual("HEALING AURA!");
      if (state.player.lives < 3) {
        state.player.lives++;
        setLives(state.player.lives);
      }
    }
  };

  // Trigger Agni Rage Mode`;

code = code.replace(
  '// Trigger Agni Rage Mode',
  activateFn
);
fs.writeFileSync('src/components/GameCanvas.tsx', code);
