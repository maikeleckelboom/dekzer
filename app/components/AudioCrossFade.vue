<script lang="ts" setup>
const chain = useAudioNodeChain()

function crossfade(value: number) {
  const crossfadeValue = value / 100
  const gainA = Math.cos(crossfadeValue * 0.5 * Math.PI)
  const gainB = Math.cos((1.0 - crossfadeValue) * 0.5 * Math.PI)

  const trackAGain = chain.getCrossfadeGain('trackA')
  const trackBGain = chain.getCrossfadeGain('trackB')

  trackAGain.gain.value = gainA
  trackBGain.gain.value = gainB
}

const crossfadeValue = ref<number>(50)
</script>

<template>
  <div class="grid grid-cols-[auto,1fr,auto] gap-2 py-2">
    <div class="text-muted-foreground flex items-center gap-1">
      <IconChevronLeft class="size-5" />
      <span class="text-xs font-bold">A</span>
    </div>
    <input
      v-model="crossfadeValue"
      max="100"
      min="0"
      type="range"
      @input="crossfade(crossfadeValue)" />
    <div class="text-muted-foreground flex items-center gap-2">
      <span class="text-xs font-bold">B</span>
      <IconChevronRight class="size-5" />
    </div>
  </div>
</template>
