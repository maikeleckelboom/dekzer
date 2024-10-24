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
  <div class="relative mx-8 flex flex-col gap-4">
    <TopBar />
    <div class="grid gap-2 md:grid-cols-2">
      <DeckPlatform
        v-for="deck in decks"
        :key="deck.id"
        :deck="deck" />
    </div>
    <div class="flex flex-row justify-center">
      <FaderRoot v-model="pannerValue" :max="1" :min="-1" class="w-40 md:w-56">
        <FaderTrack>
          <FaderMarkerRail :stripe-count="5" />
          <FaderRailSlot />
          <FaderMarkerRail :stripe-count="5"/>
        </FaderTrack>
        <FaderHandle :translucent="false" />
      </FaderRoot>
    </div>
    <div class="flex flex-col">
      <!-- Tracks Table/List -->
    </div>
  </div>
</template>
