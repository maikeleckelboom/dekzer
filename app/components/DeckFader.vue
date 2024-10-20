<script lang="ts" setup>
import { useGainNodes } from '~/composables/useGainNodes'
import { useSharedAudioContext } from '#imports'

const { index, name } = defineProps<{ index: number; name: string }>()

const { setDeckGain } = useSharedAudioContext()

const gain = defineModel<number>('modelValue', {
  type: Number,
  default: 0,
  set: (v) => {
    console.log(`Set gain deck ${index} to ${v}`)
    setDeckGain(index, v)
  }
})
</script>

<template>
  <div>
    <label>{{ name }} Gain: {{ gain }} dB</label>
    <input
      v-model.number="gain"
      :max="12"
      :min="-12"
      step="0.1"
      type="range" />
  </div>
</template>
