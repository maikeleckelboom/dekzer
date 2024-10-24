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
  <div class="flex flex-col relative mx-8 gap-4">
    <TopBar />
    <div class="grid md:grid-cols-2 gap-2">
      <DeckPlatform
        v-for="deck in decks"
        :key="deck.id"
        :deck="deck" />
    </div>
    <div class="flex flex-row justify-center  ">
      <FaderRoot
        class="w-52 "
        :min="-1"
        :max="1"
        v-model="pannerValue">
        <FaderTrack>
          <!-- -->
        </FaderTrack>
        <FaderHandle />
      </FaderRoot>
    </div>
    <div class="flex flex-col">
      <!-- Tracks Table/List -->
    </div>
  </div>
</template>
