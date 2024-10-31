export interface AudioChain {
  input: AudioNode;
  output: AudioNode;
  connect(destination: AudioNode): void;
  disconnect(): void;
}
