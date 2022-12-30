<script setup lang="ts">
import { useRouter } from "vue-router";
import { useCoreStore } from "../stores/core";
import ButtonCTA from "../components/ButtonCTA.vue";

const router = useRouter();
const coreStore = useCoreStore();
</script>

<template>
  <!-- CONTAINERS -->
  <div class="vx-core-top">
    <div>
      <div class="vx-core">
        <!-- LOGO -->
        <div>
          <img class="h-16" :src="coreStore.logoLightPath" alt="Vealth Logo" />
        </div>
        <!-- TITLE -->
        <div class="mb-5 text-center">
          <h1 class="vx-header">404</h1>
        </div>
        <!-- TEXT -->
        <div>
          <p class="vx-cta">
            We can't find the page you're looking for. You can go back or try
            our home page.
          </p>
          <div class="mt-10 text-center">
            <ButtonCTA :click-action="() => router.push('/')"
              >Vealth Home</ButtonCTA
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vx-core-top {
  @apply flex flex-col justify-center sm:min-h-screen;
}

.vx-core {
  @apply m-auto bg-white p-10 shadow-lg sm:max-w-lg sm:rounded-4xl sm:px-16 sm:py-16;
}

img {
  @apply mx-auto mb-10;
}
</style>
