<script lang="ts" setup>
import {
  MASTER_GAIN_DEFAULT,
  MASTER_GAIN_MAX,
  MASTER_GAIN_MIN,
  MASTER_GAIN_ORIENTATION
} from '~~/layers/fader/components/utils/constants'

interface Props {
  channels: [number, number]
}

const { channels } = defineProps<Props>()

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
      :dbMax="MASTER_GAIN_MAX"
      :dbMin="MASTER_GAIN_MIN"
      :orientation="MASTER_GAIN_ORIENTATION"
      :title="gainValue" />
    <GainFaderOutputChannel
      :model-value="channels.at(1)"
      :orientation="MASTER_GAIN_ORIENTATION" />
  </GainFaderRoot>
</template>
