<script lang="ts" setup>
import {AudioTrack} from "#components";

const trackA = useTemplateRef<InstanceType<typeof AudioTrack>>('trackA')
const trackB = useTemplateRef<InstanceType<typeof AudioTrack>>('trackB')
</script>

<template>
  <div>
    <div class="flex flex-col gap-4 mx-auto p-4 max-w-7xl bg-muted/20">
      <AudioMaster />
      <div class="grid md:grid-cols-[auto,1fr,1fr,auto]">
        <AudioTrack
          ref="trackA"
          identifier="trackA"
          url="/assets/Serato/StarterPack/02%20-%20House%20Track%20Serato%20House%20Starter%20Pack.mp3" />
        <AudioTrack
          ref="trackB"
          identifier="trackB"
          url="/assets/Serato/StarterPack/03%20-%20House%20Track%20Serato%20House%20Starter%20Pack.mp3" />
      </div>
      <AudioCrossFade />
    </div>
  </div>
</template>

<style>
input[type='range'][aria-orientation='vertical'] {
  writing-mode: vertical-rl;
  direction: rtl;
  width: 12px;
  height: 180px;
}
</style>
