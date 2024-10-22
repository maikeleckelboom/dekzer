<script lang="ts" setup>
interface Props {
  channels: [number, number]
}

const { channels = [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY] } = defineProps<Props>()

const TRACK_GAIN_MIN: number = -24 as const
const TRACK_GAIN_MAX: number = 24 as const
const TRACK_GAIN_DEFAULT = 0 as const

const uid = useId()
const gainValue = useState<number>(`deck-gain-fader-${uid}`, () => TRACK_GAIN_DEFAULT)

const gainNode = shallowRef<GainNode | null>(null)
</script>

<template>
  <GainFaderRoot>
    <GainFaderOutputChannel :model-value="channels.at(0)" />
    <GainFaderHandle
      v-model="gainValue"
      :dbMax="TRACK_GAIN_MAX"
      :dbMin="TRACK_GAIN_MIN"
      :title="gainValue" />
    <GainFaderOutputChannel :model-value="channels.at(1)" />
  </GainFaderRoot>
</template>
