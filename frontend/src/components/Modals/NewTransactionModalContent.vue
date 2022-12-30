<script setup lang="ts">
import { onMounted, Ref, ref } from "vue";
import { formatToUSD } from "../../utils/formatters";
import ButtonCTA from "../ButtonCTA.vue";
import SelectSearch from "../SelectSearch.vue";
import { useApiStore } from "../../stores/api";
import { Asset, DBAsset } from "../../vealthAPI/types";
import { VTransactionType } from "../../vealthAPI/enums";
import { AssetToDBAsset } from "../../utils/converters";
import LoadingSpinner from "../LoadingSpinner.vue";

const props = defineProps<{
  startWithAssetSelected?: Asset;
}>();

const emit = defineEmits(["closeModal"]);

const apiStore = useApiStore();
let selectedAsset: Ref<DBAsset | undefined> = ref();
let quantity: Ref<number | undefined> = ref(undefined);
let price: Ref<number | undefined> = ref(undefined);
let addInProgress = ref(false);
let getPriceInProgress = ref(false);

let quantityInputField: Ref<HTMLElement | null> = ref(null);

// Tab
const tabs = ref([
  { name: VTransactionType.Buy, current: true },
  { name: VTransactionType.Sell, current: false },
]);

function changeTab(tab: any) {
  tabs.value.forEach((t) => {
    t.current = false;
  });
  tab.current = true;
}

// Asset search
async function assetSelected(selected: Option) {
  selectedAsset.value = {
    uid: selected.uid ?? "",
    name: selected.title,
    ticker: selected.subtitle ?? "",
    logoURL: selected.imageURL ?? "",
    marketCap: 0,
  };
  price.value = undefined;
  if (quantityInputField.value) quantityInputField.value.focus(); // FIXME: This is somehow overriden but should not be

  getPriceInProgress.value = true;
  let selectedAssetPrice = await apiStore.getAssetPrices([
    selectedAsset.value.uid,
  ]);
  getPriceInProgress.value = false;

  let decimals = selectedAssetPrice[0].price > 1 ? 2 : 4;
  price.value = Number(selectedAssetPrice[0].price.toFixed(decimals));

  if (quantityInputField.value) quantityInputField.value.focus();
}

// Buttons
async function addTransaction() {
  if (!selectedAsset.value || !quantity.value || !price.value) return;

  addInProgress.value = true;
  await apiStore.addTransaction(
    tabs.value.find((f) => f.current === true)?.name as VTransactionType,
    selectedAsset.value!.uid,
    quantity.value,
    price.value
  );
  await apiStore.fetchHoldings();
  addInProgress.value = false;
  emit("closeModal");
}

function cancel() {
  emit("closeModal");
}

let assetOptions: Ref<Option[]> = ref([] as Option[]);
let assetOptionsReady = ref(false);
let startWithOptionSelected: Ref<Option | undefined> = ref(undefined);

interface Option {
  title: string;
  subtitle?: string;
  imageURL?: string;
  uid?: string;
}

onMounted(async () => {
  if (props.startWithAssetSelected) {
    selectedAsset.value = AssetToDBAsset(props.startWithAssetSelected);
    startWithOptionSelected.value = {
      title: props.startWithAssetSelected.name,
      subtitle: props.startWithAssetSelected.ticker,
      imageURL: props.startWithAssetSelected.logoURL,
      uid: props.startWithAssetSelected.uid,
    };
  }

  assetOptionsReady.value = false;
  await apiStore.fetchAllAssets();
  assetOptions.value = apiStore.allAssets.map((c) => ({
    title: c.name,
    subtitle: c.ticker,
    imageURL: c.logoURL,
    uid: c.uid,
    sortWeight: c.marketCap,
  }));
  assetOptionsReady.value = true;
});
</script>

<template>
  <div class="space-y-4">
    <!-- Buy & Sel Tab -->
    <div class="block rounded-md border shadow-sm">
      <nav class="flex" aria-label="Tabs">
        <a
          v-for="tab in tabs"
          :key="tab.name"
          @click.prevent="changeTab(tab)"
          :class="[
            tab.current
              ? 'bg-primary-2 bg-opacity-10 text-primary-2'
              : 'text-text-3 hover:text-text-1',
            'vx-paragraph-sb w-full rounded-sm px-3 py-2.5 text-center text-sm hover:cursor-pointer',
          ]"
          :aria-current="tab.current ? 'page' : undefined"
        >
          {{ tab.name }}
        </a>
      </nav>
    </div>
    <!-- Asset Search -->
    <div>
      <SelectSearch
        :options="assetOptions"
        :options-ready="assetOptionsReady"
        @option-selected="assetSelected"
        :search-text="'Search for an asset'"
        :not-found-text="'No connection found for'"
        :loading-text="'Loading assets...'"
        :start-with-option-selected="startWithOptionSelected"
      />
    </div>
    <!-- Quantity & Price Form -->
    <div>
      <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div class="sm:col-span-3">
          <div>
            <label class="vx-paragraph-sb block text-text-2">Quantity</label>
            <div class="vx-paragraph relative mt-1 rounded-md">
              <input
                v-model="quantity"
                ref="quantityInputField"
                type="number"
                name="quantity"
                class="block w-full rounded-md border-separator pl-3 pr-12 placeholder-text-3 shadow-sm focus:border-primary-3 sm:text-sm"
                placeholder="0.00"
                aria-describedby="price-currency"
              />
              <div
                class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"
              >
                <span class="text-text-3 sm:text-sm" id="quantity">
                  {{ selectedAsset?.ticker }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="sm:col-span-3">
          <div>
            <label class="vx-paragraph-sb block text-text-2"
              >Price Per Coin</label
            >
            <div class="vx-paragraph relative mt-1 rounded-md">
              <div
                class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
              >
                <span class="text-text-3 sm:text-sm"> $ </span
                ><LoadingSpinner
                  v-if="getPriceInProgress"
                  class="ml-2 border-secondary-1"
                />
              </div>
              <input
                v-model="price"
                type="number"
                name="price"
                class="block w-full rounded-md border-separator pl-7 pr-12 placeholder-text-3 shadow-sm focus:border-primary-3 sm:text-sm"
                aria-describedby="price-currency"
              />
              <div
                class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"
              >
                <span class="text-text-3 sm:text-sm" id="price-currency">
                  USD
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Total -->
    <dl class="overflow-hidden rounded-md">
      <div class="bg-gray-100 px-4 py-5 sm:p-6">
        <dt class="vx-cta text-text-2 text-opacity-60">
          {{ tabs[0].current ? "Total Spent" : "Total Received" }}
        </dt>
        <dd class="flex">
          <div class="vx-balance-big-sb flex items-baseline text-text-1">
            {{ price && quantity ? formatToUSD(price * quantity) : 0 }}
          </div>
        </dd>
      </div>
    </dl>
    <!-- Buttons -->
    <div
      class="space-y-3 pt-2 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3 sm:space-y-0"
    >
      <ButtonCTA
        type="button"
        class="inline-flex w-full justify-center shadow-sm sm:col-start-1 sm:text-sm"
        :click-action="addTransaction"
        :loading="addInProgress"
      >
        <p>Add Transaction</p>
      </ButtonCTA>
      <ButtonCTA
        type="button"
        class="inline-flex w-full justify-center border bg-[#fff] shadow-sm hover:bg-[#f9fafb] sm:col-start-2 sm:text-sm"
        :click-action="cancel"
      >
        <p class="text-text-2">Cancel</p>
      </ButtonCTA>
    </div>
  </div>
</template>

<style scoped></style>
