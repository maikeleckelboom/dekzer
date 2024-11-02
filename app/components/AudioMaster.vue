<script lang="ts" setup>
const chain = useAudioNodeChain()
const { getAudioContext } = useAudioContext()
function createAnalysers(context: AudioContext) {
  const analyserLeft = context.createAnalyser()
  const analyserRight = context.createAnalyser()
  return { analyserLeft, analyserRight }
}


onMounted(async () => {
  console.log(`%cAudioMaster`, 'color: red; font-size: 16px;')

  const context = await getAudioContext()
  const gain = context.createGain()
  const analyserLeft = context.createAnalyser()
  const analyserRight = context.createAnalyser()
  const compressor = context.createDynamicsCompressor()
  chain.add('master', {gain, analyserLeft, analyserRight, compressor}, { connect: true })
  const outputNode = chain.getOutputNode('master')
  outputNode.connect(context.destination)
})
</script>

<template>
  <div>
    <!-- -->
  </div>
</template>

<style scoped></style>
