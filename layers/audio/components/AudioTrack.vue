<script lang="ts" setup>
const { audioContext, getAudioContext } = useAudioContext()
const audioElement = useTemplateRef<HTMLAudioElement>('audioElement')

const {
  identifier,
  url = '/assets/Serato/StarterPack/02%20-%20House%20Track%20Serato%20House%20Starter%20Pack.mp3'
} = defineProps<{
  identifier: string
  url: string
}>()

const chain = useAudioNodeChain()

onMounted(async () => {
  const element = unrefNotNull(audioElement)
  const context = await getAudioContext()
  const source = context.createMediaElementSource(element)

  const gain = createGain(context)
  const amplifier = createGain(context)
  const crossfade = createGain(context)
  const [analyserLeft, analyserRight] = createAnalysers(context, { fftSize: 2048 })
  const compressor = createDynamicsCompressor(context, CompressorPreset.TrackBalancer)

  chain.add(
    identifier,
    { source, gain, amplifier, analyserLeft, analyserRight, crossfade, compressor },
    {
      connect: true
    }
  )

  const masterInputNode = chain.getInputNode('master')
  compressor.connect(masterInputNode)
})

const gainValue = shallowRef<number>(0.5)
const gainModel = computed({
  get: () => gainValue.value,
  set: (inputValue: number) => {
    const dB = faderToDB(inputValue, -24, 24)
    const linearGainValue = dbToLinearGain(dB)
    const context = unrefNotNull(audioContext)
    const gainNode = chain.getGainNode(identifier)
    gainNode.gain.setValueAtTime(linearGainValue, context.currentTime)
  }
})

const amplifierValue = shallowRef<number>(1)
const amplifierModel = computed({
  get: () => amplifierValue.value,
  set: (value: number) => {
    const amplifier = chain.getAmplifierNode(identifier)
    amplifier.gain.value = value
  }
})
</script>

<template>
  <div>
    <audio
      ref="audioElement"
      :src="url"
      controls />

    <div class="grid grid-cols-3 gap-2">
      <!-- Gain Sliders SIMPLE -->
      <div>
        <div class="flex items-center gap-1">
          <IconVolume2 class="size-5" />
          <span class="text-xs font-bold">
            Gain
          </span>
        </div>
        <input
          v-model="gainModel"
          max="1"
          min="0"
          step="0.01"
          type="range" />
      </div>
      <!-- Amplifier Sliders SIMPLE -->
      <div>
        <div class="flex items-center gap-1">
          <IconVolume2 class="size-5" />
          <span class="text-xs font-bold">
            Volume
          </span>
        </div>
        <input
          v-model="amplifierModel"
          max="1"
          min="0"
          step="0.01"
          type="range" />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
