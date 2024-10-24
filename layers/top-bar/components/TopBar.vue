<script lang="ts" setup></script>

<template>
  <div class="grid w-full grid-cols-[202px,1fr,202px] items-center p-2">
    <div class="flex w-full flex-nowrap items-center">
      <span class="text-muted-foreground whitespace-nowrap text-xs font-semibold leading-none hidden">
        Dekzer
      </span>
    </div>
    <div class="flex flex-nowrap items-center justify-end gap-3">
      <span class="text-muted-foreground/80 tracking-wide text-xs font-semibold leading-none">Master</span>
      <MasterGainFader :channels="[-60, -60]" />
    </div>
  </div>
</template>

<style scoped></style>
