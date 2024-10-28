<script lang="ts" setup>
import { useAudioStore } from '~/stores/useAudioStore'

const { getAudioContext } = useAudioContext()

const store = useAudioStore()

// audio analysers
const {start,stop,channels,setAnalysers} = useAudioLevelAnalyser()

onMounted(async()=>{
  const context =  await getAudioContext()
  if (!context) return

  const masterNodes = createMasterNodes(context)

  store.decks.forEach((deck) => {
    deck.limiter.connect(masterNodes.gain)
  })

  store.setMasterNodes(masterNodes)
  masterNodes.gain.connect(masterNodes.limiter)
  masterNodes.limiter.connect(masterNodes.analyserL)
  masterNodes.limiter.connect(masterNodes.analyserR)
  masterNodes.limiter.connect(context.destination)

  setAnalysers(masterNodes.analyserL, masterNodes.analyserR)
  start()
})
</script>

<template>
  <div>
    <!-- Master controls and output -->
    <pre>{{store.decks}}</pre>
    <pre>{{channels}}</pre>
  </div>
</template>
