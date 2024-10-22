import WaveformData, { type WaveformDataAudioBufferOptions, type WaveformDataAudioContextOptions } from 'waveform-data'

export async function loadWaveformData(
  audioContext: AudioContext,
  audioBuffer: AudioBuffer,
  scale: number = 1024
): Promise<WaveformData> {
  const options = {
    audio_context: audioContext,
    audio_buffer: audioBuffer,
    amplitude_scale: 0.9,
    scale: /* overview scale */ scale,
  } as WaveformDataAudioContextOptions & WaveformDataAudioBufferOptions
  return new Promise((resolve, reject) => {
    WaveformData.createFromAudio(options, (err, waveform) => {
      err ? reject(err) : resolve(waveform)
    })
  })
}

/**
 * Calculates the scale for the entire length of a track's waveform overview.
 *
 * @param durationSeconds - The total duration of the track in seconds.
 * @param sampleRate - The sample rate of the audio (e.g., 44100 for 44.1kHz).
 * @param canvasWidth - The width of the canvas or the number of output waveform data points.
 * @returns The calculated scale (number of input audio samples per output waveform data point).
 */
export function calculateWaveformScale(
  durationSeconds: number,
  sampleRate: number,
  canvasWidth: number
): number {
  // Calculate the total number of audio samples in the track
  const totalSamples = durationSeconds * sampleRate;

  // Calculate the scale (samples per waveform data point)
  const scale = totalSamples / canvasWidth;

  // Return the scale rounded to an integer
  return Math.round(scale);
}

/**
 * Calculate the waveform scale using pixels_per_second.
 *
 * @param sampleRate - The sample rate of the audio (e.g., 44100 for 44.1kHz).
 * @param pixelsPerSecond - The number of pixels representing one second of audio.
 * @returns The calculated scale (number of samples per output waveform data point).
 */
export function calculateScaleFromPixelsPerSecond(sampleRate: number, pixelsPerSecond: number): number {
  // Scale is the number of samples per pixel based on pixels per second
  return Math.round(sampleRate / pixelsPerSecond);
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
