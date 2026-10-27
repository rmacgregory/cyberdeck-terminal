/**
 * Web Audio API Analog CRT Synthesizer
 * Generates realistic vintage cathode ray tube coil degauss sounds
 * without needing external audio files.
 */

class AudioSynthesizer {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return null;

    if (!this.ctx) {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Synthesizes a true analog CRT Degaussing coil sound:
   * 1. Metallic relay solenoid "THUMP / CLACK" at t=0
   * 2. Powerful 50Hz/60Hz electromagnetic saturation buzz with harmonic overtones
   * 3. Rapid exponential magnetic coil decay over ~1.6 seconds
   * 4. Soft mechanical click settling at the end
   */
  public playDegaussSound(): void {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Master Gain for Degauss
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.7, now);
      masterGain.connect(ctx.destination);

      // --- 1. Mechanical Relay Solenoid "CLACK / THUMP" (Low freq punch) ---
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = 'sine';
      clickOsc.frequency.setValueAtTime(140, now);
      clickOsc.frequency.exponentialRampToValueAtTime(32, now + 0.08);

      clickGain.gain.setValueAtTime(0.85, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      clickOsc.connect(clickGain);
      clickGain.connect(masterGain);
      clickOsc.start(now);
      clickOsc.stop(now + 0.1);

      // --- 2. High frequency relay snap (noise burst) ---
      const bufferSize = ctx.sampleRate * 0.03;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const snapNoise = ctx.createBufferSource();
      snapNoise.buffer = noiseBuffer;
      const snapFilter = ctx.createBiquadFilter();
      snapFilter.type = 'highpass';
      snapFilter.frequency.setValueAtTime(1200, now);
      const snapGain = ctx.createGain();
      snapGain.gain.setValueAtTime(0.35, now);
      snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      snapNoise.connect(snapFilter);
      snapFilter.connect(snapGain);
      snapGain.connect(masterGain);
      snapNoise.start(now);
      snapNoise.stop(now + 0.04);

      // --- 3. Electromagnetic 60Hz Coil Hum & Harmonics (Main Body) ---
      const humOsc1 = ctx.createOscillator(); // 60Hz fundamental
      const humOsc2 = ctx.createOscillator(); // 120Hz 2nd harmonic
      const humOsc3 = ctx.createOscillator(); // 180Hz 3rd harmonic
      const humGain = ctx.createGain();

      humOsc1.type = 'triangle';
      humOsc1.frequency.setValueAtTime(62, now);
      humOsc1.frequency.exponentialRampToValueAtTime(54, now + 1.6);

      humOsc2.type = 'sawtooth';
      humOsc2.frequency.setValueAtTime(124, now);
      humOsc2.frequency.exponentialRampToValueAtTime(108, now + 1.6);

      humOsc3.type = 'sine';
      humOsc3.frequency.setValueAtTime(186, now);
      humOsc3.frequency.exponentialRampToValueAtTime(162, now + 1.6);

      // Resonant Lowpass filter to shape the metallic chassis resonance
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(380, now);
      filter.Q.setValueAtTime(4.5, now);

      // Envelope: initial burst at t+0.02, sustaining and decaying exponentially
      humGain.gain.setValueAtTime(0.01, now);
      humGain.gain.linearRampToValueAtTime(0.9, now + 0.04);
      humGain.gain.exponentialRampToValueAtTime(0.2, now + 0.65);
      humGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.65);

      humOsc1.connect(filter);
      humOsc2.connect(filter);
      humOsc3.connect(filter);
      filter.connect(humGain);
      humGain.connect(masterGain);

      humOsc1.start(now + 0.01);
      humOsc2.start(now + 0.01);
      humOsc3.start(now + 0.01);

      humOsc1.stop(now + 1.7);
      humOsc2.stop(now + 1.7);
      humOsc3.stop(now + 1.7);

      // --- 4. Sub-bass vibration rumble ---
      const rumbleOsc = ctx.createOscillator();
      const rumbleGain = ctx.createGain();
      rumbleOsc.type = 'sine';
      rumbleOsc.frequency.setValueAtTime(45, now);
      rumbleOsc.frequency.exponentialRampToValueAtTime(28, now + 1.2);
      rumbleGain.gain.setValueAtTime(0.5, now);
      rumbleGain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);

      rumbleOsc.connect(rumbleGain);
      rumbleGain.connect(masterGain);
      rumbleOsc.start(now);
      rumbleOsc.stop(now + 1.35);

      // --- 5. Final Relay Disengage Click at t=1.65 ---
      const endClickOsc = ctx.createOscillator();
      const endClickGain = ctx.createGain();
      endClickOsc.type = 'triangle';
      endClickOsc.frequency.setValueAtTime(220, now + 1.65);
      endClickOsc.frequency.exponentialRampToValueAtTime(80, now + 1.71);
      endClickGain.gain.setValueAtTime(0.001, now);
      endClickGain.gain.setValueAtTime(0.4, now + 1.65);
      endClickGain.gain.exponentialRampToValueAtTime(0.001, now + 1.72);

      endClickOsc.connect(endClickGain);
      endClickGain.connect(masterGain);
      endClickOsc.start(now + 1.65);
      endClickOsc.stop(now + 1.73);
    } catch {
      // Audio not permitted or supported
    }
  }
}

export const audioSynthesizer = new AudioSynthesizer();
