export enum CompressorPreset {
  /** For final mastering, very high compression for peak limiting */
  MasterLimiter,
  /** Used on individual tracks for balance within the mix, medium compression */
  TrackBalancer,
  /** Soft compression for gentle dynamics control, minimal impact on transients */
  SubtleControl,
  /** Light compression for overall mix cohesion, sometimes called "glue compression" */
  MixCohesion,
  /** High-ratio, fast-attack compression for drums, capturing transients */
  DrumPunch,
  /** Smooth compression tailored for vocals, preserving a natural sound */
  VocalPresence
}

const compressorPresets = {
  [CompressorPreset.MasterLimiter]: {
    threshold: -3,
    ratio: 10,
    attack: 0.05,
    release: 0.2,
    knee: 0
  },
  [CompressorPreset.TrackBalancer]: {
    threshold: -6,
    ratio: 4,
    attack: 0.005,
    release: 0.1,
    knee: 0
  },
  [CompressorPreset.SubtleControl]: {
    threshold: -12,
    ratio: 2,
    attack: 0.01,
    release: 0.3,
    knee: 3
  },
  [CompressorPreset.MixCohesion]: {
    threshold: -9,
    ratio: 1.5,
    attack: 0.02,
    release: 0.25,
    knee: 2
  },
  [CompressorPreset.DrumPunch]: {
    threshold: -8,
    ratio: 6,
    attack: 0.003,
    release: 0.15,
    knee: 0
  },
  [CompressorPreset.VocalPresence]: {
    threshold: -10,
    ratio: 3,
    attack: 0.01,
    release: 0.25,
    knee: 4
  }
} as const;

export type CompressorPresetKey = CompressorPreset;
export type CompressorPresetConfig = typeof compressorPresets[CompressorPresetKey];

export function getDynamicCompressorPreset(preset: CompressorPreset): CompressorPresetConfig {
  return compressorPresets[preset];
}

export function createDynamicsCompressor(
  audioContext: AudioContext,
  presetKey: CompressorPresetKey
): DynamicsCompressorNode {
  const compressor = audioContext.createDynamicsCompressor()
  const preset = getDynamicCompressorPreset(presetKey)
  compressor.threshold.value = preset.threshold
  compressor.ratio.value = preset.ratio
  compressor.attack.value = preset.attack
  compressor.release.value = preset.release
  compressor.knee.value = preset.knee
  return compressor
}