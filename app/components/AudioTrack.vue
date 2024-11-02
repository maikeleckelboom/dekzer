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
  const sourceNode = context.createMediaElementSource(element)
  const gainNode = context.createGain()
  const analyserLNode = context.createAnalyser()
  const analyserRNode = context.createAnalyser()
  const compressorNode = context.createDynamicsCompressor()

  chain.addChain(identifier, [sourceNode, gainNode, analyserLNode, analyserRNode, compressorNode])
  chain.connectChainNodes(identifier)

  const masterChain = chain.getChain('master')

  if (!masterChain?.nodes?.length) {
    throw new Error('Master chain not found')
  }

  compressorNode.connect(masterChain.nodes.at(0) as AudioNode)
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
