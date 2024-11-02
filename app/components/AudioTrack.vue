<script lang="ts" setup>
import { unrefNotNull } from '~/utils/resolveRef'

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
  console.log(`%cAudioTrack - ${identifier}`, 'color: yellow; font-size: 16px;')
  const element = unrefNotNull(audioElement)
  const context = await getAudioContext()
  const source = context.createMediaElementSource(element)
  const gainNode = context.createGain()
  const analyserNodeL = context.createAnalyser()
  const analyserNodeR = context.createAnalyser()
  const compressorNode = context.createDynamicsCompressor()
  chain.addChain(identifier, [source, gainNode, analyserNodeL, analyserNodeR, compressorNode])
  chain.setChainActive(identifier)

  // connect to destination
  compressorNode.connect(context.destination)
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
