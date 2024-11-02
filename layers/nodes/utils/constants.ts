const compressorPresets = {
  masterLimiter: {
    threshold: -3,
    ratio: 10,
    attack: 0.05,
    release: 0.2,
    knee: 0
  },
  trackBalancer: {
    threshold: -6,
    ratio: 4,
    attack: 0.005,
    release: 0.1,
    knee: 0
  },
  subtleControl: {
    threshold: -12,
    ratio: 2,
    attack: 0.01,
    release: 0.3,
    knee: 3
  },
  mixCohesion: {
    threshold: -9,
    ratio: 1.5,
    attack: 0.02,
    release: 0.25,
    knee: 2
  },
  drumPunch: {
    threshold: -8,
    ratio: 6,
    attack: 0.003,
    release: 0.15,
    knee: 0
  },
  vocalPresence: {
    threshold: -10,
    ratio: 3,
    attack: 0.01,
    release: 0.25,
    knee: 4
  }
} as const

export type CompressorPresetKey = keyof typeof compressorPresets
export type CompressorPresetConfig = (typeof compressorPresets)[CompressorPresetKey]

export function getDynamicCompressorPreset(presetKey: CompressorPresetKey): CompressorPresetConfig {
  return compressorPresets[presetKey]
}
