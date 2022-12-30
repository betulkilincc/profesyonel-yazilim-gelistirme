<script setup lang="ts">
import { ref } from "@vue/reactivity";
import { useApiStore } from "./stores/api";

let isTabActive = ref(true);
const apiStore = useApiStore();

window.onfocus = function () {
  isTabActive.value = true;
};

window.onblur = function () {
  isTabActive.value = false;
};

// If tab is inactive for 10 seconds, close websocket
setInterval(handleTabStatus, 10000);

function handleTabStatus() {
  if (!isTabActive.value) apiStore.stopWebsocket();
  else apiStore.startWebsocket();
}
</script>

<template>
  <router-view> </router-view>
</template>

<style>
#app {
  @apply bg-primary-1 sm:min-h-screen;
}
</style>
