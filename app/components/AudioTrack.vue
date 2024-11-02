<script lang="ts" setup>
import {
  CompressorPreset,
  createDynamicsCompressor
} from '~~/layers/audio/utils/dynamicsCompressor'

const { getAudioContext } = useAudioContext()
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
  const [analyserLeft, analyserRight] = createAnalysers(context)
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
</script>

<template>
  <div>
    <h1>Audio</h1>

    <audio
      ref="audioElement"
      :src="url"
      controls></audio>
  </div>
</template>

<style scoped></style>
