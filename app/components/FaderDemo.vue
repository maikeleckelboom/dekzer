<script lang="ts" setup>
const modelValue = ref<number>(0.5)
</script>

<template>
  <Fader v-model="modelValue"/>
</template>
