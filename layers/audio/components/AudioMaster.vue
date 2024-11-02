<script lang="ts" setup>
import {
  CompressorPreset,
  createDynamicsCompressor
} from '~~/layers/audio/utils/dynamicsCompressor'

const chain = useAudioNodeChain()
const { getAudioContext } = useAudioContext()

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
    <!-- -->
  </div>
</template>
