<script lang="ts" setup>
import { useDeckStore } from '~~/layers/deck/stores/deck'
import { useTrackStore } from '~~/layers/track/stores/track'
import TopBar from '~~/layers/top-bar/components/TopBar.vue'

useHead({
  title: 'Decks',
  meta: [
    {
      name: 'description',
      content: 'A new way to experience music.'
    }
  ]
})

const deckStore = useDeckStore()
const { decks } = storeToRefs(deckStore)

const trackStore = useTrackStore()
const { tracks } = storeToRefs(trackStore)

const pannerValue = ref(0)
</script>

<template>
  <div class="relative mx-4 flex flex-col gap-4">
    <TopBar />
    <div class="grid gap-2 md:grid-cols-2">
      <DeckPlatform
        v-for="deck in decks"
        :key="deck.id"
        :deck="deck" />
    </div>
    <div class="flex flex-row justify-center">
      <div class="text-muted flex flex-nowrap items-center gap-1.5 p-2">
        <IconChevronLeft class="size-6" />
        <span class="font-bold tabular-nums leading-none text-muted-foreground text-sm">A</span>
      </div>
      <FaderRoot
        v-model="pannerValue"
        :max="1"
        :min="-1"
        class=" md:w-52">
        <FaderTrack>
          <FaderMarkerRail
            :nth="2"
            :stripe-count="5" />
          <FaderGroove />
          <FaderMarkerRail
            :nth="2"
            :stripe-count="5" />
        </FaderTrack>
        <FaderHandle :translucent="false" />
      </FaderRoot>
      <div class="text-muted flex flex-nowrap items-center gap-1.5 p-2">
        <span class="font-bold tabular-nums leading-none text-muted-foreground text-sm">B</span>
        <IconChevronRight class="size-6" />
      </div>
    </div>
    <div class="flex flex-col">
      <!-- Tracks Table/List -->
    </div>
  </div>
</template>
