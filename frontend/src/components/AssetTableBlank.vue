<script setup lang="ts">
import { PencilAltIcon } from "@heroicons/vue/outline";
</script>

<template>
  <div class="flex animate-pulse flex-col">
    <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
        <div class="overflow-hidden">
          <table class="min-w-full divide-y divide-separator">
            <thead>
              <tr>
                <th scope="col" class="vx-table-header vx-paragraph-sb">
                  <div class="flex">Asset</div>
                </th>
                <th scope="col" class="vx-table-header vx-paragraph-sb">
                  <div class="flex">Price</div>
                </th>
                <th
                  scope="col"
                  class="vx-table-header vx-paragraph-sb hidden md:table-cell"
                >
                  <div class="flex">24H</div>
                </th>
                <th scope="col" class="vx-table-header vx-paragraph-sb">
                  <div class="flex">Holdings</div>
                </th>
                <th
                  scope="col"
                  class="vx-table-header vx-paragraph-sb hidden md:table-cell"
                >
                  <div class="flex">Allocation</div>
                </th>
                <th scope="col" class="relative px-6 py-3 lg:px-3 xl:px-6">
                  <span class="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-separator">
              <tr v-for="i in 5">
                <td class="vx-table-row">
                  <div class="flex items-center">
                    <div class="h-10 w-10 flex-shrink-0">
                      <div class="h-10 w-10 rounded-full bg-slate-200"></div>
                    </div>
                    <div class="ml-4">
                      <div class="h-2 rounded bg-slate-200"></div>
                    </div>
                  </div>
                </td>
                <td class="vx-table-row">
                  <div class="h-2 rounded bg-slate-200"></div>
                </td>
                <td class="vx-table-row hidden md:table-cell">
                  <div class="h-2 rounded bg-slate-200"></div>
                </td>
                <td class="vx-table-row">
                  <div class="h-2 rounded bg-slate-200"></div>
                </td>
                <td class="vx-table-row vx-paragraph hidden md:table-cell">
                  <div class="h-2 rounded bg-slate-200"></div>
                </td>
                <td class="vx-table-row text-right">
                  <button disabled class="text-text-3 hover:text-text-2">
                    <PencilAltIcon class="h-5 w-5" aria-hidden="true" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vx-table-header {
  @apply px-6 py-3 text-left tracking-wider text-text-3 hover:cursor-pointer hover:text-text-2 lg:px-3 xl:px-6;
}

.vx-table-row {
  @apply whitespace-nowrap px-6 py-4 lg:px-2 xl:px-6;
}
</style>
