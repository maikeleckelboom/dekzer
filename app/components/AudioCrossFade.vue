<script lang="ts" setup>
const chain = useAudioNodeChain()

function crossfade(value: number) {
  const crossfadeValue = value / 100
  const gainA = Math.cos(crossfadeValue * 0.5 * Math.PI);
  const gainB = Math.cos((1.0 - crossfadeValue) * 0.5 * Math.PI);

  const trackAGain = chain.getCrossfadeGain('trackA')
  const trackBGain = chain.getCrossfadeGain('trackB')

  trackAGain.gain.value = gainA;
  trackBGain.gain.value = gainB;
}

const crossfadeValue = ref<number>(50)



onMounted(() => {
  console.log(`%cAudioCrossFade`, 'color: hotpink; font-size: 16px;')
})

</script>

<template>
  <div>
    <!-- -->
    <input type="range" min="0" max="100" v-model="crossfadeValue" @input="crossfade(crossfadeValue)" />
  </div>
</template>
