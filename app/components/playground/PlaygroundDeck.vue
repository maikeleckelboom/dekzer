<script lang="ts" setup>
import { createDeckNodes, type DeckNodes } from '~/utils/audio'
import { useAudioStore } from '~/stores/useAudioStore'

const { index } = defineProps<{
  index: number
}>()

const audioElement = useTemplateRef<HTMLAudioElement>('audioElement')

const { audioContext, getAudioContext } = useAudioContext()

const store = useAudioStore()

const deck = ref<DeckNodes>()

onMounted(getAudioContext)

whenever(audioContext, (context) => {
  deck.value = createDeckNodes(context)

  const source = context.createMediaElementSource(audioElement.value!)
  source.connect(deck.value.gain)
  deck.value.gain.connect(deck.value.volume)
  for (const analyser of deck.value.analysers) {
    deck.value.volume.connect(analyser)
  }
  deck.value.volume.connect(deck.value.limiter)
  deck.value.limiter.connect(deck.value.mixer)

  store.setDeckNodes(index, deck.value)
})

const { channels, start, stop, setAnalysers } = useAudioLevelAnalyser()

function onPlay() {
  const nodes = deck.value
  if (!nodes) return
  setAnalysers(nodes.analysers)
  start()
}

function onPause() {
  stop()
}

function onGainInput(event: Event) {
  const deckNode = deck.value
  if (!deckNode) return
  store.setDeckGain(index, (event.target as HTMLInputElement).valueAsNumber)
}

function onVolumeInput(event: Event) {
  const deckNode = deck.value
  if (!deckNode) return
  store.setDeckVolume(index, (event.target as HTMLInputElement).valueAsNumber)
}
</script>

<template>
  <div>
    <p>{{ channels }}</p>
    <fieldset>
      <legend>Gain</legend>
      <input
        :value="deck?.gain.gain.value"
        max="1"
        min="0"
        step="0.01"
        type="range"
        @input="onGainInput" />
    </fieldset>
    <fieldset>
      <legend>Volume</legend>
      <input
        :value="deck?.volume.gain.value"
        max="1"
        min="0"
        step="0.01"
        type="range"
        @input="onVolumeInput" />
    </fieldset>
    <audio
      ref="audioElement"
      controls
      src="/assets/YouTube/Go%20Get%20Busy%20(Hardcore%20Edit).opus"
      @pause="onPause"
      @play="onPlay" />
  </div>
</template>
