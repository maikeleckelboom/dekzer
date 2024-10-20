<script lang="ts" setup>
import { useDeckStore } from '~~/layers/deck/stores/deck'
import { useTrackStore } from '~~/layers/track/stores/track'

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
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="grid md:divide-x 2xl:grid-cols-2">
      <DeckPlatform
        v-for="deck in decks"
        :key="deck.id"
        :deck="deck" />
    </div>
    <div class="flex flex-col">
      <!-- Tracks Table/List -->
    </div>
  </div>
</template>
