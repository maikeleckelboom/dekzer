<script lang="ts" setup>
const chain = useAudioNodeChain()

function crossfade(value: number) {
  const gainA = Math.cos(value * 0.5 * Math.PI)
  const gainB = Math.cos((1.0 - value) * 0.5 * Math.PI)

  const trackAGain = chain.getCrossfadeGainNode('trackA')
  const trackBGain = chain.getCrossfadeGainNode('trackB')

  trackAGain.gain.value = gainA
  trackBGain.gain.value = gainB
}

const crossfadeValue = ref<number>(0.5)
</script>

<template>
  <div class="grid grid-cols-[auto,1fr,auto] gap-2 py-2">
    <div class="text-muted-foreground flex items-center gap-1">
      <IconChevronLeft class="size-5" />
      <span class="text-xs font-bold">A</span>
    </div>
    <input
      v-model="crossfadeValue"
      max="1"
      min="0"
      step="0.01"
      type="range"
      @input="crossfade(crossfadeValue)" />
    <div class="text-muted-foreground flex items-center gap-2">
      <span class="text-xs font-bold">B</span>
      <IconChevronRight class="size-5" />
    </div>
  </div>
</template>
