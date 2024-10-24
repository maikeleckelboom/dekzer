<script lang="ts" setup></script>

<template>
  <div
    :class="
      cn(
        'subpixel-antialiased [image-rendering:pixelated]',
        '[clip-path:polygon(0%_0%,_100%_0%,_95%_50%,_100%_100%,_0%_100%,_5%_50%)]',
        'absolute top-1/2 -translate-y-1/2',
        'bg-muted border z-20 aspect-[17/20] w-8 max-w-full rounded-[1px]',
        'touch-none select-none hover:cursor-grab active:cursor-grabbing',
        'after:h-px after:w-4/5 after:rounded-[0px]',
        'after:bg-white after:z-20',
        'after:absolute after:left-1/2 after:top-1/2',
        'after:-translate-x-1/2 after:-translate-y-1/2',
      )
    " />
</template>
