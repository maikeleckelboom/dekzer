<script lang="ts" setup>
const { identifier, url } = defineProps<{ identifier: string; url: string }>()

const { audioContext, getAudioContext } = useAudioContext()

const audioElement = useTemplateRef<HTMLAudioElement>('audioElement')

const tempo = shallowRef<{ bpm: number; offset: number }>()

const chain = useAudioNodeChain()

onMounted(async () => {
  const context = await getAudioContext()
  const element = unrefNotNull(audioElement)
  const source = context.createMediaElementSource(element)

  const gain = createGain(context, { value: 0.5 })
  const fader = createGain(context, { value: 1 })
  const crossfade = createGain(context, { value: 1 })
  const [analyserLeft, analyserRight] = createAnalysers(context, { fftSize: 2048 })
  const compressor = createDynamicsCompressor(context, CompressorPreset.None)

  chain.add(
    identifier,
    {
      source,
      gain,
      fader,
      analyserLeft,
      analyserRight,
      crossfade,
      compressor
    },
    { connect: true }
  )

  const masterInputNode = chain.getInputNode('master')
  compressor.connect(masterInputNode)
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

const faderValue = shallowRef<number>(1)
const faderModel = computed({
  get: () => faderValue.value,
  set: (value: number) => {
    const faderNode = chain.getFaderNode(identifier)
    const context = unrefNotNull(audioContext)
    faderNode.gain.setValueAtTime(value, context.currentTime)
    faderValue.value = value
  }
})

const analysers = computed(() => chain.getAnalyserNodes(identifier))
const audioAnalyser = useAudioAnalyser(analysers)

function setPlaybackRate(rate: number) {
  const element = unrefNotNull(audioElement)
  element.playbackRate = rate
}

function setPreservesPitch(payload: boolean) {
  const element = unrefNotNull(audioElement)
  element.preservesPitch = payload
}

defineExpose({
  audioElement,
  setPlaybackRate,
  setPreservesPitch
})
</script>

<template>
  <div class="mx-auto flex w-full max-w-xl flex-col items-center gap-2">
    <div class="flex p-2">
      <span class="text-lg font-bold">Tempo:</span>
      <span class="text-lg">{{ tempo }}</span>
    </div>
    <audio
      ref="audioElement"
      :src="url"
      controls
      @pause="
        () => {
          audioAnalyser.stop()
        }
      "
      @play="
        () => {
          audioAnalyser.start()
        }
      " />
    <div class="grid grid-cols-2 gap-2">
      <div>
        <input
          v-model="gainModel"
          aria-orientation="vertical"
          max="1"
          min="0"
          step="0.01"
          title="Gain Adjust"
          type="range" />
      </div>
      <div>
        <input
          v-model="faderModel"
          aria-orientation="vertical"
          max="1"
          min="0"
          step="0.01"
          title="Channel Fader"
          type="range" />
      </div>
    </div>
  </div>
</template>
