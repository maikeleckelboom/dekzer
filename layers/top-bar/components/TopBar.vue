<script lang="ts" setup></script>

<template>
  <div class="flex w-full flex-nowrap items-center p-2">
    <div class="grid place-items-center">
      <!-- Logo -->
    </div>
    <div class="flex flex-nowrap items-center">
      <!-- Middle Part -->
    </div>
    <div class="flex flex-nowrap items-center justify-center w-full">
      <!-- Right Part -->
      <MasterGainFader :channels="[Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY]" />
    </div>
  </div>
</template>

<style scoped></style>
