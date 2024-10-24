<script lang="ts" setup></script>

<template>
  <div
    :class="
      cn(
        'subpixel-antialiased [image-rendering:pixelated]',
        '[clip-path:polygon(0%_0%,_100%_0%,_95%_50%,_100%_100%,_0%_100%,_5%_50%)]',
        'absolute top-1/2 -translate-y-1/2',
        'bg-muted z-20 aspect-[14/20] w-8 max-w-full rounded-[1px]',
        'touch-none select-none hover:cursor-grab active:cursor-grabbing',
        'after:bg-muted-foreground after:h-px after:w-2/3 after:rounded-[1px]',
        'after:absolute after:left-1/2 after:top-1/2',
        'after:-translate-x-1/2 after:-translate-y-1/2'
      )
    " />
</template>
