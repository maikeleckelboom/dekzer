export enum CompressorPreset {
  MasterLimiter,
  TrackBalancer,
  SubtleControl,
  MixCohesion,
  DrumPunch,
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

export function createDynamicCompressor(
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