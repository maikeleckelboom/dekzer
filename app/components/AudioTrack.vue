<script lang="ts" setup>
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
  const gain = context.createGain()
  const amplifier = context.createGain()
  const crossfade = context.createGain()
  const analyserLeft = context.createAnalyser()
  const analyserRight = context.createAnalyser()
  const compressor = context.createDynamicsCompressor()

  chain.add(identifier, {source, gain, amplifier, analyserLeft, analyserRight, crossfade, compressor}, {
    connect: true,
  })

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
