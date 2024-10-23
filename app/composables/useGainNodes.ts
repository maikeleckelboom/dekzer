import { useAudioContext } from './useAudioContext'

export function useGainNodes(deckCount: number) {
  const { getAudioContext } = useAudioContext()
  const masterGainNode = ref<GainNode | null>(null)
  const deckGainNodes = ref<GainNode[]>([])

  onMounted(async () => {
    const context = await getAudioContext()

    // Create master gain node
    masterGainNode.value = context.createGain()
    masterGainNode.value.gain.value = 1 // Default gain is 0 dB

    
  })

  onUnmounted(async () => {
    if (masterGainNode.value) {
      masterGainNode.value.disconnect()
      masterGainNode.value = null
    }
    deckGainNodes.value.forEach((node) => {
      if (node) {
        node.disconnect()
      }
    })
  })

  const setMasterGain = (value: number) => {
    if (masterGainNode.value) {
      const linearGain = Math.pow(10, value / 20)
      masterGainNode.value.gain.setValueAtTime(
        linearGain,
        masterGainNode.value.context.currentTime
      )
    }
  }

  const setDeckGain = (deckIndex: number, value: number) => {
    if (deckGainNodes.value[deckIndex]) {
      const linearGain = Math.pow(10, value / 20)
      deckGainNodes.value[deckIndex].gain.setValueAtTime(
        linearGain,
        deckGainNodes.value[deckIndex].context.currentTime
      )
    }
  }
  watch(masterGainNode, (value) => {
    if (value) {
      console.log('Master gain:', value.gain.value)
    }
  })

  watch(deckGainNodes, (value) => {
    value.forEach((node, index) => {
      if (node) {
        console.log(`Deck ${index} gain:`, node.gain.value)
      }
    })
  }, { deep: true })

  return {
    masterGainNode,
    deckGainNodes,
    setMasterGain,
    setDeckGain
  }
}
