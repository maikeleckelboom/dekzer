export interface LimiterOptions {
  threshold?: number
  ratio?: number
  attack?: number
  release?: number
  knee?: number
}

/**
 * Limiter Options
 *
 * @param threshold - The point at which the compressor is activated.
 * @param ratio - How aggressively the compressor will reduce the signal when it exceeds the threshold.
 * @param attack - How long the compressor takes to reach full compression after the signal crosses the threshold.
 * @param release - How quickly the compressor recovers after peak gain reduction.
 * @param knee - How soft or hard the compression will occur around the threshold.
 * @returns DynamicsCompressorOptions
 * @see https://developer.mozilla.org/en-US/docs/Web/API/DynamicsCompressorNode/DynamicsCompressorNode
 */
export const LimiterOptions: {
  master: Required<LimiterOptions>
  track: Required<LimiterOptions>
} = {
  master: {
    threshold: -1, // Slightly higher threshold to catch peaks
    ratio: 10, // 10:1 ratio for more aggressive limiting
    attack: 5 / 100, // Normalize attack time to a max of 100 ms
    release: 100 / 1000, // Normalize release time to a max of 1000 ms
    knee: 0 // Hard knee, remains 0
  },
  track: {
    threshold: -6, // Threshold in dB to allow for some headroom
    ratio: 4, // 4:1 ratio for moderate limiting
    attack: 10 / 100, // Normalize attack time to a max of 100 ms
    release: 50 / 1000, // Normalize release time to a max of 1000 ms
    knee: 0 // Hard knee, remains 0
  }
}

/**
 * Create a limiter node to prevent clipping
 *
 * @param audioContext<AudioContext>
 * @param options<DynamicsCompressorOptions>
 */
export function createAudioLimiter(
  audioContext: AudioContext,
  options?: LimiterOptions
): DynamicsCompressorNode {
  const limiter = audioContext.createDynamicsCompressor()
  limiter.threshold.value = options?.threshold ?? -1
  limiter.ratio.value = options?.ratio ?? 10
  limiter.attack.value = options?.attack ?? 5 / 100
  limiter.release.value = options?.release ?? 100 / 1000
  limiter.knee.value = options?.knee ?? 0
  return limiter
}
