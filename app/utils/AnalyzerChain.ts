export class AnalyzerChain implements AudioChain {
  input: GainNode;
  output: GainNode;
  private readonly leftAnalyser: AnalyserNode;
  private readonly rightAnalyser: AnalyserNode;

  constructor(audioContext: AudioContext) {
    this.input = audioContext.createGain();
    this.output = audioContext.createGain();

    this.leftAnalyser = audioContext.createAnalyser();
    this.rightAnalyser = audioContext.createAnalyser();

    this.leftAnalyser.fftSize = 2048;
    this.rightAnalyser.fftSize = 2048;

    // Connect input to both analysers and analysers to output
    this.input.connect(this.leftAnalyser);
    this.input.connect(this.rightAnalyser);
    this.leftAnalyser.connect(this.output);
    this.rightAnalyser.connect(this.output);
  }

  connect(destination: AudioNode): void {
    this.output.connect(destination);
  }

  disconnect(): void {
    this.output.disconnect();
  }
}
