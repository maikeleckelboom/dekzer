<script lang="ts" setup>
import { DECK_GAIN_MAX, DECK_GAIN_MIN } from '~~/layers/fader/utils/constants'
import FaderVolumeSlider from '~~/layers/fader/components/Fader/FaderVolumeSlider.vue'

const { channels } = defineProps<{ channels: number[] }>()
const modelValue = useState<number>(`deck-gain-fader`, () => 0)
</script>

<template>
  <FaderVolumeSlider
    v-model="modelValue"
    :channels="channels"
    :max="DECK_GAIN_MAX"
    :min="DECK_GAIN_MIN"
    :segments="40"
    orientation="vertical" />
</template>

<style scoped></style>
