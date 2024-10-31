class FXChain implements AudioChain {
  input: GainNode;
  output: GainNode;
  private readonly effects: AudioNode[];

  constructor(audioContext: AudioContext, effects: AudioNode[]) {
    this.input = audioContext.createGain();
    this.output = audioContext.createGain();
    this.effects = effects;

    if (this.effects.length === 0) {
      this.input.connect(this.output);
      return;
    }

    const [firstEffect] = this.effects;
    if (firstEffect instanceof AudioNode) {
      this.input.connect(firstEffect);
    }

    const [lastEffect] = this.effects.slice(-1);

    if (lastEffect instanceof AudioNode) {
      lastEffect.connect(this.output);
    }

    for (let i = 0; i < this.effects.length - 1; i++) {
      const effect = this.effects[i];
      const nextEffect = this.effects[i + 1];
      if (effect instanceof AudioNode && nextEffect instanceof AudioNode) {
        effect.connect(nextEffect);
      }
    }
  }

  connect(destination: AudioNode): void {
    this.output.connect(destination);
  }

  disconnect(): void {
    this.output.disconnect();
  }
}
