export interface EQFilterOptions {
  frequency?: number
  gain?: number
}

interface EQPeakingFilterParams {
  Q?: number
}

export function createLowShelfEQ(
  context: AudioContext,
  params: EQFilterOptions = {}
): BiquadFilterNode {
  const { frequency = 100, gain = 0 } = params
  const filter = context.createBiquadFilter()
  filter.type = 'lowshelf'
  filter.frequency.value = frequency
  filter.gain.value = gain
  return filter
}

export function createPeakingEQ(
  context: AudioContext,
  params: EQFilterOptions & EQPeakingFilterParams = {}
): BiquadFilterNode {
  const { frequency = 1000, gain = 0, Q = Math.SQRT1_2 } = params
  const filter = context.createBiquadFilter()
  filter.type = 'peaking'
  filter.frequency.value = frequency
  filter.Q.value = Q
  filter.gain.value = gain
  return filter
}

export function createHighShelfEQ(
  context: AudioContext,
  params: EQFilterOptions = {}
): BiquadFilterNode {
  const { frequency = 10000, gain = 0 } = params
  const filter = context.createBiquadFilter()
  filter.type = 'highshelf'
  filter.frequency.value = frequency
  filter.gain.value = gain
  return filter
}
