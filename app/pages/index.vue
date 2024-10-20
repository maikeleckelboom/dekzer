<script lang="ts" setup>
import { useDeckStore } from '~~/layers/deck/stores/deck'
import { useTrackStore } from '~~/layers/track/stores/track'
import MasterFader from '~/components/MasterFader.vue'

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
    <MasterFader  />
    <DeckFader v-for="deck in decks" :key="deck.id" :index="deck.index" :name="deck.name" />
  </div>
  <div class="grid 2xl:grid-cols-2 md:divide-x">
    <DeckPlatform :deck="deck" v-for="deck in decks" :key="deck.id" />
  </div>
</template>
