<script lang="ts">
export const MasterIdentifier: string = 'master' as const
</script>

<script lang="ts" setup>
const chain = useAudioNodeChain()

const { audioContext, getAudioContext } = useAudioContext()

onMounted(async () => {
  const context = await getAudioContext()
  const gain = createGain(context)
  const [analyserLeft, analyserRight] = createAnalysers(context)
  const compressor = createDynamicsCompressor(context, CompressorPreset.MasterLimiter)
  chain.add(MasterIdentifier, { gain, analyserLeft, analyserRight, compressor }, { connect: true })
  const outputNode = chain.getOutputNode(MasterIdentifier)
  outputNode.connect(context.destination)
})

const gainValue = shallowRef<number>(0.5)
const gainModel = computed({
  get: () => gainValue.value,
  set: (value: number) => {
    const dB = faderToDB(value, -12, 12)
    const linearGainValue = dbToLinearGain(dB)
    const context = unrefNotNull(audioContext)
    const gainNode = chain.getGainNode(MasterIdentifier)
    gainNode.gain.setValueAtTime(linearGainValue, context.currentTime)
    gainValue.value = value
  }
})

const analysers = computed(() => {
  if (!chain.chains.has(MasterIdentifier)) return []
  return chain.getAnalyserNodes(MasterIdentifier)
})

const audioAnalyser = useAudioAnalyser(analysers)

// todo: run the audio analyser only when playing
watch(analysers, (payload) => {
  if (payload.length > 0) {
    audioAnalyser.start()
  } else {
    audioAnalyser.stop()
  }
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
