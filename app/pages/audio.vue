<script lang="ts" setup>

</script>

<template>
  <div>
    <div class="grid place-items-center">
      <AudioMaster />
      <AudioTrack
        identifier="trackA"
        url="/assets/Serato/StarterPack/02%20-%20House%20Track%20Serato%20House%20Starter%20Pack.mp3" />
      <AudioTrack
        identifier="trackB"
        url="/assets/Serato/StarterPack/03%20-%20House%20Track%20Serato%20House%20Starter%20Pack.mp3" />
      <AudioCrossFade />
    </div>
  </div>
</template>
