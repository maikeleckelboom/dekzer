<script lang="ts" setup>
const chain = useAudioNodeChain()

const { audioContext, getAudioContext } = useAudioContext()

const identifier: string = 'master' as const

onMounted(async () => {
  const context = await getAudioContext()
  const gain = createGain(context)
  const [analyserLeft, analyserRight] = createAnalysers(context)
  const compressor = createDynamicsCompressor(context, CompressorPreset.MasterLimiter)
  chain.add(identifier, { gain, analyserLeft, analyserRight, compressor }, { connect: true })
  const outputNode = chain.getOutputNode(identifier)
  outputNode.connect(context.destination)
})

const gainValue = shallowRef<number>(0.5)
const gainModel = computed({
  get: () => gainValue.value,
  set: (value: number) => {
    const dB = faderToDB(value, -12, 12)
    const linearGainValue = dbToLinearGain(dB)
    const context = unrefNotNull(audioContext)
    const gainNode = chain.getGainNode(identifier)
    gainNode.gain.setValueAtTime(linearGainValue, context.currentTime)
    gainValue.value = value
  }
})

const analysers = computed(() => {
  if (!chain.chains.has(identifier)) return []
  return chain.getAnalyserNodes(identifier)
})
const amplitudeMeter = useAudioAnalyser(analysers)

// todo: Start the amplitude meter when is playing
watch(analysers, (payload) => {
  if (payload.length > 0) {
    amplitudeMeter.start()
  } else {
    amplitudeMeter.stop()
  }
})
</script>

<template>
  <div>
    <div class="col-span-3 flex w-full max-w-64 text-start">
      <pre>{{ amplitudeMeter }}</pre>
    </div>
    <input
      v-model="gainModel"
      max="1"
      min="0"
      step="0.01"
      type="range" />
  </div>
</template>
