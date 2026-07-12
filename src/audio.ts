/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AudioSettings, WeatherType } from './types';

class WebAudioEngine {
  private ctx: AudioContext | null = null;
  private settings: AudioSettings = {
    musicVolume: 0.5,
    sfxVolume: 0.7,
    muted: false,
  };
  private beatInterval: number | null = null;
  private beatStep = 0;
  private currentScore = 0;
  private lastFluteFreq = 329.63; // E4 default
  private activeTheme: WeatherType = WeatherType.KURINJI;
  private currentLand = 'KURINJI';

  public setTheme(weather: WeatherType) {
    this.activeTheme = weather;
  }

  public setLand(land: string) {
    if (this.currentLand !== land) {
      this.currentLand = land;
      this.playLandTransitionCue();
    }
  }

  public playLandTransitionCue() {
    this.initContext();
    if (!this.ctx || this.settings.muted) return;

    const time = this.ctx.currentTime;
    // Ascending pentatonic Raga Mohanam sweep for land transitions (graceful Veena / Flute blend)
    const notes = [329.63, 392.00, 440.00, 523.25, 587.33, 659.25]; // E4, G4, A4, C5, D5, E5
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const noteTime = time + idx * 0.12;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.02, noteTime + 0.3);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, noteTime);

      const sfxVol = this.settings.sfxVolume;
      gain.gain.setValueAtTime(0, noteTime);
      gain.gain.linearRampToValueAtTime(sfxVol * 0.28, noteTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.8);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.8);
    });
  }

  private playLandAmbientCue() {
    this.initContext();
    if (!this.ctx || this.settings.muted || this.settings.sfxVolume <= 0) return;

    const time = this.ctx.currentTime;
    const sfxVol = this.settings.sfxVolume;

    switch (this.currentLand) {
      case 'KURINJI': {
        // Mountains - Wind + distant waterfall (low rumble waterfall)
        try {
          const osc = this.ctx.createOscillator();
          const filter = this.ctx.createBiquadFilter();
          const gain = this.ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(65, time);
          osc.frequency.linearRampToValueAtTime(55, time + 2.0);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(150, time);

          gain.gain.setValueAtTime(0, time);
          gain.gain.linearRampToValueAtTime(sfxVol * 0.18, time + 0.5);
          gain.gain.exponentialRampToValueAtTime(0.001, time + 2.0);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(time);
          osc.stop(time + 2.0);
        } catch (e) {}
        break;
      }
      case 'MULLAI': {
        // Forest - Birds chirping + insects (High frequency chirps)
        for (let i = 0; i < 3; i++) {
          const delay = i * 0.3;
          try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            const baseFreq = 2200 + Math.random() * 800;
            osc.frequency.setValueAtTime(baseFreq, time + delay);
            osc.frequency.exponentialRampToValueAtTime(baseFreq + 300, time + delay + 0.15);

            gain.gain.setValueAtTime(0, time + delay);
            gain.gain.linearRampToValueAtTime(sfxVol * 0.08, time + delay + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, time + delay + 0.15);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(time + delay);
            osc.stop(time + delay + 0.15);
          } catch (e) {}
        }
        break;
      }
      case 'MARUTHAM': {
        // Farmland - Village sounds + cows + wind (Play cow "Moo" sweeping 160Hz to 120Hz)
        try {
          const osc = this.ctx.createOscillator();
          const filter = this.ctx.createBiquadFilter();
          const gain = this.ctx.createGain();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(160, time);
          osc.frequency.linearRampToValueAtTime(120, time + 0.8);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(350, time);

          gain.gain.setValueAtTime(0, time);
          gain.gain.linearRampToValueAtTime(sfxVol * 0.12, time + 0.15);
          gain.gain.linearRampToValueAtTime(sfxVol * 0.08, time + 0.5);
          gain.gain.exponentialRampToValueAtTime(0.001, time + 0.8);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(time);
          osc.stop(time + 0.8);
        } catch (e) {}
        break;
      }
      case 'NEITHAL': {
        // Seashore - Waves + seagulls (high sweeps 950Hz -> 1350Hz -> 1050Hz)
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(950, time);
          osc.frequency.exponentialRampToValueAtTime(1350, time + 0.15);
          osc.frequency.exponentialRampToValueAtTime(1050, time + 0.35);

          gain.gain.setValueAtTime(0, time);
          gain.gain.linearRampToValueAtTime(sfxVol * 0.12, time + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, time + 0.45);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(time);
          osc.stop(time + 0.45);
        } catch (e) {}
        break;
      }
      case 'PAALAI':
      case 'PALAI': {
        // Desert - Desert wind + low rumble (Deep sub-rumble)
        try {
          const osc = this.ctx.createOscillator();
          const filter = this.ctx.createBiquadFilter();
          const gain = this.ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(50, time);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(100, time);

          gain.gain.setValueAtTime(0, time);
          gain.gain.linearRampToValueAtTime(sfxVol * 0.15, time + 0.3);
          gain.gain.exponentialRampToValueAtTime(0.001, time + 1.8);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(time);
          osc.stop(time + 1.8);
        } catch (e) {}
        break;
      }
    }
  }

  constructor() {
    // Load volume settings from localStorage if available
    try {
      const saved = localStorage.getItem('mystic_phoenix_audio_settings');
      if (saved) {
        this.settings = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load audio settings', e);
    }
  }

  private initContext() {
    if (!this.ctx) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      } catch (e) {
        console.warn('Web Audio API is not supported or was blocked by browser policies:', e);
      }
    }
    try {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    } catch (e) {
      console.warn('Failed to resume Web Audio context:', e);
    }
  }

  public resume() {
    this.initContext();
  }

  public setSettings(newSettings: Partial<AudioSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    try {
      localStorage.setItem('mystic_phoenix_audio_settings', JSON.stringify(this.settings));
    } catch (e) {
      console.warn('Failed to save audio settings', e);
    }
  }

  public getSettings(): AudioSettings {
    return this.settings;
  }

  private createGain(duration: number, volumeType: 'music' | 'sfx' = 'sfx'): GainNode | null {
    this.initContext();
    if (!this.ctx || this.settings.muted) return null;

    const baseVolume = volumeType === 'music' ? this.settings.musicVolume : this.settings.sfxVolume;
    if (baseVolume <= 0) return null;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(baseVolume * 0.4, this.ctx.currentTime);
    gain.connect(this.ctx.destination);
    return gain;
  }

  // FX: Flapping Wings
  public playFlap() {
    const gain = this.createGain(0.15);
    if (!gain || !this.ctx) return;

    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(this.settings.sfxVolume * 0.4, this.ctx.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  // FX: Passing obstacle (Authentic Bronze Temple Bell / வெண்கல மணி)
  public playScore() {
    const gain = this.createGain(1.2);
    if (!gain || !this.ctx) return;

    const time = this.ctx.currentTime;
    
    // Bronze bell harmonics: fundamental (C5), overtones (E5, G5, C6) and deep humming resonator (G3)
    const bellFrequencies = [196.00, 523.25, 659.25, 783.99, 1046.50, 1318.51];
    const decays = [1.2, 0.6, 0.5, 0.45, 0.35, 0.25];
    const relativeVolumes = [0.4, 1.0, 0.7, 0.6, 0.4, 0.2];

    bellFrequencies.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      osc.type = idx === 0 ? 'triangle' : 'sine'; // triangle for warm deep resonance hum
      osc.frequency.setValueAtTime(freq, time);
      
      // Add a minute frequency pitch-bend / vibrato to mimic real vibrating metal
      if (idx > 0) {
        osc.frequency.linearRampToValueAtTime(freq - 2, time + decays[idx]);
      }

      const subGain = this.ctx.createGain();
      subGain.gain.setValueAtTime(0, time);
      subGain.gain.linearRampToValueAtTime(this.settings.sfxVolume * 0.3 * relativeVolumes[idx], time + 0.01);
      subGain.gain.exponentialRampToValueAtTime(0.001, time + decays[idx]);

      subGain.connect(this.ctx.destination);
      osc.connect(subGain);
      osc.start(time);
      osc.stop(time + decays[idx]);
    });
  }

  // FX: PowerUp collected
  public playCollect() {
    const gain = this.createGain(0.5);
    if (!gain || !this.ctx) return;

    const notes = [440, 554, 659, 880]; // A4, C#5, E5, A5 (major arpeggio)
    const time = this.ctx.currentTime;

    notes.forEach((freq, index) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time + index * 0.08);
      
      const subGain = this.ctx.createGain();
      subGain.gain.setValueAtTime(0, time);
      subGain.gain.setValueAtTime(0, time + index * 0.08);
      subGain.gain.linearRampToValueAtTime(this.settings.sfxVolume * 0.25, time + index * 0.08 + 0.02);
      subGain.gain.exponentialRampToValueAtTime(0.001, time + index * 0.08 + 0.3);

      subGain.connect(this.ctx.destination);
      osc.connect(subGain);
      osc.start(time + index * 0.08);
      osc.stop(time + index * 0.08 + 0.30);
    });
  }

  // FX: Shield Activated
  public playShieldActivate() {
    const gain = this.createGain(0.5);
    if (!gain || !this.ctx) return;

    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.5);

    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(this.settings.sfxVolume * 0.2, this.ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);

    // Apply a subtle bandpass filter to make it "spacey"
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    filter.Q.setValueAtTime(3.0, this.ctx.currentTime);

    osc.connect(filter);
    filter.connect(gain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.5);
  }

  // FX: Slow Motion Start
  public playSlowMo() {
    const gain = this.createGain(0.6);
    if (!gain || !this.ctx) return;

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.6);

    gain.gain.setValueAtTime(this.settings.sfxVolume * 0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);

    osc.connect(gain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.6);
  }

  // FX: Boost Activate
  public playBoost() {
    const gain = this.createGain(0.8);
    if (!gain || !this.ctx) return;

    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(600, this.ctx.currentTime + 0.4);

    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(this.settings.sfxVolume * 0.3, this.ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);

    osc.connect(gain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.8);
  }

  // FX: Crash Explosion
  public playCrash() {
    const gain = this.createGain(0.8);
    if (!gain || !this.ctx) return;

    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(30, this.ctx.currentTime + 0.5);

    // Dynamic noise synth for the explosion crunch
    const bufferSize = this.ctx.sampleRate * 0.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(400, this.ctx.currentTime);
    noiseFilter.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.5);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(this.settings.sfxVolume * 0.4, this.ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);

    noiseNode.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    gain.gain.setValueAtTime(this.settings.sfxVolume * 0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);

    osc.connect(gain);
    
    osc.start();
    noiseNode.start();
    
    osc.stop(this.ctx.currentTime + 0.5);
    noiseNode.stop(this.ctx.currentTime + 0.5);
  }

  // FX: Near Miss Bell (Sacred Temple Bell)
  public playNearMiss() {
    const gain = this.createGain(0.6);
    if (!gain || !this.ctx) return;

    // A rich bell chime has a fundamental frequency and higher inharmonic partials
    const partials = [440, 554, 659, 880, 1200]; // Multi-tonal gong
    const decayTimes = [1.2, 0.8, 0.6, 0.4, 0.2];

    const time = this.ctx.currentTime;

    partials.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      const subGain = this.ctx.createGain();
      subGain.gain.setValueAtTime(0, time);
      subGain.gain.linearRampToValueAtTime(this.settings.sfxVolume * 0.2 * (1 / (idx + 1)), time + 0.01);
      subGain.gain.exponentialRampToValueAtTime(0.001, time + decayTimes[idx]);

      subGain.connect(this.ctx.destination);
      osc.connect(subGain);
      osc.start(time);
      osc.stop(time + decayTimes[idx]);
    });
  }

  // FX: Milestone Temple Bell Resonance (magnificent, sustained metallic gong/bell)
  public playTempleBellMilestone() {
    this.initContext();
    if (!this.ctx || this.settings.muted) return;

    const time = this.ctx.currentTime;
    const duration = 5.0; // Sustained metallic ring

    // Golden temple bell fundamental (deep G2/C3) and majestic high overtones
    const bellFrequencies = [98.00, 130.81, 261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
    const decays = [5.0, 4.5, 4.0, 3.5, 3.2, 2.8, 2.4, 2.0, 1.5, 1.2, 1.0];
    const relativeVolumes = [0.8, 0.9, 1.0, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1];

    bellFrequencies.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      
      // Use different waveforms for texture
      if (idx === 0 || idx === 1) {
        osc.type = 'triangle'; // deep booming bass hum
      } else if (idx < 5) {
        osc.type = 'triangle'; // warm overtones
      } else {
        osc.type = 'sine'; // pure high metal rings
      }
      
      osc.frequency.setValueAtTime(freq, time);
      
      // Add a distinct frequency vibrato (tremolo-like frequency bending) to mimic vibrating large temple bronze bell
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(4.5 + idx * 0.3, time); // slightly different beat frequencies for lush chorus
      lfoGain.gain.setValueAtTime(freq * 0.008, time); // slight frequency modulation
      
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      const subGain = this.ctx.createGain();
      subGain.gain.setValueAtTime(0, time);
      subGain.gain.linearRampToValueAtTime(this.settings.sfxVolume * 0.55 * relativeVolumes[idx], time + 0.05);
      subGain.gain.exponentialRampToValueAtTime(0.001, time + decays[idx]);

      subGain.connect(this.ctx.destination);
      osc.connect(subGain);
      
      lfo.start(time);
      osc.start(time);
      
      lfo.stop(time + decays[idx]);
      osc.stop(time + decays[idx]);
    });
  }

  // Spiritual celestial narration using SpeechSynthesis with procedural chord backing
  public speakSpiritual(text: string) {
    this.initContext();
    if (this.settings.muted) return;

    const time = this.ctx ? this.ctx.currentTime : 0;
    if (this.ctx) {
      const frequencies = [220.00, 329.63, 440.00, 659.25]; // Rich spiritual A minor chord
      frequencies.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(this.settings.sfxVolume * 0.12, time + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 2.0 - idx * 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(time);
        osc.stop(time + 2.0 - idx * 0.25);
      });
    }

    if (false) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.volume = this.settings.sfxVolume * 0.85;
        utterance.rate = 0.82; // cinematic slower tempo
        utterance.pitch = 0.75; // deeper divine voice
        
        const voices = window.speechSynthesis.getVoices();
        const selectedVoice = voices.find(v => v.lang.includes('en-IN') || v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('male'));
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('Speech synthesis failed', e);
      }
    }
  }

  // FX: Sanjeevini healing and rebirth chord sweep
  public playSanjeeviniGrace() {
    this.initContext();
    if (!this.ctx || this.settings.muted) return;

    const time = this.ctx.currentTime;
    const freqs = [130.81, 196.00, 261.63, 329.63, 392.00, 523.25];
    freqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, time + 2.5);

      filter.type = 'lowpass';
      filter.Q.setValueAtTime(4, time);
      filter.frequency.setValueAtTime(100, time);
      filter.frequency.exponentialRampToValueAtTime(3000, time + 2.0);

      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(this.settings.sfxVolume * 0.35 * (1 / (idx + 1)), time + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 3.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(time);
      osc.stop(time + 3.5);
    });
  }

  // FX: Agni Rage mode blazing roar and upward energy swoosh
  public playAgniRage() {
    this.initContext();
    if (!this.ctx || this.settings.muted) return;

    const time = this.ctx.currentTime;
    
    // Blazing fiery roar white noise
    try {
      const noiseLength = this.ctx.sampleRate * 2.0;
      const buffer = this.ctx.createBuffer(1, noiseLength, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < noiseLength; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noiseNode = this.ctx.createBufferSource();
      noiseNode.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(150, time);
      filter.frequency.exponentialRampToValueAtTime(2500, time + 1.2);
      filter.Q.setValueAtTime(5.0, time);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(this.settings.sfxVolume * 0.5, time + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 1.8);

      noiseNode.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noiseNode.start(time);
      noiseNode.stop(time + 2.0);
    } catch (e) {
      console.warn('Noise generation failed', e);
    }

    // Soaring sweep oscillator
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, time);
    osc.frequency.exponentialRampToValueAtTime(880, time + 1.5);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0, time);
    oscGain.gain.linearRampToValueAtTime(this.settings.sfxVolume * 0.25, time + 0.1);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 1.8);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 1.8);
  }

  // FX: Menu button select click
  public playButton() {
    // Subtle arcade haptic vibration for mobile devices (15ms pulse)
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      try {
        window.navigator.vibrate(15);
      } catch (e) {
        // dynamic block is fine
      }
    }

    const gain = this.createGain(0.2);
    if (!gain || !this.ctx) return;

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.setValueAtTime(500, this.ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(this.settings.sfxVolume * 0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  // dynamic update of player score to modify tempo
  public updateScore(score: number) {
    this.currentScore = score;
  }

  // Start background music loop (Procedural Gamelan/Pentatonic South Indian raga style)
  public startMusic() {
    if (this.beatInterval) return;

    this.initContext();
    this.beatStep = 0;
    
    // We run a timer that triggers beat steps
    const stepDuration = 240; // 240ms per sixteenth / eighth note beat
    
    this.beatInterval = window.setInterval(() => {
      this.playBeatStep();
    }, stepDuration);
  }

  public stopMusic() {
    if (this.beatInterval) {
      clearInterval(this.beatInterval);
      this.beatInterval = null;
    }
  }

  // Play a step in our procedural score beat (Veena + Flute + Mridangam classical Tamil orchestra)
  private playBeatStep() {
    if (!this.ctx || this.settings.muted || this.settings.musicVolume <= 0) return;
    if (this.ctx.state === 'suspended') return;

    const scoreModifier = Math.min(30, this.currentScore);
    const tempoStep = this.beatStep % 8;
    const time = this.ctx.currentTime;

    // Raga Mohanam Pentatonic Scale (C4, D4, E4, G4, A4, C5, D5, E5) - Auspicious, heroic Tamil raga
    const MohanamNotes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
    const baseVolume = this.settings.musicVolume * 0.35;

    // --- 0. SPECIAL THEME-BASED BACKGROUND LAYERS ---
    
    // a) ANCIENT CHANTING HUM (Sacred Hills - SUNSET)
    if (this.activeTheme === WeatherType.KURINJI && (tempoStep === 0 || tempoStep === 4)) {
      const chantGain = this.createGain(1.0, 'music');
      if (chantGain) {
        const chantOsc = this.ctx.createOscillator();
        chantOsc.type = 'sawtooth'; // nasal buzzing hum
        
        // Deep baritone chanting frequency (A2 hum)
        const chantFreq = 110.00;
        chantOsc.frequency.setValueAtTime(chantFreq, time);
        
        // Vocal formatting filter (lowpass resonant cutoff)
        const voiceFilter = this.ctx.createBiquadFilter();
        voiceFilter.type = 'lowpass';
        voiceFilter.frequency.setValueAtTime(200, time);
        voiceFilter.Q.setValueAtTime(5.0, time);
        
        chantGain.gain.setValueAtTime(0, time);
        chantGain.gain.linearRampToValueAtTime(baseVolume * 0.35, time + 0.15);
        chantGain.gain.exponentialRampToValueAtTime(0.001, time + 0.85);
        
        chantOsc.connect(voiceFilter);
        voiceFilter.connect(chantGain);
        chantOsc.start(time);
        chantOsc.stop(time + 0.85);
      }
    }

    // b) NADASWARAM SYNTH PIPING (Festival Street - MONSOON)
    if (this.activeTheme === WeatherType.MARUTHAM && [0, 2, 4, 6].includes(tempoStep)) {
      const nadaswaramGain = this.createGain(0.7, 'music');
      if (nadaswaramGain) {
        const nadOsc = this.ctx.createOscillator();
        nadOsc.type = 'sawtooth'; // bright reed pipe
        
        // Play very bright high notes (Octave + fifth shifted)
        const nadIndex = (tempoStep * 2 + Math.floor(scoreModifier / 2)) % MohanamNotes.length;
        const targetFreq = MohanamNotes[nadIndex] * 1.5; 
        
        // Dynamic microtonal slide gamakam
        nadOsc.frequency.setValueAtTime(targetFreq * 0.9, time);
        nadOsc.frequency.exponentialRampToValueAtTime(targetFreq, time + 0.08);
        
        // Piercing bandpass filter
        const nadFilter = this.ctx.createBiquadFilter();
        nadFilter.type = 'bandpass';
        nadFilter.frequency.setValueAtTime(1100, time);
        nadFilter.Q.setValueAtTime(2.2, time);
        
        nadaswaramGain.gain.setValueAtTime(0, time);
        nadaswaramGain.gain.linearRampToValueAtTime(baseVolume * 0.28, time + 0.04);
        nadaswaramGain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);
        
        nadOsc.connect(nadFilter);
        nadFilter.connect(nadaswaramGain);
        nadOsc.start(time);
        nadOsc.stop(time + 0.35);
      }
    }

    // c) THAVIL DRUM CRACKERS (Festival Street - MONSOON)
    if (this.activeTheme === WeatherType.MARUTHAM && [1, 3, 5, 7].includes(tempoStep)) {
      const thavilGain = this.createGain(0.4, 'music');
      if (thavilGain) {
        const thavilOsc = this.ctx.createOscillator();
        thavilOsc.type = 'triangle';
        
        // High tension leather slap snap
        thavilOsc.frequency.setValueAtTime(1500, time);
        thavilOsc.frequency.exponentialRampToValueAtTime(220, time + 0.03);
        
        thavilGain.gain.setValueAtTime(baseVolume * 0.42, time);
        thavilGain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
        
        thavilOsc.connect(thavilGain);
        thavilOsc.start(time);
        thavilOsc.stop(time + 0.04);
      }
    }

    // --- 1. CONTINUOUS TAMIL TEMPLE DRONE (Sruthi Box) ---
    // Drone on beat 0 and 4 to maintain background ambience
    if (tempoStep === 0 || tempoStep === 4) {
      const droneGain = this.createGain(0.9, 'music');
      if (droneGain) {
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(MohanamNotes[0] / 2, time); // C3 fundamental
        
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(MohanamNotes[3] / 2, time); // G3 dominant fifth
        
        droneGain.gain.setValueAtTime(0, time);
        droneGain.gain.linearRampToValueAtTime(baseVolume * 0.18, time + 0.1);
        droneGain.gain.exponentialRampToValueAtTime(0.001, time + 0.9);
        
        osc1.connect(droneGain);
        osc2.connect(droneGain);
        osc1.start(time);
        osc2.start(time);
        osc1.stop(time + 0.9);
        osc2.stop(time + 0.9);
      }
    }

    // --- 2. THE VEENA (Plucked String Melody with "Gamakam" Slides) ---
    const isVeenaBeat = [0, 2, 3, 5, 7].includes(tempoStep);
    if (isVeenaBeat && (Math.random() > 0.15 || scoreModifier > 15)) {
      const veenaGain = this.createGain(0.4, 'music');
      if (veenaGain) {
        const fundamental = this.ctx.createOscillator();
        const overtone = this.ctx.createOscillator(); // 2nd harmonic for rich metallic string pluck
        
        // Select note based on rhythm pattern and score
        const noteIndex = (tempoStep + Math.floor(scoreModifier / 3)) % MohanamNotes.length;
        const targetFreq = MohanamNotes[noteIndex];

        fundamental.type = 'sine';
        overtone.type = 'triangle';

        // Apply "Gamakam" (sliding pitch-bend / microtonal slur) typical of classical Tamil music
        fundamental.frequency.setValueAtTime(targetFreq * 0.94, time);
        fundamental.frequency.exponentialRampToValueAtTime(targetFreq, time + 0.08);

        overtone.frequency.setValueAtTime(targetFreq * 2 * 0.94, time);
        overtone.frequency.exponentialRampToValueAtTime(targetFreq * 2, time + 0.08);

        // Add slow vibrating pitch modulation (vibrato) for lingering resonance
        const vibrato = this.ctx.createOscillator();
        const vibratoGain = this.ctx.createGain();
        vibrato.frequency.value = 6; // 6 Hz vibrato
        vibratoGain.gain.value = 4;  // depth in Hz
        vibrato.connect(vibratoGain);
        vibratoGain.connect(fundamental.frequency);
        vibratoGain.connect(overtone.frequency);

        veenaGain.gain.setValueAtTime(0, time);
        veenaGain.gain.linearRampToValueAtTime(baseVolume * 0.35, time + 0.01); // Quick pluck strike
        veenaGain.gain.exponentialRampToValueAtTime(0.001, time + 0.38);

        fundamental.connect(veenaGain);
        overtone.connect(veenaGain);
        
        vibrato.start(time);
        fundamental.start(time);
        overtone.start(time);

        vibrato.stop(time + 0.38);
        fundamental.stop(time + 0.38);
        overtone.stop(time + 0.38);
      }
    }

    // --- 3. THE SACRED FLUTE (Wind lines with continuous portamento) ---
    // Every 4 beats, the flute breathes in and glides to a new melodic phrase
    if (tempoStep === 0 || tempoStep === 4) {
      // In Village Fields, the Flute is louder and more central; otherwise standard
      const fluteVolScale = this.activeTheme === WeatherType.MULLAI ? 1.45 : 1.0;
      const fluteGain = this.createGain(0.8, 'music');
      if (fluteGain) {
        const fluteOsc = this.ctx.createOscillator();
        fluteOsc.type = 'sine';

        // Choose a soaring high note for the flute (C5 - E5 range)
        const fluteIndex = 4 + (tempoStep + Math.floor(scoreModifier / 5)) % 4;
        const nextFreq = MohanamNotes[fluteIndex];

        // Portamento: Glide smoothly from the last flute frequency
        fluteOsc.frequency.setValueAtTime(this.lastFluteFreq, time);
        fluteOsc.frequency.exponentialRampToValueAtTime(nextFreq, time + 0.18);
        this.lastFluteFreq = nextFreq;

        // Soft breath vibrato LFO (5Hz amplitude/frequency modulation)
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.value = 5.2; // 5.2 Hz breath tremolo
        lfoGain.gain.value = 3;    // depth
        lfo.connect(lfoGain);
        lfoGain.connect(fluteOsc.frequency);

        fluteGain.gain.setValueAtTime(0, time);
        fluteGain.gain.linearRampToValueAtTime(baseVolume * 0.22 * fluteVolScale, time + 0.08); // soft wind attack
        fluteGain.gain.exponentialRampToValueAtTime(0.001, time + 0.8);

        fluteOsc.connect(fluteGain);
        lfo.start(time);
        fluteOsc.start(time);

        lfo.stop(time + 0.8);
        fluteOsc.stop(time + 0.8);
      }
    }

    // --- 4. THE MRIDANGAM (Double-sided Classical Drum Thalam) ---
    // In Village Fields, the drum percussion is softer and more peaceful
    const drumVolScale = this.activeTheme === WeatherType.MULLAI ? 0.38 : 1.0;

    // a) THOPPI: Deep Bass resonator strike ("Dhheem") on beats 0, 4, and optionally 6
    const isBassBeat = [0, 4].includes(tempoStep) || (tempoStep === 6 && scoreModifier > 10);
    if (isBassBeat) {
      const thoppiGain = this.createGain(0.35, 'music');
      if (thoppiGain) {
        const thoppiOsc = this.ctx.createOscillator();
        thoppiOsc.type = 'sine';

        // Deep pitch-glide sweep characteristic of Mridangam's bass slide
        thoppiOsc.frequency.setValueAtTime(145, time);
        thoppiOsc.frequency.exponentialRampToValueAtTime(62, time + 0.15);

        thoppiGain.gain.setValueAtTime(baseVolume * 0.45 * drumVolScale, time);
        thoppiGain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

        thoppiOsc.connect(thoppiGain);
        thoppiOsc.start(time);
        thoppiOsc.stop(time + 0.18);
      }
    }

    // b) VALANTHALAI: Snappy Treble leather slap ("Tha / Dhin") on beats 2, 6, 7 (and extra offbeats at high scores)
    const isTrebleBeat = [2, 6, 7].includes(tempoStep) || (scoreModifier > 18 && [1, 3, 5].includes(tempoStep) && Math.random() > 0.4);
    if (isTrebleBeat) {
      const valanthalaiGain = this.createGain(0.18, 'music');
      if (valanthalaiGain) {
        const slapOsc = this.ctx.createOscillator();
        slapOsc.type = 'triangle';

        // Snappy metallic sweep to emulate the black-paste center of leather
        slapOsc.frequency.setValueAtTime(850, time);
        slapOsc.frequency.exponentialRampToValueAtTime(320, time + 0.04);

        valanthalaiGain.gain.setValueAtTime(baseVolume * 0.38 * drumVolScale, time);
        valanthalaiGain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

        slapOsc.connect(valanthalaiGain);
        slapOsc.start(time);
        slapOsc.stop(time + 0.05);
      }
    }

    // Dispatch beat event for visual sync
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('audioBeat', { detail: { step: tempoStep } }));
    }

    // Every 16 beats (approx 3.8 seconds), play a subtle land-specific ambient cue
    if (this.beatStep % 16 === 0) {
      this.playLandAmbientCue();
    }

    this.beatStep++;
  }
}

export const AudioEngine = new WebAudioEngine();
