<script lang="ts" setup>
const modelVal = ref<number>(0)
</script>

<template>
  <FaderSliderRoot
    v-model="modelVal"
    :max="1"
    :min="-1">
    <FaderSliderTrack>
      <FaderSliderRange />
    </FaderSliderTrack>
    <FaderSliderThumb />
  </FaderSliderRoot>
</template>

<style scoped></style>
