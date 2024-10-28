export interface LimiterOptions {
  attack?: number
  knee?: number
  ratio?: number
  release?: number
  threshold?: number
}

export type LimiterPresetKey = 'master' | 'track'

/**
 * @param threshold - The point at which the compressor is activated.
 * @param ratio - How aggressively the compressor will reduce the signal when it exceeds the threshold.
 * @param attack - How long the compressor takes to reach full compression after the signal crosses the threshold.
 * @param release - How quickly the compressor recovers after peak gain reduction.
 * @param knee - How soft or hard the compression will occur around the threshold (softening).
 */
export const LimiterOptions: Record<LimiterPresetKey, Required<LimiterOptions>> = {
  master: {
    threshold: -3,
    ratio: 10,
    attack: 0.05,
    release: 0.2,
    knee: 0
  },
  track: {
    threshold: -6,
    ratio: 4,
    attack: 0.005,
    release: 0.1,
    knee: 0
  }
}


export function newAudioLimiter(
  audioContext: AudioContext,
  options: Required<LimiterOptions>
): DynamicsCompressorNode {
  const limiter = audioContext.createDynamicsCompressor()
  limiter.threshold.value = options.threshold
  limiter.ratio.value = options.ratio
  limiter.attack.value = options.attack
  limiter.release.value = options.release
  limiter.knee.value = options.knee
  return limiter
}

export function createLimiter(
  audioContext: AudioContext,
  presetKey: LimiterPresetKey
): DynamicsCompressorNode {
  if (!LimiterOptions[presetKey]) throw new Error(`Invalid limiter type: ${presetKey}`)
  return newAudioLimiter(audioContext, LimiterOptions[presetKey])
}