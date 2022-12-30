<script setup lang="ts">
import { DBUserConnection } from "../vealthAPI/types";

defineProps<{
  userConnection: DBUserConnection;
}>();

const emit = defineEmits(["editConnection"]);

function shortenAddress(address: string, first: number, last: number) {
  let firstDigits = address.substring(0, first);
  let lastDigits = address.substring(
    address.length - last - 1,
    address.length - 1
  );
  return firstDigits + "..." + lastDigits;
}
</script>

<template>
  <div
    :class="`vx-mask rounded-2xl shadow-lg transition-all hover:-mt-1 hover:cursor-pointer hover:shadow-xl ${userConnection.connection.bgColorHex}`"
    @click.prevent="emit('editConnection', userConnection)"
  >
    <div class="p-6 text-white">
      <div class="flex items-start justify-between">
        <div>
          <div class="h-8 w-8 flex-shrink-0">
            <img
              class="h-8 w-8 rounded-full"
              :src="userConnection.connection.logoURL"
              alt="Asset Logo"
            />
          </div>
          <div class="mt-2">
            <p class="vx-cta-big-sb">{{ userConnection.name }}</p>
            <p class="vx-paragraph text-opacity-70">
              {{ userConnection.connection.connectionName }}
            </p>
          </div>
        </div>
      </div>
      <div class="mt-5">
        <p class="vx-paragraph-sm text-right">
          {{ shortenAddress(userConnection.publicKey, 6, 4) }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vx-mask {
  background-image: url("../assets/connectionCardMask.png");
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
}
</style>
