<script lang="ts" setup></script>

<template>
  <div>
    <div class="flex flex-col gap-4 mx-auto p-4 max-w-7xl bg-muted/20">
      <AudioMaster />
      <div class="grid md:grid-cols-[auto,1fr,1fr,auto]">
        <AudioTempo :bpm="88" />
        <AudioTrack
          identifier="trackA"
          url="/assets/Serato/StarterPack/02%20-%20House%20Track%20Serato%20House%20Starter%20Pack.mp3" />
        <AudioTrack
          identifier="trackB"
          url="/assets/Serato/StarterPack/03%20-%20House%20Track%20Serato%20House%20Starter%20Pack.mp3" />
        <AudioTempo :bpm="92" />
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
