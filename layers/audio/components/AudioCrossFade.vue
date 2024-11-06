<script lang="ts" setup>

const chain = useAudioNodeChain()

function onCrossfade(value: number) {
  const trackAGain = chain.getCrossfadeNode('trackA')
  const trackBGain = chain.getCrossfadeNode('trackB')

  trackAGain.gain.value = cosineFadeIn(value)
  trackBGain.gain.value = cosineFadeOut(value)
}

const crossfadeValue = ref<number>(0.5)
</script>

<template>
  <input
    v-model="crossfadeValue"
    max="1"
    min="0"
    step="0.01"
    type="range"
    @input="onCrossfade(crossfadeValue)" />
</template>
