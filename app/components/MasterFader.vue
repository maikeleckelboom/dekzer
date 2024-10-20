<script lang="ts" setup>
import { useGainNodes } from '~/composables/useGainNodes'
import { useSharedAudioContext } from '~/composables/useAudioContext'

const { setMasterGain } = useSharedAudioContext()

const masterGain = defineModel<number>('modelValue', {
  type: Number,
  default: 0,
  set: (v) => {
    console.log('Set master gain:', v)
    setMasterGain(v)
  }
})
</script>

<template>
  <div>
    <label>Master Gain: {{ masterGain }} dB</label>
    <input
      v-model.number="masterGain"
      :max="24"
      :min="-24"
      step="0.1"
      type="range" />
  </div>
</template>
