const fs = require('fs');
let file = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

// 1. Add heal charge to player state
file = file.replace(/invincibilityTimeLeft: 0,/, 'invincibilityTimeLeft: 0,\n      healCharge: 0,');

// 2. Boss damage handler
const bossHitRegex = /state\.boss\.health -= 1;/;
const bossHitRepl = `state.boss.health -= 1;
            
            // Skill-based healing mechanics (every 15 hits restores 1 life if below max)
            player.healCharge = (player.healCharge || 0) + 1;
            if (player.healCharge >= 15) {
              player.healCharge = 0;
              if (player.lives < 3) {
                player.lives += 1;
                setLives(player.lives);
                
                // Visual heal effect
                for(let h=0; h<20; h++) {
                  state.particles.push({
                    x: player.x + (Math.random() - 0.5) * 40,
                    y: player.y + (Math.random() - 0.5) * 40,
                    vx: 0,
                    vy: -2 - Math.random() * 2,
                    radius: 3 + Math.random() * 3,
                    color: '#4ade80',
                    alpha: 1,
                    decay: 0.02
                  });
                }
              }
            }`;
file = file.replace(bossHitRegex, bossHitRepl);

// 3. Passive Auto-Attacks
const updateLogicRegex = /\/\/ Render boss health bar/;
const passiveAttackLogic = `// --------------------------------------------------
      // PASSIVE ATTACK SYSTEM (CORE FEATURE)
      // --------------------------------------------------
      if (state.bossEncounterActive && !state.bossDefeated && state.boss.alpha > 0.8) {
        state.passiveAttackTimer = (state.passiveAttackTimer || 0) + 1 * ts;
        const skinType = selectedSkin.type || selectedSkin.id; // fallback to id if type undefined
        
        // AGNI PARAVAI: Continuous fire damage
        if (skinType === 'phoenix' && state.passiveAttackTimer > 15) {
          state.passiveAttackTimer = 0;
          state.boss.health -= 0.1; // small continuous damage
          state.particles.push({ x: state.boss.x, y: state.boss.y + (Math.random() - 0.5) * 80, vx: -5, vy: 0, radius: 2, color: '#FF4F00', alpha: 1, decay: 0.1 });
        }
        // MAYIL: Reflect small % damage (implemented below in projectile logic)
        // GARUDA: Periodic strong strike
        else if (skinType === 'garuda' && state.passiveAttackTimer > 180) {
           state.passiveAttackTimer = 0;
           state.boss.health -= 5;
           // Huge lightning strike visual
           state.particles.push({ x: state.boss.x, y: state.boss.y, vx: 0, vy: -10, radius: 10, color: '#FFC400', alpha: 1, decay: 0.05 });
        }
        // KOEL: Shadow pulse attack
        else if (skinType === 'sparrow' && state.passiveAttackTimer > 90) {
           state.passiveAttackTimer = 0;
           state.boss.health -= 2;
           // Slows down boss attack timer slightly
           state.boss.attackTimer -= 20; 
           state.particles.push({ x: state.boss.x, y: state.boss.y, vx: -2, vy: 0, radius: 8, color: '#AA00FF', alpha: 1, decay: 0.05 });
        }
        // SWAN: Low damage + healing support
        else if (skinType === 'swan' && state.passiveAttackTimer > 240) {
           state.passiveAttackTimer = 0;
           state.boss.health -= 1;
           player.healCharge = (player.healCharge || 0) + 5; // boosts healing significantly
           state.particles.push({ x: player.x, y: player.y, vx: 0, vy: -1, radius: 5, color: '#FFFFFF', alpha: 1, decay: 0.02 });
        }
      }

      // Render boss health bar`;

file = file.replace(updateLogicRegex, passiveAttackLogic);

fs.writeFileSync('src/components/GameCanvas.tsx', file);
console.log('Fixed Boss Logic');
