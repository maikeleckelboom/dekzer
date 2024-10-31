<script lang="ts" setup>
import { useAudioStore } from '~/stores/useAudioStore'
import { cosineFadeIn, cosineFadeOut } from '~/utils/audio'

const mix = shallowRef<number>(0)

const { getAudioContext, audioContext } = useAudioContext()

const store = useAudioStore()

onMounted(async () => {
  const context = await getAudioContext()

  const nodes = createMasterNodes(context)

  store.decks.forEach((deck) => {
    deck.limiter.connect(nodes.limiter)
  })

  store.setMasterNodes(nodes)

  nodes.limiter.connect(context.destination)
})

function onCrossFade(value: number) {
  const deckAFadeGainNode = store.decks[0]!.mixer
  const deckBFadeGainNode = store.decks[1]!.mixer
  const mappedValue = mapRange(value, -1, 1, 0, 1)
  deckAFadeGainNode.gain.value = cosineFadeIn(mappedValue)
  deckBFadeGainNode.gain.value = cosineFadeOut(mappedValue)
}

function handleCrossFade(event: Event) {
  const el = event.target as HTMLInputElement
  const value = parseFloat(el.value)
  mix.value = value
  onCrossFade(value)
}
// watch(
//   mix,
//   (value) => {
//     const context = audioContext.value
//     if (!context || !store.master || !store.decks?.length) return
//     onCrossFade(parseInt(value))
//   },
//   { immediate: true, flush: 'sync' }
// )
</script>

<template>
  <div class="flex flex-nowrap items-center gap-2">
    <IconChevronLeft class="size-6" />
    <input
      :value="mix"
      @input="handleCrossFade"
      max="1"
      min="-1"
      step="0.01"
      type="range" />
    <IconChevronRight class="size-6" />
  </div>
</template>
