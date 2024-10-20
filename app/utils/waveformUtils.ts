import WaveformData from 'waveform-data'

export async function loadWaveformData(
  audioContext: AudioContext,
  audioBuffer: AudioBuffer,
  scale: number = 256
): Promise<WaveformData> {
  const options = {
    audio_context: audioContext,
    audio_buffer: audioBuffer,
    scale
  }
  return new Promise((resolve, reject) => {
    WaveformData.createFromAudio(options, (err, waveform) => {
      err ? reject(err) : resolve(waveform)
    })
  })
}

export function scaleY(amplitude: number, height: number, bits: 8 | 16 = 8): number {
  const range = 1 << bits
  let offset = 1 << (bits - 1)
  return height - ((amplitude + offset) * height) / range
}

export function loopForward(length: number, fn: (x: number) => void): void {
  for (let x = 0; x < length; x++) {
    fn(x)
  }
}

export function loopBackward(length: number, fn: (x: number) => void): void {
  for (let x = length - 1; x >= 0; x--) {
    fn(x)
  }
}
