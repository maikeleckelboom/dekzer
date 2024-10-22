<script lang="ts" setup>
import {
  DECK_GAIN_DEFAULT_VALUE,
  DECK_GAIN_MAX,
  DECK_GAIN_MIN,
  MASTER_GAIN_DEFAULT_VALUE,
  MASTER_GAIN_MAX,
  MASTER_GAIN_MIN
} from '~~/layers/fader/components/utils/constants'

const masterModelValue = ref<number>(MASTER_GAIN_DEFAULT_VALUE)
const masterDbValues = ref<number[]>([Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY])

const deckModelValue = ref<number>(DECK_GAIN_DEFAULT_VALUE)
const deckDbValues = ref<number[]>([0, 0])
</script>

<template>
  <div class="flex gap-4">
    <div class="flex gap-2">
      <Fader
        v-model="masterModelValue"
        :db-max="MASTER_GAIN_MAX"
        :db-min="MASTER_GAIN_MIN"
        :db-values="masterDbValues"
        :max="1"
        :min="0"
        orientation="horizontal" />
    </div>
    <div class="flex gap-2">
      <Fader
        v-model="deckModelValue"
        :db-max="DECK_GAIN_MAX"
        :db-min="DECK_GAIN_MIN"
        :db-values="deckDbValues"
        :max="1"
        :min="0"
        orientation="vertical" />
    </div>
  </div>
</template>
