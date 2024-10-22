<script lang="ts" setup>
interface Props {
  channels: [number, number]
}

const { channels } = defineProps<Props>()

const MASTER_GAIN_DEFAULT = 3 as const
const MASTER_GAIN_MIN: number = -12 as const
const MASTER_GAIN_MAX: number = 12 as const

const MASTER_GAIN_ORIENTATION = 'horizontal' as const

const uid = useId()
const gainValue = useState<number>(`master-gain-fader-${uid}`, () => MASTER_GAIN_DEFAULT)
</script>

<template>
  <GainFaderRoot orientation="horizontal">
    <GainFaderOutputChannel
      :model-value="channels.at(0)"
      :orientation="MASTER_GAIN_ORIENTATION" />
    <GainFaderHandle
      v-model="gainValue"
      :dBMax="MASTER_GAIN_MAX"
      :dBMin="MASTER_GAIN_MIN"
      :orientation="MASTER_GAIN_ORIENTATION"
      :title="gainValue" />
    <GainFaderOutputChannel
      :model-value="channels.at(1)"
      :orientation="MASTER_GAIN_ORIENTATION" />
  </GainFaderRoot>
</template>
