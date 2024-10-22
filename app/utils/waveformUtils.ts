import WaveformData, { type WaveformDataAudioBufferOptions, type WaveformDataAudioContextOptions } from 'waveform-data'

/**
 * Generate waveform data from an audio buffer.
 *
 * @param audioContext
 * @param audioBuffer
 * @param scale
 * @param amplitudeScale
 */
export async function loadWaveformData(
  audioContext: AudioContext,
  audioBuffer: AudioBuffer,
  scale: number = 512,
  amplitudeScale: number = 0.9
): Promise<WaveformData> {
  const options = {
    audio_context: audioContext,
    audio_buffer: audioBuffer,
    amplitude_scale: amplitudeScale,
    scale: scale
  } as WaveformDataAudioContextOptions & WaveformDataAudioBufferOptions
  return new Promise((resolve, reject) => {
    WaveformData.createFromAudio(options, (err, waveform) => {
      err ? reject(err) : resolve(waveform)
    })
  })
}

/**
 * Calculate the waveform scale using pixels_per_second.
 *
 * @param sampleRate - The sample rate of the audio (e.g., 44100 for 44.1kHz).
 * @param pixelsPerSecond - The number of pixels representing one second of audio.
 * @returns The calculated scale (number of samples per output waveform data point).
 */
export function calculateScaleFromPixelsPerSecond(
  sampleRate: number,
  pixelsPerSecond: number
): number {
  return Math.round(sampleRate / pixelsPerSecond)
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
