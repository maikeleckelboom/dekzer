<script lang="ts" setup>
const chain = useAudioNodeChain()
const { getAudioContext } = useAudioContext()


onMounted(async() => {
  console.log(`%cAudioCrossFade`, 'color: hotpink; font-size: 16px;')

  const audioContext = await getAudioContext()

  // get the audio nodes from the chain
  const chainTrackA = chain.getChain('trackA')
  const chainTrackB = chain.getChain('trackB')

  const sourceA = chainTrackA?.nodes.at(0) as AudioNode
  const sourceB = chainTrackB?.nodes.at(0) as AudioNode

  console.log('sourceA', sourceA, 'sourceB', sourceB)

  const trackACrossfadeNode = chainTrackA?.nodes.at(4) as GainNode
  const trackBCrossfadeNode = chainTrackB?.nodes.at(4) as GainNode

  console.log('trackACrossfadeNode', trackACrossfadeNode, 'trackBCrossfadeNode', trackBCrossfadeNode)

})

function crossfade(value: number) {
  const crossfadeValue = value / 100
  const gainA = Math.cos(crossfadeValue * 0.5 * Math.PI);
  const gainB = Math.cos((1.0 - crossfadeValue) * 0.5 * Math.PI);

  const routerGainA = chain.getChain('trackA')?.nodes.at(4) as GainNode
  const routerGainB = chain.getChain('trackB')?.nodes.at(4) as GainNode

  console.log('routerGainA', routerGainA.gain.value)
  console.log('routerGainB', routerGainB.gain.value)
  routerGainA.gain.value = gainA;
  routerGainB.gain.value = gainB;
}

const crossfadeValue = ref(50)

</script>

<template>
  <div>
    <!-- -->
    <input type="range" min="0" max="100" v-model="crossfadeValue" @input="crossfade(crossfadeValue)" />
  </div>
</template>
