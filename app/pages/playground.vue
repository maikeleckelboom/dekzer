<script lang="ts" setup>

</script>

<template>
  <PlaygroundProvider>
    <PlaygroundMaster />
    <PlaygroundDeck :index="0" />
    <PlaygroundDeck :index="1" />
    <PlaygroundCrossFader />
  </PlaygroundProvider>
</template>
