export interface GainNodeOptions {
  gain?: number
}

export function useGainNode(id: string, { gain = 1 }: GainNodeOptions = { gain: 1 }) {
  const node = useNode<GainNode>(id, (context) => context.createGain())
  whenever(node, (n) => (n.gain.value = gain), { immediate: true })
  return node
}
