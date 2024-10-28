<script lang="ts" setup>
const audioContext = inject('audioContext') as Ref<AudioContext | null>

const currentValue = shallowRef<number>(0)

const gainNodeA = ref<GainNode>()
const gainNodeB = ref<GainNode>()

whenever(audioContext, (context) => {
  console.log('context', context)

  gainNodeA.value = context.createGain()
  gainNodeB.value = context.createGain()
})

// We need to connect the crossfader to the volume nodes of the decks
watch(currentValue, (value) => {
  console.log('currentValue', value)
})
</script>


<template>
  <div>
    <input
      type="range"
      min="0"
      max="1"
      step="0.001"
      v-model.number="currentValue"
    />
  </div>
</template>
