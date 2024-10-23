export async function useGainNode(): Ref<GainNode> {
  const context = useAudioContext()
  const gainNode = ref<GainNode>()

  if (context.value) {
    gainNode.value = context.value.createGain()
  }

  return gainNode
}
