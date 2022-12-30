<script setup lang="ts">
import { ref } from "vue";
import { formatToUSD } from "../../utils/formatters";
import ButtonCTA from "../ButtonCTA.vue";
import { useApiStore } from "../../stores/api";
import { Asset, Transaction } from "../../vealthAPI/types";
import { VTransactionType } from "../../vealthAPI/enums";

const props = defineProps<{
  asset: Asset;
  transaction: Transaction;
}>();
const emit = defineEmits(["closeModal"]);

const apiStore = useApiStore();
let quantity = ref(props.transaction.quantity);
let price = ref(props.transaction.pricePerLot);
let updateInProgress = ref(false);

// Tab
const tabs = ref([
  {
    name: VTransactionType.Buy,
    current: props.transaction.type === VTransactionType.Buy,
  },
  {
    name: VTransactionType.Sell,
    current: props.transaction.type === VTransactionType.Sell,
  },
]);

function changeTab(tab: any) {
  tabs.value.forEach((t) => {
    t.current = false;
  });
  tab.current = true;
}

// Buttons
async function updateTransaction() {
  updateInProgress.value = true;
  await apiStore.updateTransaction(
    props.transaction.uid,
    tabs.value[0].current ? VTransactionType.Buy : VTransactionType.Sell,
    quantity.value,
    price.value
  );
  await apiStore.fetchHoldings();
  updateInProgress.value = false;
  emit("closeModal");
}

function cancel() {
  emit("closeModal");
}
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
    <!-- Asset Info -->
    <div
      class="vx-paragraph w-full rounded-md border border-separator bg-white py-2 pl-3 pr-10 placeholder-text-3 shadow-sm focus:border-primary-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
    >
      <div class="flex items-center">
        <img
          :src="asset.logoURL"
          alt=""
          class="h-6 w-6 flex-shrink-0 rounded-full"
        />
        <span :class="['ml-3 truncate', 'font-semibold']">
          {{ asset.name }}
        </span>
        <span :class="['ml-2 truncate text-text-3']">
          {{ asset.ticker }}
        </span>
      </div>
    </div>
    <!-- Quantity & Price Form -->
    <div>
      <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div class="sm:col-span-3">
          <div>
            <label for="price" class="vx-paragraph-sb block text-text-2"
              >Quantity</label
            >
            <div class="vx-paragraph relative mt-1 rounded-md">
              <input
                v-model="quantity"
                type="number"
                name="price"
                class="block w-full rounded-md border-separator pl-3 pr-12 placeholder-text-3 shadow-sm focus:border-primary-3 sm:text-sm"
                placeholder="0.00"
                aria-describedby="price-currency"
              />
              <div
                class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"
              >
                <span class="text-text-3 sm:text-sm" id="quantity">
                  {{ asset.ticker }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="sm:col-span-3">
          <div>
            <label for="price" class="vx-paragraph-sb block text-text-2"
              >Price Per Coin</label
            >
            <div class="vx-paragraph relative mt-1 rounded-md">
              <div
                class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
              >
                <span class="text-text-3 sm:text-sm"> $ </span>
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
            {{ formatToUSD(price * quantity) }}
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
        :click-action="updateTransaction"
        :loading="updateInProgress"
      >
        <p>Update Transaction</p>
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
