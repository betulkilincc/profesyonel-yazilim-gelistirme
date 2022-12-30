<script setup lang="ts">
import ConnectionCard from "../components/ConnectionCard.vue";
import ConnectionCardBlank from "../components/ConnectionCardBlank.vue";
import AddConnectionCardButton from "../components/AddConnectionButton.vue";
import ModalWindow from "../components/Modals/ModalWindow.vue";
import NewConnectionModalContent from "../components/Modals/NewConnectionModalContent.vue";
import EditConnectionModalContent from "../components/Modals/EditConnectionModalContent.vue";
import { onMounted, Ref, ref } from "vue";
import { useUserStore } from "../stores/user";
import { DBUserConnection } from "../vealthAPI/types";
import { useApiStore } from "../stores/api";

const userStore = useUserStore();
const apiStore = useApiStore();
let selectedUserConnection: Ref<DBUserConnection> = ref({} as DBUserConnection);

const addNewModalActive = ref(false);
const editModalActive = ref(false);
const areConnectionsFetched = ref(false);

function addConnection() {
  addNewModalActive.value = true;
}

function editConnection(userConnection: DBUserConnection) {
  selectedUserConnection.value = userConnection;
  editModalActive.value = true;
}

onMounted(async () => {
  if (userStore.userConnections.length === 0) {
    areConnectionsFetched.value = false;
    await apiStore.fetchUserConnections();
    areConnectionsFetched.value = true;
  } else {
    areConnectionsFetched.value = true;
    await apiStore.fetchUserConnections();
  }
});
</script>

<template>
  <!-- Add New Connection Modal Window -->
  <ModalWindow
    :is-open="addNewModalActive"
    @close-modal="addNewModalActive = false"
    :custom-style="'sm:max-w-lg'"
  >
    <h1 class="vx-header mt-2 mb-5 text-text-1">Add New Connection</h1>
    <NewConnectionModalContent @close-modal="addNewModalActive = false" />
  </ModalWindow>

  <!-- Edit Connection Modal Window -->
  <ModalWindow
    :is-open="editModalActive"
    @close-modal="editModalActive = false"
    :custom-style="'sm:max-w-lg'"
  >
    <h1 class="vx-header mt-2 mb-5 text-text-1">Edit Connection</h1>
    <EditConnectionModalContent
      :user-connection="selectedUserConnection"
      @close-modal="editModalActive = false"
    />
  </ModalWindow>

  <!-- Connection List -->
  <dl
    class="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:mt-0 2xl:grid-cols-4"
  >
    <div>
      <dt><AddConnectionCardButton :click-action="addConnection" /></dt>
    </div>

    <div
      v-if="areConnectionsFetched"
      v-for="userConnection in userStore.userConnections"
    >
      <dt>
        <ConnectionCard
          :user-connection="userConnection"
          @edit-connection="editConnection"
        ></ConnectionCard>
      </dt>
    </div>
    <div v-else>
      <ConnectionCardBlank />
    </div>
  </dl>
</template>

<style></style>
