import type { Ref } from 'vue'

export function useNode<T extends AudioNode>(
  id: string,
  nodeFactory: (context: AudioContext) => T
): Ref<T | undefined > {
  const { audioContext } = useAudioContext()
  const node = shallowRef<T | undefined>()

  onMounted(() => {
    if (!audioContext.value) return
    node.value = nodeFactory(audioContext.value)
  })

  onUnmounted(() => {
    node.value?.disconnect()
  })

  return node as Ref<T>
}
