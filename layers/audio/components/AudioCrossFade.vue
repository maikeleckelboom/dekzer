<script lang="ts" setup>
import AudioCrossFaderBox from '~~/layers/audio/components/container/AudioCrossFadeBox.vue'

const chain = useAudioNodeChain()

function crossfade(value: number) {
  const trackAGain = chain.getCrossfadeNode('trackA')
  const trackBGain = chain.getCrossfadeNode('trackB')

  trackAGain.gain.value = cosineFadeIn(value)
  trackBGain.gain.value = cosineFadeOut(value)
}

const crossfadeValue = ref<number>(0.5)
</script>

<template>
  <AudioCrossFaderBox>
    <input
      v-model="crossfadeValue"
      max="1"
      min="0"
      step="0.01"
      type="range"
      @input="crossfade(crossfadeValue)" />
  </AudioCrossFaderBox>
</template>
