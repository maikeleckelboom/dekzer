<script lang="ts" setup>
const modelValue = ref<number>(100)
</script>

<template>
  <div class="flex h-60 w-auto flex-row">
    <div class="flex gap-y-4 flex-col justify-center items-center ">
      <FaderRoot
        v-model="modelValue"
        :max="150"
        :min="50"
        class="h-60"
        orientation="vertical">
        <FaderTrack>
          <FaderMarkerRail
            :nth="6"
            :stripe-count="13" />
          <FaderGroove />
          <FaderMarkerRail
            :nth="6"
            :stripe-count="13" />
        </FaderTrack>
        <FaderHandle :translucent="false" />
      </FaderRoot>
    </div>
  </div>
</template>
