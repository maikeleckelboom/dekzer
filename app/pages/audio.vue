<script lang="ts" setup>
import AudioMaster from '~/components/AudioMaster.vue'

const { getAudioContext } = useAudioContext()

const chain = useAudioNodeChain()

onMounted(()=>{
  setTimeout(()=>{
    console.log('Audio Chains')
    console.log(chain.chains)
  }, 0)
})
</script>

<template>
  <div>
    <h1>Audio Routing</h1>
    <div class="grid place-items-center">
      <AudioMaster />
      <AudioTrack identifier="trackA" url="/assets/Serato/StarterPack/02%20-%20House%20Track%20Serato%20House%20Starter%20Pack.mp3"/>
      <AudioTrack identifier="trackB" url="/assets/Serato/StarterPack/03%20-%20House%20Track%20Serato%20House%20Starter%20Pack.mp3"/>
      <AudioCrossFade />
    </div>
  </div>
</template>

<style scoped></style>
