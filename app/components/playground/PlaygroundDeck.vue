<script lang="ts" setup>
const audioContext = inject('audioContext') as Ref<AudioContext | null>

whenever(audioContext, (context) => {

})
</script>

<template>
  <div>
    <!-- Deck controls and output -->
  </div>
</template>