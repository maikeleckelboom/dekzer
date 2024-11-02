<script lang="ts" setup>
import { useAudioAmplitudeMeter } from '~~/layers/audio/composables/useAudioAmplitudeMeter'

const { identifier, url } = defineProps<{ identifier: string; url: string }>()

const { audioContext, getAudioContext } = useAudioContext()

const chain = useAudioNodeChain()

const audioElement = useTemplateRef<HTMLAudioElement>('audioElement')

onMounted(async () => {
  const element = unrefNotNull(audioElement)
  const context = await getAudioContext()

  const source = context.createMediaElementSource(element)

  const gain = createGain(context)
  const fader = createGain(context)
  const crossfade = createGain(context)
  const [analyserLeft, analyserRight] = createAnalysers(context, { fftSize: 2048 })
  const compressor = createDynamicsCompressor(context, CompressorPreset.TrackBalancer)

  chain.add(
    identifier,
    { source, gain, fader, analyserLeft, analyserRight, crossfade, compressor },
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

const faderValue = shallowRef<number>(1)
const faderModel = computed({
  get: () => faderValue.value,
  set: (value: number) => {
    const faderNode = chain.getFaderNode(identifier)
    faderNode.gain.value = value
  }
})

const analysers = computed(() => chain.getAnalyserNodes(identifier))
const amplitudeMeter = useAudioAmplitudeMeter(analysers)
</script>

<template>
  <div >
    <audio
      ref="audioElement"
      :src="url"
      controls
      @pause="
        () => {
          amplitudeMeter.stop()
        }
      "
      @play="
        () => {
          amplitudeMeter.start()
        }
      " />
    <div class="grid grid-cols-3 gap-2">
      <div>
        <div class="flex items-center gap-1">
          <IconVolume2 class="size-5" />
          <span class="text-xs font-bold"> Gain </span>
        </div>
        <input
          v-model="gainModel"
          aria-orientation="vertical"
          max="1"
          min="0"
          step="0.01"
          type="range" />
      </div>
      <div>
        <div class="flex items-center gap-1">
          <IconVolume2 class="size-5" />
          <span class="text-xs font-bold"> Fader </span>
        </div>
        <input
          v-model="faderModel"
          aria-orientation="vertical"
          max="1"
          min="0"
          step="0.01"
          type="range" />
      </div>
      <div class="max-w-64 col-span-3 w-full flex text-start">
        <pre>{{ amplitudeMeter }}</pre>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
