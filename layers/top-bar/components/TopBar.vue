<script lang="ts" setup></script>

<template>
  <div class="flex w-full flex-nowrap items-center p-2">
    <div class="grid place-items-center">
      <!-- Left Part -->
      <span class="leading-none font-semibold text-xs text-muted-foreground whitespace-nowrap">Dekzer</span>
    </div>
    <div class="flex flex-nowrap items-center">
      <!-- Middle Part -->
    </div>
    <div class="flex flex-nowrap items-center justify-end w-full gap-3">
      <!-- Right Part -->
      <span class="leading-none font-semibold text-xs text-muted-foreground">Master</span>
      <MasterGainFader :channels="[-60,-60]" />
    </div>
  </div>
</template>

<style scoped></style>
