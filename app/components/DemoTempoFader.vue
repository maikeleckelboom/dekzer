<script lang="ts" setup>
import FaderGroove from '~~/layers/fader/components/Fader/FaderGroove.vue'

const modelValue = ref<number>(100)
</script>

<template>
  <div class="flex h-60 w-auto flex-row">
<!--    <div-->
<!--      class="flex h-full w-full flex-col items-center justify-center gap-1 px-4 pb-5 pt-1 text-center *:leading-none">-->
<!--      <IconMinus class="size-3.5" />-->
<!--      <span class="h-full my-auto flex items-center text-xs leading-none"></span>-->
<!--      <IconPlus class="size-3.5 -translate-y-1/2 "/>-->
<!--    </div>-->
    <div class="flex gap-y-2 flex-col justify-center items-center ">
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
      <span
        class="text-muted-foreground text-[10px] font-semibold tabular-nums leading-tight">
        TEMPO
      </span>
    </div>
  </div>
</template>
