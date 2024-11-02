<script setup lang="ts">
const chain = useAudioNodeChain()
const { getAudioContext } = useAudioContext()

onMounted(async () => {
  console.log(`%cAudioMaster`, 'color: red; font-size: 16px;')
  const context = await getAudioContext()
  const gain = context.createGain()
  const analyserNodeL = context.createAnalyser()
  const analyserNodeR = context.createAnalyser()
  const compressorNode = context.createDynamicsCompressor()
  chain.addChain('master', [gain, analyserNodeL, analyserNodeR, compressorNode])
  chain.connectChainNodes('master')


  const outputNode = chain.getOutputNode('master')
  outputNode.connect(context.destination)
})
</script>

<template>
  <div>
    <!-- -->
  </div>
</template>

<style scoped>

</style>