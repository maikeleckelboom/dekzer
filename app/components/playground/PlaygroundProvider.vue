<script lang="ts" setup>
const audioContext = ref<AudioContext | null>(null)

provide('audioContext', audioContext)

onMounted(() => {
  audioContext.value ??= new AudioContext({ latencyHint: 'playback' })
})
</script>

<template>
  <div>
    <slot />
  </div>
</template>
