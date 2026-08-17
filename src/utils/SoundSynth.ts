export class SoundSynth {
  private static context: AudioContext | null = null;
  private static bgmTimer: number | null = null;
  private static activeOscillators: { osc: any; gain: any }[] = [];
  private static currentBgmType: 'village' | 'arena' | 'menu' | 'dungeon' | null = null;

  public static initAudioOnUserGesture(): void {
    const unlock = () => {
      try {
        const ctx = this.getContext();
        if (ctx && ctx.state === 'suspended') {
          ctx.resume();
        }
      } catch (e) {
        // ignore
      }
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
  }

  private static getContext(): AudioContext {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.context.state === 'suspended') {
      this.context.resume().catch(() => {});
    }
    return this.context;
  }

  private static getNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const bufferSize = ctx.sampleRate * 0.15; // 0.15 segundos de ruído
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  public static playSlash(): void {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch (e) {
      console.warn('[SoundSynth] Erro no som Slash:', e);
    }
  }

  public static playFireball(): void {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(250, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.26);
    } catch (e) {
      console.warn('[SoundSynth] Erro no som Fireball:', e);
    }
  }

  public static playExplosion(): void {
    try {
      const ctx = this.getContext();
      const noise = this.getNoiseBuffer(ctx);
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noise;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(1000, ctx.currentTime);
      noiseFilter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(1, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noiseSource.start();
    } catch (e) {
      console.warn('[SoundSynth] Erro no som Explosion:', e);
    }
  }

  public static playLevelUp(): void {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(554.37, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.2);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.3, ctx.currentTime + 0.3);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn('[SoundSynth] Erro no som LevelUp:', e);
    }
  }

  public static playArrow(): void {
    try {
      const ctx = this.getContext();
      const noise = ctx.createBufferSource();
      noise.buffer = this.getNoiseBuffer(ctx);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1000, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.12);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
      noise.stop(ctx.currentTime + 0.13);
    } catch (e) {
      console.warn('[SoundSynth] Erro no som Arrow:', e);
    }
  }

  public static playDash(): void {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.15);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);

      gain.gain.setValueAtTime(0.14, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch (e) {
      console.warn('[SoundSynth] Erro no som Dash:', e);
    }
  }

  public static playLoot(): void {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Nota 1: C5 (523.25 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now);
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(now + 0.11);

      // Nota 2: G5 (783.99 Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(783.99, now + 0.08);
      gain2.gain.setValueAtTime(0.12, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.23);
    } catch (e) {
      console.warn('[SoundSynth] Erro no som Loot:', e);
    }
  }

  public static playUpgrade(): void {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Som do martelo da bigorna
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(150, now);
      osc1.frequency.linearRampToValueAtTime(40, now + 0.15);
      gain1.gain.setValueAtTime(0.35, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(now + 0.19);

      // Anel metálico de ressonância
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1400, now);
      gain2.gain.setValueAtTime(0.15, now);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start();
      osc2.stop(now + 0.42);
    } catch (e) {
      console.warn('[SoundSynth] Erro no som Upgrade:', e);
    }
  }

  public static playClick(): void {
    this.playBuy();
  }

  public static playBuy(): void {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      // Pequeno chocalho de moedas
      for (let i = 0; i < 4; i++) {
        const timeOffset = now + i * 0.06;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200 + Math.random() * 800, timeOffset);
        gain.gain.setValueAtTime(0.06, timeOffset);
        gain.gain.exponentialRampToValueAtTime(0.005, timeOffset + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(timeOffset);
        osc.stop(timeOffset + 0.06);
      }
    } catch (e) {
      console.warn('[SoundSynth] Erro no som Buy:', e);
    }
  }

  public static playHurt(): void {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(60, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.22, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    } catch (e) {
      console.warn('[SoundSynth] Erro no som Hurt:', e);
    }
  }

  public static playTextBlip(): void {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(420 + Math.random() * 80, ctx.currentTime);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.035);
    } catch (e) {
      // Ignora pequenos erros de áudio no diálogo
    }
  }

  public static playBGM(type: 'village' | 'arena' | 'menu' | 'dungeon'): void {
    try {
      if (this.currentBgmType === type) return;
      this.stopBGM();
      this.currentBgmType = type;

      const ctx = this.getContext();
      let index = 0;

      // Progressão de acordes medievais procedimentais
      const villageChords = [
        [220.00, 261.63, 329.63], // Am (Lá menor)
        [196.00, 246.94, 293.66], // G (Sol maior)
        [174.61, 220.00, 261.63], // F (Fá maior)
        [164.81, 207.65, 246.94]  // E (Mi maior)
      ];

      const arenaChords = [
        [146.83, 174.61, 220.00], // Dm (Ré menor)
        [130.81, 164.81, 196.00], // C (Dó maior)
        [110.00, 138.59, 164.81], // A (Lá maior)
        [116.54, 146.83, 174.61]  // Bb (Si bemol maior)
      ];

      const dungeonChords = [
        [98.00, 116.54, 146.83],  // Gm baixo
        [87.31, 110.00, 130.81],  // F baixo
        [73.42, 92.50, 110.00]    // Dm profundo
      ];

      const menuChords = [
        [110.00, 164.81, 220.00], // A arpeggio
        [116.54, 174.61, 233.08]  // Bb arpeggio
      ];

      const chords = type === 'arena' ? arenaChords :
                     type === 'dungeon' ? dungeonChords :
                     type === 'menu' ? menuChords : villageChords;
                     
      const interval = type === 'arena' ? 180 : 320; // Arena mais acelerada

      this.bgmTimer = window.setInterval(() => {
        const chord = chords[Math.floor(index / 4) % chords.length];
        const noteFreq = chord[index % chord.length];
        index++;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type === 'arena' ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(noteFreq, ctx.currentTime);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(type === 'arena' ? 550 : 380, ctx.currentTime);

        // Volume muito baixo para ficar de fundo
        gain.gain.setValueAtTime(type === 'arena' ? 0.012 : 0.022, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (type === 'arena' ? 0.32 : 0.55));

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + (type === 'arena' ? 0.35 : 0.6));

        this.activeOscillators.push({ osc, gain });
        if (this.activeOscillators.length > 20) {
          this.activeOscillators.shift();
        }
      }, interval);

    } catch (e) {
      console.warn('[SoundSynth] Erro ao tocar BGM:', e);
    }
  }

  public static stopBGM(): void {
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
    this.currentBgmType = null;
  }
}
