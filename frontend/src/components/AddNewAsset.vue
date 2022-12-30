<script setup lang="ts">
import { onUpdated, ref } from "vue";
import ModalWindow from "./Modals/ModalWindow.vue";
import { AdjustmentsIcon, PencilAltIcon } from "@heroicons/vue/solid";
import NewTransactionModalContent from "./Modals/NewTransactionModalContent.vue";
import NewConnectionModalContent from "./Modals/NewConnectionModalContent.vue";
import { Asset } from "../vealthAPI/types";
import { delayExecution } from "../utils/timers";

const props = defineProps<{
  isOpen: boolean;
  startInConnectionTab?: boolean;
  startWithAssetSelected?: Asset;
}>();

const emit = defineEmits(["closeModal"]);

const tabs = ref([
  {
    name: "Add Transaction",
    icon: PencilAltIcon,
    current: true,
  },
  {
    name: "Add Connection",
    icon: AdjustmentsIcon,
    current: false,
  },
]);

function changeTab(tab: any) {
  tabs.value.forEach((t) => {
    t.current = false;
  });
  tab.current = true;
}

onUpdated(async () => {
  let def = false;
  if (props.startInConnectionTab) def = true;

  if (!def) await delayExecution(200);

  tabs.value[0].current = !def;
  tabs.value[1].current = def;
});
</script>

<template>
  <ModalWindow
    :is-open="isOpen"
    @close-modal="emit('closeModal')"
    :custom-style="'sm:max-w-lg'"
  >
    <div class="mb-5 block">
      <div class="border-b border-separator">
        <nav class="-mb-px flex" aria-label="Tabs">
          <a
            v-for="tab in tabs"
            :key="tab.name"
            @click.prevent="changeTab(tab)"
            :class="[
              tab.current
                ? 'border-primary-3 text-primary-3'
                : 'border-transparent text-text-3 hover:border-separator hover:text-text-2',
              'vx-cta group inline-flex w-full items-center justify-center border-b-2 py-4 px-1 hover:cursor-pointer',
            ]"
            :aria-current="tab.current ? 'page' : undefined"
          >
            <component
              :is="tab.icon"
              :class="[
                tab.current
                  ? 'text-primary-3'
                  : 'text-text-3 group-hover:text-text-2',
                '-ml-0.5 mr-2 h-5 w-5',
              ]"
              aria-hidden="true"
            />
            <span>{{ tab.name }}</span>
          </a>
        </nav>
      </div>
    </div>
    <div>
      <NewTransactionModalContent
        v-if="tabs[0].current"
        @close-modal="emit('closeModal')"
        :start-with-asset-selected="startWithAssetSelected"
      />
      <NewConnectionModalContent
        v-if="tabs[1].current"
        @close-modal="emit('closeModal')"
      />
    </div>
  </ModalWindow>
</template>

<style scoped></style>
