export interface LimiterOptions {
  threshold?: number
  ratio?: number
  attack?: number
  release?: number
  knee?: number
}

/**
 * @param threshold - The point at which the compressor is activated.
 * @param ratio - How aggressively the compressor will reduce the signal when it exceeds the threshold.
 * @param attack - How long the compressor takes to reach full compression after the signal crosses the threshold.
 * @param release - How quickly the compressor recovers after peak gain reduction.
 * @param knee - How soft or hard the compression will occur around the threshold (softening).
 * @returns DynamicsCompressorOptions
 * @see https://developer.mozilla.org/en-US/docs/Web/API/DynamicsCompressorNode/DynamicsCompressorNode
 */
export const LimiterOptions: {
  master: Required<LimiterOptions>
  track: Required<LimiterOptions>
  balanced: Required<LimiterOptions>
} = {
  master: {
    threshold: -6, // +3dB with -9dB headroom
    ratio: 10,
    attack: 0.05,
    release: 0.2,
    knee: 0,
  },
  track: {
    threshold: -6, // +3dB with -9dB headroom
    ratio: 4,
    attack: 0.005,
    release: 0.1,
    knee: 0,
  },
  balanced: {
    threshold: -3, // +3dB with -6dB headroom
    ratio: 6,
    attack: 0.01,
    release: 0.15,
    knee: 0
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
  const mergedOptions = { ...LimiterOptions.balanced, ...options }
  limiter.threshold.value = mergedOptions.threshold
  limiter.ratio.value = mergedOptions.ratio
  limiter.attack.value = mergedOptions.attack
  limiter.release.value = mergedOptions.release
  limiter.knee.value = mergedOptions.knee
  return limiter
}
