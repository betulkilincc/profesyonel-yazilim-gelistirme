<script setup lang="ts">
import { ref } from "vue";
import ButtonCTA from "../ButtonCTA.vue";
import { TrashIcon } from "@heroicons/vue/solid";
import { EyeIcon, EyeOffIcon } from "@heroicons/vue/outline";
import { DBUserConnection } from "../../vealthAPI/types";
import { useApiStore } from "../../stores/api";
import LoadingSpinner from "../LoadingSpinner.vue";

const props = defineProps<{
  userConnection: DBUserConnection;
}>();
const emit = defineEmits(["closeModal"]);

const apiStore = useApiStore();

let name = ref(props.userConnection.name);
let publicKey = ref(props.userConnection.publicKey);
let secretKey = ref(props.userConnection.secretKey);
let deleteInProgress = ref(false);
let updateInProgress = ref(false);
let error = ref("");
let secretKeyVisible = ref(false);

// Buttons
async function updateConnection() {
  updateInProgress.value = true;
  try {
    await apiStore.updateUserConnection(
      props.userConnection.uid,
      name.value,
      publicKey.value,
      secretKey.value
    );
    await apiStore.fetchUserConnections();
    updateInProgress.value = false;
    emit("closeModal");
  } catch (e: any) {
    error.value = e.message;
    updateInProgress.value = false;
  }
}

async function deleteConnection() {
  deleteInProgress.value = true;
  await apiStore.deleteUserConnection(props.userConnection.uid);
  deleteInProgress.value = false;
  emit("closeModal");
  await apiStore.fetchUserConnections();
}

function cancel() {
  emit("closeModal");
}
</script>

<template>
  <div class="space-y-5">
    <div class="rounded-xl bg-card p-5 shadow">
      <div class="flex justify-between">
        <div class="flex items-center">
          <div class="h-7 w-7 flex-shrink-0">
            <img
              v-if="userConnection.connection.logoURL"
              class="h-7 w-7 rounded-full"
              :src="userConnection.connection.logoURL"
              alt="Asset Logo"
            />
          </div>
          <div class="ml-3">
            <div class="vx-paragraph-sb text-text-1">
              {{ userConnection.name }}
            </div>
            <div class="vx-paragraph text-text-2">
              {{ userConnection.connection.connectionName }}
            </div>
          </div>
        </div>
        <div>
          <ButtonCTA
            class="vx-button"
            :click-action="deleteConnection"
            :disabled="updateInProgress || deleteInProgress"
          >
            <TrashIcon v-if="!deleteInProgress" class="h-4 w-4"></TrashIcon>
            <LoadingSpinner v-else class="h-[15px] w-[15px]" />
          </ButtonCTA>
        </div>
      </div>
      <p class="vx-paragraph pt-5 text-text-2">
        {{ userConnection.connection.GeneralDescription }}
      </p>
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
        {{ userConnection.connection.PublicKeyDescription }}
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
    <div v-if="userConnection.connection.isSecretKeyRequired">
      <label class="vx-paragraph-sb block text-text-2">Secret Key</label>
      <p class="vx-paragraph text-text-2">
        {{ userConnection.connection.PrivateKeyDescription }}
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
        :click-action="updateConnection"
        :loading="updateInProgress"
        :disabled="
          updateInProgress ||
          deleteInProgress ||
          (publicKey === userConnection.publicKey &&
            secretKey === userConnection.secretKey &&
            name === userConnection.name)
        "
      >
        <p>Update Connection</p>
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

<style scoped>
.vx-button {
  @apply rounded-lg p-1.5 shadow;
}
</style>
