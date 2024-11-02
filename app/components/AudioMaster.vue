<script setup lang="ts">
const chain = useAudioNodeChain()
const { getAudioContext } = useAudioContext()

onMounted(async () => {
  console.log(`%cAudioMaster`, 'color: red; font-size: 16px;')
  const context = await getAudioContext()
  const gainNode = context.createGain()
  const analyserNodeL = context.createAnalyser()
  const analyserNodeR = context.createAnalyser()
  const compressorNode = context.createDynamicsCompressor()
  chain.addChain('master', [gainNode, analyserNodeL, analyserNodeR, compressorNode])
  chain.setChainActive('master')

  // connect to destination
  compressorNode.connect(context.destination)
})

</script>

<template>
  <div>
    <!-- -->
  </div>
</template>

<style scoped>

</style>