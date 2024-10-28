<script lang="ts" setup>
const audioContext = inject('audioContext') as Ref<AudioContext | null>

const masterGainNode = ref<GainNode>()
const masterLimiterNode = ref<DynamicsCompressorNode>()

provide('masterGainNode', masterGainNode)
provide('masterLimiterNode', masterLimiterNode)

whenever(audioContext, (context) => {
  console.log('context', context)

  masterGainNode.value = context.createGain()
  masterLimiterNode.value = context.createDynamicsCompressor()

  masterGainNode.value!.connect(masterLimiterNode.value)
  masterLimiterNode.value!.connect(context.destination)
})
</script>

<template>
  <div>
    <!-- Master controls and output -->
  </div>
</template>
