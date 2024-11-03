<script setup lang="ts"></script>

<template>
  <div class="flex flex-row justify-center gap-1">
    <div class="text-muted-foreground flex flex-nowrap items-center gap-1 p-2">
      <IconChevronLeft class="size-5" />
      <span class="text-xs font-semibold tabular-nums leading-none select-none">A</span>
    </div>
    <div class="grid place-items-center">
      <slot />
    </div>
    <div class="text-muted-foreground flex flex-nowrap items-center gap-1 p-2">
      <span class="text-xs font-semibold tabular-nums leading-none select-none">B</span>
      <IconChevronRight class="size-5" />
    </div>
  </div>
</template>