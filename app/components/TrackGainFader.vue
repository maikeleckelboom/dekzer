<script lang="ts" setup>
import { DECK_GAIN_MAX, DECK_GAIN_MIN } from '~~/layers/fader/utils/constants'

const { channels } = defineProps<{ channels: number[] }>()
const modelValue = ref<number>(0)
</script>

<template>
  <FaderVolumeFader
    v-model="modelValue"
    :channels="channels"
    :max="DECK_GAIN_MAX"
    :min="DECK_GAIN_MIN"
    :segments="40"
    orientation="vertical" />
</template>

<style scoped></style>
