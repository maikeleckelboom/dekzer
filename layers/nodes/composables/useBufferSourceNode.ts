export type BufferSourceNodeOptions = Omit<AudioBufferSourceOptions, 'buffer'> & {
  buffer: MaybeRefOrGetter<AudioBuffer | undefined>
}

export function useBufferSourceNode(id: string, options: BufferSourceNodeOptions) {
  const { audioContext } = useAudioContext()
  const source = shallowRef<AudioBufferSourceNode | undefined>()

  watch(
    () => toValue(options.buffer),
    (buffer) => {
      if (!buffer) {
        source.value?.disconnect()
        source.value = undefined
        return
      }

      if (source.value instanceof AudioBufferSourceNode) {
        source.value.buffer = buffer
      }
    }
  )

  useEventListener(source, 'ended', () => {
    source.value?.disconnect()
    source.value = undefined
  })

  return source
}
