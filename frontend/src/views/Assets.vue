<script setup lang="ts">
import BalanceBox from "../components/BalanceBox.vue";
import AssetTable from "../components/AssetTable.vue";
import AssetTableBlank from "../components/AssetTableBlank.vue";
import ButtonCTA from "../components/ButtonCTA.vue";
import { PlusCircleIcon } from "@heroicons/vue/solid";
import AddNewAsset from "../components/AddNewAsset.vue";
import { onMounted, onUnmounted, Ref, ref } from "vue";
import { useUserStore } from "../stores/user";
import ModalWindow from "../components/Modals/ModalWindow.vue";
import EditConnectionModalContent from "../components/Modals/EditConnectionModalContent.vue";
import EditHoldingModalContent from "../components/Modals/EditHoldingModalContent.vue";
import { Asset, DBUserConnection, Transaction } from "../vealthAPI/types";
import { useApiStore } from "../stores/api";
import EditTransactionModalContent from "../components/Modals/EditTransactionModalContent.vue";
import BalanceBoxBlank from "../components/BalanceBoxBlank.vue";

// Stores
const userStore = useUserStore();
const apiStore = useApiStore();

// Add new asset modal
let addNewAssetModalActive = ref(false);
let startInConnectionTab = ref(false);

function addNewAsset() {
  addNewAssetModalActive.value = true;
}

// Edit holding modal
const editHoldingModalActive = ref(false);
const selectedHoldingIndex = ref(-1);

function editHolding(holdingIndex: number) {
  selectedHoldingIndex.value = holdingIndex;
  editHoldingModalActive.value = true;
}

// Edit holding modal inside methods
function addConnection(asset: Asset) {
  startInConnectionTab.value = true;
  addNewAssetModalActive.value = true;
}

const editConnectionModalActive = ref(false);
let selectedUserConnection: Ref<DBUserConnection> = ref({} as DBUserConnection);

function editConnection(userConnection: DBUserConnection) {
  selectedUserConnection.value = userConnection;
  editConnectionModalActive.value = true;
}

let deleteConnectionInProgress = ref(false);

async function deleteConnection(userConnection: DBUserConnection) {
  deleteConnectionInProgress.value = true;
  await apiStore.deleteUserConnection(userConnection.uid);
  await apiStore.fetchHoldings();
  deleteConnectionInProgress.value = false;
}

let selectedAsset: Ref<Asset | undefined> = ref(undefined);

function addTransaction(asset: Asset) {
  startInConnectionTab.value = false;
  selectedAsset.value = asset;

  addNewAssetModalActive.value = true;
}

let editTransactionModalActive = ref(false);
let selectedTransaction: Ref<Transaction> = ref({} as Transaction);
let selectedTransactionAsset: Ref<Asset> = ref({} as Asset);

function editTransaction(transaction: Transaction) {
  selectedTransaction.value = transaction;
  selectedTransactionAsset.value =
    userStore.holdings[selectedHoldingIndex.value].asset;
  editTransactionModalActive.value = true;
}

let deleteTransactionInProgress = ref(false);

async function deleteTransaction(transaction: Transaction) {
  deleteTransactionInProgress.value = true;
  await apiStore.deleteTransaction(transaction.uid);
  await apiStore.fetchHoldings();
  deleteTransactionInProgress.value = false;
}

const areAssetsFetched = ref(false);

onMounted(async () => {
  if (userStore.holdings.length === 0) {
    areAssetsFetched.value = false;
    await apiStore.fetchHoldings();
    areAssetsFetched.value = true;
  } else {
    areAssetsFetched.value = true;
  }

  apiStore.startWebsocket();
});

onUnmounted(() => {
  apiStore.stopWebsocket();
});
</script>

<template>
  <div>
    <!-- Add New Asset Modal Window -->
    <AddNewAsset
      :is-open="addNewAssetModalActive"
      @close-modal="
        addNewAssetModalActive = false;
        startInConnectionTab = false;
        selectedAsset = undefined;
      "
      :start-with-asset-selected="selectedAsset"
      :start-in-connection-tab="startInConnectionTab"
    />

    <!-- Edit Connection Modal Window -->
    <ModalWindow
      :is-open="editConnectionModalActive"
      @close-modal="editConnectionModalActive = false"
      :custom-style="'sm:max-w-lg'"
    >
      <h1 class="vx-header mt-2 mb-5 text-text-1">Edit Connection</h1>
      <EditConnectionModalContent
        :user-connection="selectedUserConnection"
        @close-modal="editConnectionModalActive = false"
      />
    </ModalWindow>

    <!-- Edit Transaction Modal Window -->
    <ModalWindow
      :is-open="editTransactionModalActive"
      @close-modal="editTransactionModalActive = false"
      :custom-style="'sm:max-w-lg'"
    >
      <h1 class="vx-header mt-2 mb-5 text-text-1">Edit Transaction</h1>
      <EditTransactionModalContent
        :asset="selectedTransactionAsset"
        :transaction="selectedTransaction"
        @close-modal="editTransactionModalActive = false"
      />
    </ModalWindow>

    <!-- Edit Holding Modal Window -->
    <ModalWindow
      :is-open="editHoldingModalActive"
      @close-modal="editHoldingModalActive = false"
      :custom-style="'sm:max-w-3xl'"
    >
      <h1 class="vx-header mt-2 mb-5 text-text-1">Edit Holding</h1>
      <EditHoldingModalContent
        :holding="userStore.holdings[selectedHoldingIndex]"
        :connection-operation-in-progress="deleteConnectionInProgress"
        :transaction-operation-in-progress="deleteTransactionInProgress"
        @close-modal="editHoldingModalActive = false"
        @add-connection="addConnection"
        @edit-connection="editConnection"
        @delete-connection="deleteConnection"
        @add-transaction="addTransaction"
        @edit-transaction="editTransaction"
        @delete-transaction="deleteTransaction"
      />
    </ModalWindow>

    <!-- Balance Box -->
    <BalanceBox
      v-if="areAssetsFetched"
      :balance="userStore.totalBalance"
      :previous-balance="userStore.previousTotalBalance"
      class="mt-5 h-auto md:w-[20rem] lg:mt-1 lg:w-[22rem]"
    />
    <BalanceBoxBlank
      v-else
      class="mt-5 h-auto md:w-[20rem] lg:mt-1 lg:w-[22rem]"
    />

    <!-- Add New Button -->
    <div class="mt-4 flex justify-end md:mt-0">
      <ButtonCTA :icon="PlusCircleIcon" :click-action="addNewAsset">
        Add New
      </ButtonCTA>
    </div>

    <!-- Asset List -->
    <AssetTable
      v-if="areAssetsFetched"
      :holding-data="
        userStore.holdings.filter((holding) => holding.quantity > 0)
      "
      @add-asset="addNewAsset"
      @edit-holding="editHolding"
      @sort-holdings="userStore.sortHoldings"
      class="my-5"
    />
    <AssetTableBlank v-else class="my-5" />
  </div>
</template>

<style scoped></style>
