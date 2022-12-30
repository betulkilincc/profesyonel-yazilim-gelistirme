<script setup lang="ts">
import { onMounted, Ref, ref } from "vue";
import { useApiStore } from "../../stores/api";
import { DBConnection } from "../../vealthAPI/types";
import ButtonCTA from "../ButtonCTA.vue";
import SelectSearch from "../SelectSearch.vue";
import {
  EyeIcon,
  EyeOffIcon,
  InformationCircleIcon,
} from "@heroicons/vue/outline";

const emit = defineEmits(["closeModal"]);

const apiStore = useApiStore();

let selectedConnection: Ref<DBConnection | undefined> = ref();
let selectedConnectionGeneralDescription = ref("");
let selectedConnectionPublicKeyDescription = ref("");
let selectedConnectionSecretKeyDescription = ref("");
let name = ref("");
let publicKey = ref("");
let secretKey = ref("");
let addInProgress = ref(false);
let error = ref("");
let secretKeyVisible = ref(false);

// Connection search
let connectionOptionsReady = ref(false);

function connectionSelected(selected: any) {
  selectedConnection.value = apiStore.allConnections.find(
    (c) => c.connectionUid === selected.uid
  );

  if (selectedConnection.value) {
    selectedConnectionGeneralDescription.value =
      selectedConnection.value.GeneralDescription;
    selectedConnectionPublicKeyDescription.value =
      selectedConnection.value.PublicKeyDescription;
    selectedConnectionSecretKeyDescription.value =
      selectedConnection.value.PrivateKeyDescription;
  }
}

// Buttons
async function addConnection() {
  addInProgress.value = true;
  try {
    await apiStore.addUserConnection(
      selectedConnection.value?.connectionUid ?? "",
      name.value,
      publicKey.value,
      secretKey.value
    );
    await apiStore.fetchUserConnections();
    addInProgress.value = false;
    emit("closeModal");
  } catch (e: any) {
    error.value = e.message;
    addInProgress.value = false;
  }
}

function cancel() {
  emit("closeModal");
}

onMounted(async () => {
  connectionOptionsReady.value = false;
  await apiStore.fetchAllConnections();
  connectionOptionsReady.value = true;
});
</script>

<template>
  <div class="space-y-5">
    <div>
      <SelectSearch
        :options="
          apiStore.allConnections.map((c) => ({
            title: c.connectionName,
            imageURL: c.logoURL,
            uid: c.connectionUid,
          }))
        "
        :options-ready="connectionOptionsReady"
        @option-selected="connectionSelected"
        :search-text="'Search a connection'"
        :not-found-text="'No connection found for'"
        :loading-text="'Loading connections'"
      />
    </div>
    <div
      v-if="selectedConnectionGeneralDescription"
      class="flex items-center rounded-lg bg-gray-100/50 p-5"
    >
      <div
        class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 sm:mx-0 sm:h-10 sm:w-10"
      >
        <InformationCircleIcon
          class="h-6 w-6 text-gray-600"
          aria-hidden="true"
        />
      </div>
      <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
        <p class="vx-paragraph">
          {{ selectedConnectionGeneralDescription }}
        </p>
      </div>
    </div>

    <div>
      <label class="vx-paragraph-sb block text-text-2">Name (Optional)</label>
      <div class="vx-paragraph relative mt-1 rounded-md">
        <input
          v-model="name"
          type="text"
          name="name"
          class="block w-full rounded-md border-separator pl-3 pr-12 placeholder-text-3 shadow-sm focus:border-primary-3 sm:text-sm"
        />
      </div>
    </div>
    <div>
      <label class="vx-paragraph-sb block text-text-2">Public Key</label>
      <p class="vx-paragraph text-text-2">
        {{ selectedConnection?.PublicKeyDescription }}
      </p>
      <div class="vx-paragraph relative mt-1 rounded-md">
        <input
          v-model="publicKey"
          type="text"
          name="publicKey"
          class="block w-full rounded-md border-separator pl-3 pr-12 placeholder-text-3 shadow-sm focus:border-primary-3 sm:text-sm"
        />
      </div>
    </div>
    <div v-if="selectedConnection?.isSecretKeyRequired">
      <label class="vx-paragraph-sb block text-text-2">Secret Key</label>
      <p class="vx-paragraph text-text-2">
        {{ selectedConnection?.PrivateKeyDescription }}
      </p>
      <div class="vx-paragraph relative mt-1 rounded-md">
        <input
          v-model="secretKey"
          :type="!secretKeyVisible ? 'password' : 'text'"
          name="secretKey"
          class="block w-full rounded-md border-separator pl-3 pr-12 placeholder-text-3 shadow-sm focus:border-primary-3 sm:text-sm"
        />
        <div class="absolute inset-y-0 right-0 flex items-center pr-3">
          <button @click="secretKeyVisible = !secretKeyVisible">
            <component
              :is="secretKeyVisible ? EyeOffIcon : EyeIcon"
              class="h-5 w-5 text-text-2 hover:text-text-1"
            />
          </button>
        </div>
      </div>
    </div>
    <div class="pt-1">
      <p v-if="error" class="vx-paragraph text-secondary-1">{{ error }}</p>
    </div>
    <div
      class="space-y-3 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3 sm:space-y-0"
    >
      <ButtonCTA
        type="button"
        class="inline-flex w-full justify-center shadow-sm sm:col-start-1 sm:text-sm"
        :click-action="addConnection"
        :loading="addInProgress"
      >
        <p>Add Connection</p>
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
