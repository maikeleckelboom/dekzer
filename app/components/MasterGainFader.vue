<script lang="ts" setup>
import {
  MASTER_GAIN_DEFAULT,
  MASTER_GAIN_MAX,
  MASTER_GAIN_MIN,
  MASTER_GAIN_ORIENTATION
} from '~~/layers/fader/utils/constants'
import { useGainNode } from '~/composables/useGainNode'

interface Props {
  channels: [number, number]
}

const { channels } = defineProps<Props>()

const modelValue = useState<number>(`master-gain-fader`, () => MASTER_GAIN_DEFAULT)

</script>

<template>
  <FaderVolumeFader
    v-model="modelValue"
    :channels="channels"
    :max="MASTER_GAIN_MAX"
    :min="MASTER_GAIN_MIN"
    :orientation="MASTER_GAIN_ORIENTATION"
    :segments="30" />
</template>
