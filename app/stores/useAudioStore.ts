import type { DeckNodes, MasterNodes } from '~/utils/audio'

export const useAudioStore = defineStore('audio', () => {

  const decks = ref<DeckNodes[]>([])
  const master = ref<MasterNodes | null>(null)

  function setDeckNodes(index: number, nodes: DeckNodes) {
    decks.value[index] = nodes
  }

  function setMasterNodes(nodes: MasterNodes) {
    master.value = nodes
  }

  function setDeckGain(index: number, value: number) {
    decks.value[index]!.gain.gain.value = value
  }

  function setDeckVolume(index: number, value: number) {
    decks.value[index]!.volume.gain.value = value
  }

  function setDeckTransition(index: number, value: number) {
    decks.value[index]!.mixer.gain.value = value
  }

  function setMasterGain(value: number) {
    master.value!.gain.gain.value = value
  }

  return {
    decks,
    master,
    setDeckVolume,
    setMasterGain,
    setDeckTransition,
    setDeckGain,
    setDeckNodes,
    setMasterNodes,
  }
})