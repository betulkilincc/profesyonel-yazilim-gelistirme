<script setup lang="ts">
import {
  Dialog,
  DialogPanel,
  DialogOverlay,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue";

const emit = defineEmits(["closeModal"]);

defineProps<{
  isOpen: boolean;
  customStyle: string;
}>();
</script>

<template>
  <TransitionRoot as="template" :show="isOpen">
    <Dialog
      as="div"
      class="fixed inset-0 z-10 overflow-y-auto"
      @close="emit('closeModal')"
    >
      <div
        class="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0"
      >
        <TransitionChild
          as="template"
          enter="ease-out duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="ease-in duration-200"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <DialogOverlay
            class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          />
        </TransitionChild>

        <!-- This element is to trick the browser into centering the modal contents. -->
        <span
          class="hidden sm:inline-block sm:h-screen sm:align-middle"
          aria-hidden="true"
          >&#8203;</span
        >
        <TransitionChild
          as="template"
          enter="ease-out duration-300"
          enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enter-to="opacity-100 translate-y-0 sm:scale-100"
          leave="ease-in duration-200"
          leave-from="opacity-100 translate-y-0 sm:scale-100"
          leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        >
          <DialogPanel
            :class="[
              customStyle,
              'inline-block transform overflow-hidden rounded-xl bg-white p-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:p-8 sm:align-middle',
            ]"
          >
            <slot></slot>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
