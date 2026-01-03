
export class AudioEngine {
  private ctx: AudioContext | null = null;
  private osc: OscillatorNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private gain: GainNode | null = null;
  private initialized = false;

  init() {
    if (this.initialized) return;
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    this.osc = this.ctx.createOscillator();
    this.osc.type = 'sine';
    this.osc.frequency.setValueAtTime(55, this.ctx.currentTime); // A1

    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.setValueAtTime(200, this.ctx.currentTime);
    this.filter.Q.setValueAtTime(1, this.ctx.currentTime);

    this.gain = this.ctx.createGain();
    this.gain.gain.setValueAtTime(0.1, this.ctx.currentTime);

    this.osc.connect(this.filter);
    this.filter.connect(this.gain);
    this.gain.connect(this.ctx.destination);

    this.osc.start();
    this.initialized = true;
  }

  update(intensity: number) {
    if (!this.ctx || !this.filter || !this.gain) return;
    const now = this.ctx.currentTime;
    
    // Smoothly update filter and gain based on interaction
    const targetFreq = 200 + intensity * 2000;
    const targetGain = 0.1 + intensity * 0.4;
    
    this.filter.frequency.setTargetAtTime(targetFreq, now, 0.1);
    this.gain.gain.setTargetAtTime(targetGain, now, 0.1);
  }

  triggerWhoosh() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 1, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const bpf = this.ctx.createBiquadFilter();
    bpf.type = 'bandpass';
    bpf.frequency.setValueAtTime(100, now);
    bpf.frequency.exponentialRampToValueAtTime(3000, now + 0.5);
    bpf.frequency.exponentialRampToValueAtTime(100, now + 1.0);

    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.3, now + 0.1);
    g.gain.linearRampToValueAtTime(0, now + 1.0);

    noise.connect(bpf);
    bpf.connect(g);
    g.connect(this.ctx.destination);

    noise.start();
    noise.stop(now + 1.0);
  }

  resume() {
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume();
    }
  }
}

export const audioEngine = new AudioEngine();
