<script lang="ts" setup>
import {
  CompressorPreset,
  createDynamicsCompressor
} from '~~/layers/audio/utils/dynamicsCompressor'

const chain = useAudioNodeChain()
const { audioContext, getAudioContext } = useAudioContext()

const gainValue = shallowRef<number>(0.5)
const gainModel = computed({
  get: () => gainValue.value,
  set: (value: number) => {
    const dB = faderToDB(value, -12, 12)
    const linearGainValue = dbToLinearGain(dB)
    const context = unrefNotNull(audioContext)
    const gainNode = chain.getGainNode('master')
    gainNode.gain.setValueAtTime(linearGainValue, context.currentTime)
  }
})

onMounted(async () => {
  const context = await getAudioContext()
  const gain = createGain(context)
  const [analyserLeft, analyserRight]  = createAnalysers(context)
  const compressor = createDynamicsCompressor(context, CompressorPreset.MasterLimiter)
  chain.add('master', { gain, analyserLeft, analyserRight, compressor }, { connect: true })
  const outputNode = chain.getOutputNode('master')
  outputNode.connect(context.destination)
})
</script>

<template>
  <div>
    <input
      v-model="gainModel"
      max="1"
      min="0"
      step="0.01"
      type="range" />
  </div>
</template>
