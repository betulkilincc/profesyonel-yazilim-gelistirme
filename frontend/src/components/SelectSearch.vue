<script setup lang="ts">
import { computed, ComputedRef, onUpdated, Ref, ref, watch } from "vue";
import { CheckIcon, SelectorIcon } from "@heroicons/vue/solid";
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/vue";
import LoadingSpinner from "./LoadingSpinner.vue";
import Fuse from "fuse.js";

const props = defineProps<{
  searchText: string;
  notFoundText: string;
  loadingText: string;
  options: Option[];
  optionsReady: boolean;
  startWithOptionSelected?: Option;
}>();

interface Option {
  title: string;
  subtitle?: string;
  imageURL?: string;
  uid?: string;
  sortWeight?: number; // Higher this is, lower it is in the list
}

const emit = defineEmits(["optionSelected"]);

const query = ref("");
const standardOptionsLimit = 20;
let optionsLimit = ref(20);

let fuse: Fuse<Option>;
const foundOptions: Ref<Option[]> = ref([]);
const filteredOptions: ComputedRef<Option[]> = computed(() => {
  if (query.value === "") {
    foundOptions.value = props.options;
    return props.options.slice(0, optionsLimit.value / 2);
  } else {
    // Do fuzzy search
    foundOptions.value = fuse.search(query.value).map((result) => result.item);

    // Sort based on sortWeight
    foundOptions.value = foundOptions.value.sort((a, b) => {
      if (a.sortWeight === undefined) return 1;
      if (b.sortWeight === undefined) return -1;
      return b.sortWeight - a.sortWeight;
    });

    // Return slice
    return foundOptions.value.slice(0, optionsLimit.value);
  }
});

const selectedOption: Ref<Option> = ref({ title: "" } as Option);

let showOptions = computed(() =>
  props.startWithOptionSelected
    ? false
    : selectedOption.value.title !== ""
    ? false
    : props.optionsReady
    ? true
    : false
);

let placeholder = ref(
  props.optionsReady ? props.searchText : props.loadingText
);

watch(selectedOption, (newValue) => {
  emit("optionSelected", newValue);
  optionsLimit.value = standardOptionsLimit;
});

watch(query, () => {
  optionsLimit.value = standardOptionsLimit;
});

watch(
  () => props.optionsReady,
  (newValue) => {
    if (newValue) {
      placeholder.value = props.searchText;
    }
  }
);

watch(
  () => props.options,
  (newValue) => {
    if (newValue) {
      fuse = new Fuse(props.options, {
        keys: ["title", "subtitle"],
        threshold: 0.3,
      });
    }
  }
);

function loadMoreOptions() {
  optionsLimit.value += 20;
}

onUpdated(() => {
  if (props.startWithOptionSelected) {
    selectedOption.value = props.startWithOptionSelected;
  }
});
</script>

<template>
  <Combobox as="div" v-model="selectedOption" v-slot="{ open }">
    <div class="vx-paragraph relative mt-1">
      <ComboboxInput
        class="w-full rounded-md border border-separator bg-white py-2 pl-3 pr-10 placeholder-text-3 shadow-sm sm:text-sm"
        @change="query = $event.target.value"
        :display-value="(option) => (option as any).title"
        :placeholder="placeholder"
      />
      <ComboboxButton
        class="absolute inset-y-0 left-0 flex min-w-full items-center rounded-r-md px-2"
      >
        <div
          class="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none"
        >
          <LoadingSpinner
            v-if="!optionsReady"
            class="mr-1 border-secondary-1"
          />
          <SelectorIcon
            class="h-5 w-5 text-text-3 hover:text-primary-3"
            aria-hidden="true"
          />
        </div>
      </ComboboxButton>
      <transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-out"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <div v-if="open || showOptions">
          <ComboboxOptions
            static
            v-if="filteredOptions.length > 0"
            class="vx-paragraph absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-text-1 ring-opacity-5 focus:outline-none"
          >
            <ComboboxOption
              v-for="option in filteredOptions"
              :key="option.title"
              :value="option"
              as="template"
              v-slot="{ active, selected }"
            >
              <li
                :class="[
                  'relative cursor-pointer select-none py-2 pl-3 pr-9',
                  selected
                    ? 'bg-selection'
                    : active
                    ? 'bg-selection text-text-1'
                    : 'text-text-2',
                ]"
              >
                <div class="flex items-center">
                  <img
                    :src="option.imageURL"
                    alt=""
                    class="h-6 w-6 flex-shrink-0 rounded-full"
                  />
                  <span :class="['ml-3 truncate', selected && 'font-semibold']">
                    {{ option.title }}
                  </span>
                  <span
                    :class="[
                      'ml-2 truncate text-text-3',
                      active ? 'text-text-3' : 'text-text-3',
                    ]"
                  >
                    {{ option.subtitle }}
                  </span>
                </div>

                <span
                  v-if="selected"
                  :class="[
                    'absolute inset-y-0 right-0 flex items-center pr-4',
                    active ? 'text-text-3' : 'text-text-3',
                  ]"
                >
                  <CheckIcon class="h-5 w-5" aria-hidden="true" />
                </span>
              </li>
            </ComboboxOption>

            <!-- Load More Button -->
            <div
              v-if="foundOptions.length > optionsLimit"
              class="vx-paragraph-sb p-2 text-center text-text-3 hover:bg-selection hover:text-text-2"
            >
              <button @click.prevent="loadMoreOptions()">Load More</button>
            </div>
          </ComboboxOptions>
        </div>
      </transition>
    </div>
  </Combobox>
</template>
