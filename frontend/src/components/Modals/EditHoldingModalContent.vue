<script setup lang="ts">
import { computed, RenderFunction } from "vue";
import ButtonCTA from "../ButtonCTA.vue";
import {
  CashIcon,
  ShoppingBagIcon,
  TrashIcon,
  PencilAltIcon,
} from "@heroicons/vue/solid";
import { ExclamationIcon } from "@heroicons/vue/outline";
import { AdjustmentsIcon, SwitchHorizontalIcon } from "@heroicons/vue/outline";
import { formatToDecimal, formatToUSD } from "../../utils/formatters";
import { DBUserConnection, Holding, Transaction } from "../../vealthAPI/types";
import { VTransactionType } from "../../vealthAPI/enums";
import LoadingSpinner from "../LoadingSpinner.vue";

const props = defineProps<{
  holding: Holding;
  connectionOperationInProgress: boolean;
  transactionOperationInProgress: boolean;
}>();
const emit = defineEmits([
  "closeModal",
  "addTransaction",
  "editTransaction",
  "deleteTransaction",
  "addConnection",
  "editConnection",
  "deleteConnection",
]);
const connectionData = computed(() => props.holding.connections);
const transactionData = computed(() => props.holding.transactions);

interface FormattedTransaction {
  index: number;
  icon: any;
  bgColor: string;
  actionText: string;
  assetText: string;
  priceText: string;
  date: string;
}

const formattedTransactions = computed(() => {
  let i = 0;
  let transactions = [] as FormattedTransaction[];
  for (const transaction of transactionData.value) {
    let formatted: FormattedTransaction = {
      index: i,
      icon:
        transaction.type === VTransactionType.Sell ? CashIcon : ShoppingBagIcon,
      bgColor:
        transaction.type === VTransactionType.Sell
          ? "bg-primary-3"
          : "bg-greenVx",
      actionText: transaction.type === VTransactionType.Buy ? "Bought" : "Sold",
      assetText: `${formatToDecimal(transaction.quantity)} ${
        props.holding.asset.ticker
      }`,
      priceText: formatToUSD(transaction.pricePerLot),
      date: new Date(transaction.timestamp).toLocaleDateString(),
    };
    transactions.push(formatted);
    i++;
  }
  return transactions;
});

// Buttons
function addConnection() {
  emit("addConnection", props.holding.asset);
}

function editConnection(userConnection: DBUserConnection) {
  emit("editConnection", userConnection);
}

function deleteConnection(userConnection: DBUserConnection) {
  emit("deleteConnection", userConnection);
}

function addTransaction() {
  emit("addTransaction", props.holding.asset);
}

function editTransaction(transaction: Transaction) {
  emit("editTransaction", transaction);
}

function deleteTransaction(transaction: Transaction) {
  emit("deleteTransaction", transaction);
}

function cancel() {
  emit("closeModal");
}
</script>

<template>
  <!-- Warning For Holdings in Negative Value -->
  <div
    v-if="holding.quantity < 0"
    class="rounded-lg bg-red-50/40 p-5 sm:flex sm:items-start"
  >
    <div
      class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10"
    >
      <ExclamationIcon class="h-6 w-6 text-red-600" aria-hidden="true" />
    </div>
    <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
      <p class="vx-paragraph">
        The holdings in this asset equal to less than zero. Have you added all
        your "Buy" transactions or connections? Or is a "Sell" transaction
        incorrect?
      </p>
    </div>
  </div>

  <!-- Current Holdings -->
  <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
    <!-- Connections -->
    <div class="mr-4 sm:col-span-3">
      <div class="relative mb-4">
        <div class="absolute inset-0 flex items-center" aria-hidden="true">
          <div class="w-full border-t border-separator" />
        </div>
        <div class="relative flex items-center justify-between">
          <div class="relative flex items-center justify-between">
            <h2 class="vx-title vx-paragraph-sb bg-white pr-3 text-text-2">
              Connections
            </h2>
            <div v-if="connectionOperationInProgress" class="flex">
              <LoadingSpinner class="border-red-600 bg-white" />
              <div class="bg-white p-1" />
            </div>
          </div>
          <button
            v-if="holding.connections?.length > 0"
            type="button"
            class="vx-paragraph-sm inline-flex items-center rounded-full border border-separator bg-white px-3 py-1 leading-5 text-text-3 shadow-sm hover:bg-gray-50"
            @click.prevent="addConnection"
          >
            <p class="text-text-3 hover:text-text-2">Add New</p>
          </button>
        </div>
      </div>
      <div v-if="holding.connections?.length > 0">
        <div class="space-y-5">
          <div
            v-for="holdingCollection in connectionData"
            class="flex justify-between rounded-xl bg-card p-5 shadow"
          >
            <div>
              <div class="items-top flex">
                <div class="h-7 w-7 flex-shrink-0">
                  <img
                    v-if="holdingCollection.userConnection.connection.logoURL"
                    class="h-7 w-7 rounded-full"
                    :src="holdingCollection.userConnection.connection.logoURL"
                    alt="Asset Logo"
                  />
                </div>
                <div class="ml-3">
                  <div class="vx-paragraph-sb text-text-1">
                    {{ holdingCollection.userConnection.name }}
                  </div>
                  <div class="vx-paragraph text-text-2">
                    {{ holdingCollection.userConnection.connection.type }}
                  </div>
                  <div class="vx-paragraph-sm mt-2">
                    Holding:
                    <span>
                      {{ formatToDecimal(holdingCollection.quantity) }}
                      {{ holding.asset.ticker }}</span
                    >
                  </div>
                </div>
              </div>
            </div>
            <div class="space-x-2">
              <ButtonCTA
                :class="[
                  'vx-button vx-edit-button',
                  connectionOperationInProgress
                    ? 'hover:cursor-not-allowed'
                    : '',
                ]"
                :click-action="editConnection"
                :payload="holdingCollection.userConnection"
                :disabled="connectionOperationInProgress"
              >
                <PencilAltIcon class="h-4 w-4"></PencilAltIcon>
              </ButtonCTA>
              <ButtonCTA
                :class="[
                  'vx-button vx-delete-button',
                  connectionOperationInProgress
                    ? 'hover:cursor-not-allowed'
                    : '',
                ]"
                :click-action="deleteConnection"
                :payload="holdingCollection.userConnection"
                :disabled="connectionOperationInProgress"
              >
                <TrashIcon class="h-4 w-4"></TrashIcon>
              </ButtonCTA>
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        <button
          type="button"
          class="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400"
          @click.prevent="addConnection()"
        >
          <AdjustmentsIcon
            class="mx-auto h-12 w-12 text-text-3"
            aria-hidden="true"
          ></AdjustmentsIcon>

          <p class="vx-paragraph mt-2 block text-text-2">Add New Connection</p>
        </button>
      </div>
    </div>

    <!-- Transactions -->
    <div class="sm:col-span-3">
      <div class="relative mb-4">
        <div class="absolute inset-0 flex items-center" aria-hidden="true">
          <div class="w-full border-t border-separator" />
        </div>
        <div class="relative flex items-center justify-between">
          <div class="relative flex items-center justify-between">
            <h2 class="vx-title vx-paragraph-sb bg-white pr-3 text-text-2">
              Transactions
            </h2>
            <div v-if="transactionOperationInProgress" class="flex">
              <LoadingSpinner class="border-red-600 bg-white" />
              <div class="bg-white p-1" />
            </div>
          </div>

          <button
            v-if="holding.transactions?.length > 0"
            type="button"
            class="vx-paragraph-sm inline-flex items-center rounded-full border border-separator bg-white px-3 py-1 leading-5 text-text-3 shadow-sm hover:bg-gray-50"
            @click.prevent="addTransaction"
          >
            <p class="text-text-3 hover:text-text-2">Add New</p>
          </button>
        </div>
      </div>
      <div v-if="holding.transactions?.length > 0" class="flow-root">
        <ul role="list" class="-mb-8">
          <li v-for="(formattedTransaction, tIdx) in formattedTransactions">
            <div class="relative pb-8">
              <span
                v-if="tIdx !== formattedTransactions.length - 1"
                class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                aria-hidden="true"
              />
              <div class="relative flex space-x-3">
                <div>
                  <span
                    :class="[
                      formattedTransaction.bgColor,
                      'flex h-8 w-8 items-center justify-center rounded-full ring-8 ring-white',
                    ]"
                  >
                    <component
                      :is="formattedTransaction.icon"
                      class="h-5 w-5 text-white"
                      aria-hidden="true"
                    />
                  </span>
                </div>
                <div
                  class="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5"
                >
                  <div>
                    <div>
                      <p class="vx-paragraph text-text-2">
                        {{ formattedTransaction.actionText }}
                        <span>{{ formattedTransaction.assetText }}</span> at
                        <span> {{ formattedTransaction.priceText }}</span>
                      </p>
                      <div class="vx-paragraph-sm flex space-x-2 text-text-3">
                        <button
                          :class="[
                            'decoration-primary-3 decoration-1 underline-offset-2 hover:text-text-1 hover:underline',
                            transactionOperationInProgress
                              ? 'hover:cursor-not-allowed'
                              : '',
                          ]"
                          :disabled="transactionOperationInProgress"
                          @click.prevent="
                            editTransaction(
                              holding.transactions[formattedTransaction.index]
                            )
                          "
                        >
                          Edit
                        </button>
                        <button
                          :class="[
                            'text-opacity-70 decoration-secondary-1 decoration-1 underline-offset-2 hover:text-text-1 hover:underline',
                            transactionOperationInProgress
                              ? 'hover:cursor-not-allowed'
                              : '',
                          ]"
                          :disabled="transactionOperationInProgress"
                          @click.prevent="
                            deleteTransaction(
                              holding.transactions[formattedTransaction.index]
                            )
                          "
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                  <div
                    class="whitespace-nowrap text-right text-sm text-gray-500"
                  >
                    <time>{{ formattedTransaction.date }}</time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
      <div v-else>
        <button
          type="button"
          class="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400"
          @click.prevent="addTransaction()"
        >
          <SwitchHorizontalIcon
            class="mx-auto h-12 w-12 text-text-3"
            aria-hidden="true"
          ></SwitchHorizontalIcon>

          <p class="vx-paragraph mt-2 block text-text-2">Add New Transaction</p>
        </button>
      </div>
    </div>
  </div>
  <ButtonCTA
    type="button"
    class="mt-8 inline-flex w-full justify-center border bg-[#fff] shadow-sm hover:bg-[#f9fafb] sm:col-start-2 sm:text-sm"
    :click-action="cancel"
  >
    <p class="text-text-2">Close</p>
  </ButtonCTA>
</template>

<style scoped>
.vx-title {
  @apply text-base text-text-2;
}

.vx-button {
  @apply rounded-lg p-1.5 text-xs opacity-70 shadow hover:opacity-100;
}

.vx-edit-button {
  @apply bg-primary-3 hover:bg-primary-3;
}

.vx-delete-button {
  @apply bg-secondary-1 hover:bg-secondary-1;
}

span {
  @apply font-semibold text-text-2;
}
</style>
