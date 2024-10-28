<script lang="ts" setup>
const { audioContext } = useAudioContext()

provide('audioContext', audioContext)
</script>

<template>
  <div>
    <slot />
  </div>
</template>
