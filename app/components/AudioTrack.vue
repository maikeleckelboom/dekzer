<script lang="ts" setup>
import { unrefNotNull } from '~/utils/resolveRef'
import { capitalize } from 'vue'

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
// const chain2 = useAudioNodeChain2()

onMounted(async () => {
  console.log(`%c${capitalize(identifier)}`, 'color: yellow; font-size: 16px;')

  const element = unrefNotNull(audioElement)
  const context = await getAudioContext()
  const source = context.createMediaElementSource(element)
  const gain = context.createGain()
  const crossfade = context.createGain()
  const analyserLeft = context.createAnalyser()
  const analyserRight = context.createAnalyser()
  const compressor = context.createDynamicsCompressor()

  chain.add(identifier, [source, gain, analyserLeft, analyserRight, crossfade, compressor], {
    connect: true
  })

  // chain2.add(
  //   identifier,
  //   { source, gain, analyserLeft, analyserRight, crossfade, compressor },
  //   {
  //     connect: true
  //   }
  // )

  const masterInputNode = chain.inputNode('master')
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
