<script lang="ts" setup>
interface PitchRangeOption {
  value: number
  label: string
  active: boolean
}

const pitchRangeOptions = ref<PitchRangeOption[]>([
  { value: 8, label: '8', active: true },
  { value: 16, label: '16', active: false },
  { value: 50, label: '50', active: false }
])

function setPitchRange(value: number) {
  pitchRangeOptions.value.forEach((option) => {
    option.active = option.value === value
  })
}
</script>

<template>
  <div class="flex w-full items-center">
    <DeckButton
      v-for="option in pitchRangeOptions"
      :key="option.value"
      :active="option.active"
      class="w-auto flex-grow"
      @click="setPitchRange(option.value)">
      {{ option.label }}
    </DeckButton>
  </div>
</template>
