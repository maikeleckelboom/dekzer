<script lang="ts" setup>
defineSlots<{ default: void }>()
</script>

<template>
  <div
    :class="
      cn(
        'grid place-items-center',
        'bg-foreground z-0 size-[calc(100%-22px)] rounded-full md:size-[calc(100%-22px)]',
        'after:bg-muted-foreground after:pointer-events-none after:absolute after:size-4 after:rounded-full md:after:size-5',
        'after:left-1/2 after:top-1/2 after:z-30 after:-translate-x-1/2 after:-translate-y-1/2',
        $attrs.class ?? ''
      )
    "
    data-name="platter">
    <slot />
  </div>
</template>
