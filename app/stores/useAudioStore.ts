export const useAudioStore = defineStore('audio', () => {

  const decks = ref<DeckNodes[]>([])
  const master = ref<MasterNodes | null>(null)

  function setDeckNodes(index: number, nodes: DeckNodes) {
    decks.value[index] = nodes
  }

  function setMasterNodes(nodes: MasterNodes) {
    master.value = nodes
  }

  function setDeckVolume(index: number, value: number) {
    decks.value[index]!.volume.gain.value = value
  }

  function setDeckPan(index: number, value: number) {
    decks.value[index]!.pan.gain.value = value
  }

  function setDeckGain(index: number, value: number) {
    decks.value[index]!.gain.gain.value = value
  }

whenever(master, (m) => {
  console.log(m)
  // if (m) {
  //   m.gain.connect(m.limiter)
  //   m.limiter.connect(audioContext.destination)
  // }
})


  return {
    decks,
    master,
    setDeckVolume,
    setDeckPan,
    setDeckGain,
    setDeckNodes,
    setMasterNodes,
  }
})