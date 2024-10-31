<script lang="ts" setup>
import { useNodesGraph } from '~/composables/useNodesGraph'

const { getAudioContext } = useAudioContext()

const masterGainNode = useGainNode('master-gain', { gain: 1 })
const masterAnalyserLNode = useAnalyserNode('master-analyser-l', { fftSize: 1024 })
const masterAnalyserRNode = useAnalyserNode('master-analyser-r', { fftSize: 1024 })
const masterCompressorNode = useDynamicCompressorNode('master-compressor', 'masterLimiter')
const graph = useNodesGraph()

onMounted(async () => {


})

const masterAnalyzer = useAudioLevelAnalyser(masterAnalyserLNode, masterAnalyserRNode)
</script>

<template>
  <div>
  </div>
</template>
