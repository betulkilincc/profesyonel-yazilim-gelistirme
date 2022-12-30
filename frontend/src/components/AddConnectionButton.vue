<script setup lang="ts">
import { PlusIcon } from "@heroicons/vue/outline";

defineProps<{
  clickAction: () => void;
}>();
</script>

<template>
  <div
    class="rounded-2xl bg-secondary-3 shadow-lg transition-all hover:-mt-1 hover:cursor-pointer hover:shadow-xl"
    @click.prevent="clickAction()"
  >
    <div class="p-6 text-center text-secondary-1">
      <div class="py-[24px]">
        <PlusIcon class="mx-auto h-12 w-12"></PlusIcon>
        <span class="mt-1 flex flex-col"> Add Connection </span>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
