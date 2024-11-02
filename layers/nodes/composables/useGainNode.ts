export interface GainNodeOptions {
  gain?: number
}

export function useGainNode(id: string, { gain = 1 }: GainNodeOptions = { gain: 1 }) {
  const node = useNode<GainNode>(id, (context) => context.createGain())
  watchEffect(() => {
    if (node.value) {
      node.value.gain.value = gain
    }
  })
  return node
}
