<script lang="ts" setup>
const chain = useAudioNodeChain()
const { getAudioContext } = useAudioContext()

onMounted(async () => {
  console.log(`%cAudioMaster`, 'color: red; font-size: 16px;')

  const context = await getAudioContext()
  const gain = context.createGain()
  const analyserLeft = context.createAnalyser()
  const analyserRight = context.createAnalyser()
  const limiter = context.createDynamicsCompressor()
  chain.add('master', [gain, analyserLeft, analyserRight, limiter], { connect: true })

  const outputNode = chain.outputNode('master')
  outputNode.connect(context.destination)
})

</script>

<template>
  <div>
    <!-- -->
  </div>
</template>

<style scoped></style>
