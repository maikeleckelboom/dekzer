<script lang="ts" setup>
const slots = defineSlots<{
  default(): void
  northwest(): void
  northeast(): void
  southeast(): void
  southwest(): void
}>()
</script>

<template>
  <div class="grid select-none grid-cols-[auto,1fr,auto] grid-rows-[auto,1fr,auto] border">
    <div class="row-start-1 grid place-items-center">
      <slot name="northwest" />
      <!-- Key lock -->
    </div>
    <div class="col-start-3 row-start-3 grid place-items-center">
      <slot name="southeast" />
      <!-- Eject -->
    </div>
    <div class="col-start-3 grid place-items-center">
      <slot name="northeast" />
      <!-- Slip Mode -->
    </div>
    <div class="row-start-3 grid place-items-center">
      <slot name="southwest" />
      <!-- Play/Pause -->
    </div>
    <div class="col-start-2 row-start-2 grid place-items-center">
      <slot />
    </div>
  </div>
</template>
