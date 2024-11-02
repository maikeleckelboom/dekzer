<script lang="ts" setup>
const chain = useAudioNodeChain()
const { getAudioContext } = useAudioContext()

onMounted(async() => {
  console.log(`%cAudioCrossFade`, 'color: pink; font-size: 16px;')

  const audioContext = await getAudioContext()

  // get the audio nodes from the chain
  const chainTrackA = chain.getChain('trackA')
  const chainTrackB = chain.getChain('trackB')

  console.log(chainTrackA)
  console.log(chainTrackB)

  // get the source nodes


  // const routerGainA = audioContext.createGain();
  // const routerGainB = audioContext.createGain();
  // const mergerNode = audioContext.createChannelMerger(2);
  // Connect sources
  // sourceA.connect(routerGainA).connect(mergerNode, 0, 0);
  // sourceB.connect(routerGainB).connect(mergerNode, 0, 1);
  // Crossfade control (adjust gain levels)
  // function setCrossfade(value: number): void {
  //   routerGainA.gain.value = 1 - value;
  //   routerGainB.gain.value = value;
  // }
})
</script>

<template>
  <div>
    <!-- -->
  </div>
</template>
