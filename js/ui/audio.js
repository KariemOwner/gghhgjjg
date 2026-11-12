/**
 * OmniCalc Pro - Web Audio API Synthetic Haptic Sound Engine
 * Provides subtle tactile feedback on keypress without any external audio asset dependencies.
 */

class AudioEngine {
  constructor() {
    this.soundMode = localStorage.getItem('omnicalc_sound') || 'laser'; // 'laser', 'mech', 'beep', 'off'
    this.audioCtx = null;
    this.initUserInteraction();
  }

  initUserInteraction() {
    const resumeAudio = () => {
      this.initAudio();
      document.removeEventListener('click', resumeAudio);
      document.removeEventListener('keydown', resumeAudio);
      document.removeEventListener('touchstart', resumeAudio);
    };
    document.addEventListener('click', resumeAudio, { once: true });
    document.addEventListener('keydown', resumeAudio, { once: true });
    document.addEventListener('touchstart', resumeAudio, { once: true });
  }

  initAudio() {
    if (!this.audioCtx && typeof window.AudioContext !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioCtx();
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  setSoundMode(mode) {
    this.soundMode = mode;
    localStorage.setItem('omnicalc_sound', mode);
  }

  playClick(type = 'default') {
    if (this.soundMode === 'off') return;
    this.initAudio();
    if (!this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (this.soundMode === 'mech') {
      // Mechanical switch click simulation
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.03);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc.start(now);
      osc.stop(now + 0.03);
    } else if (this.soundMode === 'beep') {
      // Pure high-tech beep
      osc.type = 'sine';
      osc.frequency.setValueAtTime(type === 'action' ? 880 : 640, now);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.start(now);
      osc.stop(now + 0.05);
    } else {
      // Futuristic laser click (default)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(type === 'action' ? 1200 : 780, now);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.04);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.start(now);
      osc.stop(now + 0.04);
    }
  }

  playError() {
    if (this.soundMode === 'off') return;
    this.initAudio();
    if (!this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.setValueAtTime(130, now + 0.08);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.start(now);
    osc.stop(now + 0.18);
  }
}

window.AudioEngine = new AudioEngine();
