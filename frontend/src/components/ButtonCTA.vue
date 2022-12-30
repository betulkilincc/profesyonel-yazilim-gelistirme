<script setup lang="ts">
import LoadingSpinner from "./LoadingSpinner.vue";

const props = defineProps<{
  icon?: any;
  loading?: boolean;
  clickAction: (payload?: any) => void;
  payload?: any;
}>();
</script>

<template>
  <button
    type="button"
    class="vx-cta inline-flex items-center rounded-xl bg-secondary-1 px-4 py-2 text-white shadow-lg hover:bg-secondary-4"
    @click.prevent="clickAction(payload)"
    :disabled="loading"
  >
    <LoadingSpinner v-if="loading" class="mr-2" />
    <div v-else>
      <Component
        v-if="icon"
        :is="props.icon"
        class="-ml-1 mr-2 h-5 w-5"
        aria-hidden="true"
      />
    </div>

    <slot></slot>
  </button>
</template>

<style scoped></style>
