<script lang="ts" setup>
const modelValue = ref<number>(100)
</script>

<template>
  <FaderRoot
    v-model="modelValue"
    :max="150"
    :min="50"
    class="h-60"
    orientation="vertical">
    <FaderTrack>
      <FaderMarkerRail :stripe-count="9" />
      <FaderRailSlot />
      <FaderMarkerRail :stripe-count="9" />
    </FaderTrack>
    <FaderHandle :translucent="false" />
  </FaderRoot>
</template>
