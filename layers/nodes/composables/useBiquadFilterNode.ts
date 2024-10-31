import { useNode } from '~~/layers/nodes/composables/useNode'

export interface UseBiquadFilterOptions {
  detune?: number
  frequency?: number
  gain?: number
  Q?: number
  type?: BiquadFilterType
}

export function useBiquadFilterNode(
  id: string,
  initialOptions: UseBiquadFilterOptions = {
    detune: 0,
    frequency: 350,
    gain: 0,
    Q: 1,
    type: 'lowpass'
  }
) {
  const { detune = 0, frequency = 350, gain = 0, Q = 1, type = 'lowpass' } = initialOptions

  const node = useNode<BiquadFilterNode>(`${id}-biquad-filter`, (context) =>
    context.createBiquadFilter()
  )

  whenever(
    node,
    (n) => {
      n.detune.value = detune
      n.frequency.value = frequency
      n.gain.value = gain
      n.Q.value = Q
      n.type = type
    },
    { immediate: true }
  )

  return node
}
