export const useSharedAudioGraph = createSharedComposable(
  (
    audioContext: AudioContext,
    ...audioNodes: (
      | AnalyserNode
      | BiquadFilterNode
      | ChannelMergerNode
      | ChannelSplitterNode
      | ConvolverNode
      | DelayNode
      | DynamicsCompressorNode
      | GainNode
      | IIRFilterNode
      | OscillatorNode
      | PannerNode
      | StereoPannerNode
      | WaveShaperNode
      | AudioNode
    )[]
  ) => {
    const connections = ref<readonly AudioNode[]>([])
    const source = ref<AudioNode | null>(null)

    onMounted(() => {
      const lastNode = audioNodes.reduce((prevNode, currentNode) => {
        prevNode.connect(currentNode)
        return currentNode
      })

      connections.value = audioNodes
      source.value = lastNode
    })

    onBeforeUnmount(() => {
      source.value?.disconnect()
    })

    function connect(node: AudioNode) {
      source.value?.connect(node)
      connections.value = [...connections.value, node]
    }

    function disconnect(node: AudioNode) {
      source.value?.disconnect(node)
      connections.value = connections.value.filter((n) => n !== node)
    }

    function disconnectAll() {
      source.value?.disconnect()
      connections.value = []
    }

    function connectToDestination(destination: AudioNode) {
      source.value?.connect(destination)
      connections.value = [...connections.value, destination]
    }


    return {
      connections,
      source,
      connect,
      disconnect,
      disconnectAll,
      connectToDestination
    }
  }
)
