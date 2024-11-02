<script lang="ts" setup>
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

})


function onPlay() {
  const nodes = deck.value
  if (!nodes) return
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
