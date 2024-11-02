<script lang="ts" setup>
import {
  MASTER_GAIN_DEFAULT,
  MASTER_GAIN_MAX,
  MASTER_GAIN_MIN,
  MASTER_GAIN_ORIENTATION
} from '~~/layers/fader/utils/constants'
import FaderVolumeSlider from '~~/layers/fader/components/Fader/FaderVolumeSlider.vue'
import { useActiveNodes } from '~/composables/useActiveNodes'

interface Props {
  channels: [number, number]
}

const { channels } = defineProps<Props>()

const modelValue = useState<number>(`masterGain`, () => MASTER_GAIN_DEFAULT)

const { activeNodes, addNode, removeNode } = useActiveNodes()

const gainNode = shallowRef<GainNode>()
const limiterNode = shallowRef<DynamicsCompressorNode>()

const { getAudioContext } = useAudioContext()

onMounted(async () => {
  const context = await getAudioContext()
  gainNode.value = context.createGain()
  gainNode.value.gain.value = 1
  limiterNode.value = context.createDynamicsCompressor()
  gainNode.value.connect(limiterNode.value)
  limiterNode.value.connect(context.destination)

  addNode('MasterLimiter', limiterNode.value)
  addNode('MasterGain', gainNode.value)
  addNode('Destination', context.destination)
})

watch(activeNodes,async (nodes) => {
  console.log('activeNodes', nodes)
  const context = await getAudioContext()

  if (nodes.has('MasterGain')) {
    gainNode.value = context.createGain()
    gainNode.value.gain.value = modelValue.value
    limiterNode.value = context.createDynamicsCompressor()
    gainNode.value.connect(limiterNode.value)
    limiterNode.value.connect(context.destination)
  }

})

watch(modelValue, (value) => {
  if (gainNode.value) {
    gainNode.value.gain.value = value
  }
})

onUnmounted(() => {
  if (gainNode.value) {
    gainNode.value.disconnect()
    removeNode('MasterGain')
  }
})
</script>

<template>
  <FaderVolumeSlider
    v-model="modelValue"
    :channels="channels"
    :max="MASTER_GAIN_MAX"
    :min="MASTER_GAIN_MIN"
    :orientation="MASTER_GAIN_ORIENTATION"
    :segments="30" />
</template>
