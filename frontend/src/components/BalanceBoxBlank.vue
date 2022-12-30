<template>
  <dl class="vx-bg animate-pulse overflow-hidden rounded-3xl shadow-lg">
    <div
      class="bg-gradient-to-br from-secondary-1 via-transparent to-transparent"
    >
      <div class="px-4 py-5 sm:p-6">
        <dt class="vx-cta text-white text-opacity-60">Current Balance</dt>
        <dd class="flex">
          <div class="vx-balance-big-sb flex items-baseline text-white">
            <div class="h-2 rounded bg-slate-200"></div>
          </div>
          <div class="my-5 min-w-full"></div>
        </dd>
      </div>
    </div>
  </dl>
</template>

<style scoped>
.vx-bg {
  background-image: url("../assets/balanceBoxBg.png");
  background-size: cover;
}
</style>
