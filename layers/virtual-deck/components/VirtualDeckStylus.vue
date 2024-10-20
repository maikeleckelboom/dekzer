<script lang="ts" setup>
const { defaultAngle = 0 } = defineProps<{ defaultAngle?: number }>()
</script>

<template>
  <div
    class="stylus bg-background absolute top-0 aspect-[1/8] h-1/2 w-auto origin-[50%_100%] md:aspect-[1/8]"
    :style="{ transform: `rotate(${defaultAngle}deg)` }"
    data-name="stylus" />
</template>
