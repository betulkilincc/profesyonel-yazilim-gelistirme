<script setup lang="ts">
import {
  PencilAltIcon,
  ArrowSmUpIcon,
  ArrowSmDownIcon,
  ChevronDownIcon,
} from "@heroicons/vue/outline";
import { PlusSmIcon } from "@heroicons/vue/outline";
import { computed, ComputedRef, ref } from "vue";
import { ChangeType, SortType } from "../base/enums";
import { checkIncreaseType } from "../utils/checkers";
import { formatToDecimal, formatToUSD } from "../utils/formatters";
import { VAssetType } from "../vealthAPI/enums";
import { Asset, Holding } from "../vealthAPI/types";

const props = defineProps<{
  holdingData: Holding[];
}>();

const emit = defineEmits(["sortHoldings", "addAsset", "editHolding"]);

interface FormattedHolding {
  index: number;
  holding: Holding;
  asset: Asset;
  priceChangeType: ChangeType;
  priceChangePercentage24H: string;
  holdingQuantity: string;
  holdingValue: string;
  allocationPercentage: string;
}

const formattedHoldings: ComputedRef<FormattedHolding[]> = computed(() => {
  let holdings = [] as FormattedHolding[];
  let i = 0;
  for (let data of props.holdingData) {
    let holding: FormattedHolding = {
      index: i,
      holding: data,
      asset: {
        uid: data.asset.uid,
        type: VAssetType.Crypto,
        name: data.asset.name,
        ticker: data.asset.ticker,
        logoURL: data.asset.logoURL,
        price: data.asset.price,
        previousPrice: data.asset.previousPrice,
      },
      priceChangeType: checkIncreaseType(
        data.asset.previousPrice,
        data.asset.price
      ),
      priceChangePercentage24H:
        (
          (Math.abs(data.asset.price - data.asset.previousPrice) * 100) /
          data.asset.previousPrice
        )
          .toFixed(2)
          .toString() + "%",
      holdingQuantity: formatToDecimal(data.quantity) + " " + data.asset.ticker,
      holdingValue: formatToUSD(data.value),
      allocationPercentage:
        data.allocationPercentage?.toFixed(
          data.allocationPercentage > 1 ? 2 : 3
        ) + "%",
    };
    holdings.push(holding);
    i++;
  }
  return holdings;
});
</script>

<template>
  <div class="flex flex-col">
    <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
        <div class="overflow-hidden">
          <table class="min-w-full divide-y divide-separator">
            <thead>
              <tr>
                <th scope="col" class="vx-table-header vx-paragraph-sb">
                  <a
                    href="#"
                    class="group inline-flex text-text-3 hover:text-text-2"
                    @click.prevent="emit('sortHoldings', SortType.Name)"
                  >
                    Asset
                    <span
                      class="invisible ml-2 flex-none rounded text-text-3 group-hover:visible group-focus:visible"
                    >
                      <ChevronDownIcon class="h-5 w-5" aria-hidden="true" />
                    </span>
                  </a>
                </th>
                <th scope="col" class="vx-table-header vx-paragraph-sb">
                  <a
                    href="#"
                    class="group inline-flex text-text-3 hover:text-text-2"
                    @click.prevent="emit('sortHoldings', SortType.Price)"
                  >
                    Price
                    <span
                      class="invisible ml-2 flex-none rounded text-text-3 group-hover:visible group-focus:visible"
                    >
                      <ChevronDownIcon class="h-5 w-5" aria-hidden="true" />
                    </span>
                  </a>
                </th>
                <th
                  scope="col"
                  class="vx-table-header vx-paragraph-sb hidden md:table-cell"
                >
                  <a
                    href="#"
                    class="group inline-flex text-text-3 hover:text-text-2"
                    @click.prevent="emit('sortHoldings', SortType.PriceChange)"
                  >
                    24H
                    <span
                      class="invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible"
                    >
                      <ChevronDownIcon
                        class="invisible ml-2 h-5 w-5 flex-none rounded text-gray-400 group-hover:visible group-focus:visible"
                        aria-hidden="true"
                      />
                    </span>
                  </a>
                </th>
                <th scope="col" class="vx-table-header vx-paragraph-sb">
                  <a
                    href="#"
                    class="group inline-flex text-text-3 hover:text-text-2"
                    @click.prevent="emit('sortHoldings', SortType.Holdings)"
                  >
                    Holdings
                    <span
                      class="invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible"
                    >
                      <ChevronDownIcon
                        class="invisible ml-2 h-5 w-5 flex-none rounded text-gray-400 group-hover:visible group-focus:visible"
                        aria-hidden="true"
                      />
                    </span>
                  </a>
                </th>
                <th
                  scope="col"
                  class="vx-table-header vx-paragraph-sb hidden text-text-3 hover:text-text-2 md:table-cell"
                  @click.prevent="emit('sortHoldings', SortType.Allocation)"
                >
                  <a href="#" class="group inline-flex">
                    Allocation
                    <span
                      class="invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible"
                    >
                      <ChevronDownIcon
                        class="invisible ml-2 h-5 w-5 flex-none rounded text-gray-400 group-hover:visible group-focus:visible"
                        aria-hidden="true"
                      />
                    </span>
                  </a>
                </th>
                <th scope="col" class="relative px-6 py-3 lg:px-3 xl:px-6">
                  <span class="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-separator">
              <tr
                v-for="(formattedHolding, id) in formattedHoldings"
                class="hover:bg-selection"
              >
                <td class="vx-table-row">
                  <div class="flex items-center">
                    <div class="h-6 w-6 flex-shrink-0 sm:h-10 sm:w-10">
                      <img
                        class="h-6 w-6 rounded-full sm:h-10 sm:w-10"
                        :src="formattedHolding.asset.logoURL"
                        alt="Asset Logo"
                      />
                    </div>
                    <div class="ml-4">
                      <div class="vx-paragraph-sb text-text-1">
                        {{ formattedHolding.asset.name }}
                      </div>
                      <div class="vx-paragraph text-text-3">
                        {{ formattedHolding.asset.ticker }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="vx-table-row vx-balance-sb text-text-1">
                  {{ formatToUSD(formattedHolding.asset.price) }}
                </td>

                <td class="vx-table-row hidden md:table-cell">
                  <span
                    :class="[
                      formattedHolding.priceChangeType === ChangeType.Increase
                        ? 'bg-green-50 text-greenVx'
                        : formattedHolding.priceChangeType ===
                          ChangeType.Decrease
                        ? 'bg-red-50 text-redVx'
                        : 'bg-gray-50 text-text-3',
                      'vx-paragraph-sm inline-flex rounded-full px-2 leading-5',
                    ]"
                  >
                    <ArrowSmUpIcon
                      v-if="
                        formattedHolding.priceChangeType === ChangeType.Increase
                      "
                      class="-ml-1 h-4 w-4 flex-shrink-0 self-center text-greenVx"
                      aria-hidden="true"
                    />
                    <ArrowSmDownIcon
                      v-if="
                        formattedHolding.priceChangeType === ChangeType.Decrease
                      "
                      class="-ml-1 h-4 w-4 flex-shrink-0 self-center text-redVx"
                      aria-hidden="true"
                    />
                    <span class="sr-only">
                      {{
                        formattedHolding.priceChangeType === ChangeType.Increase
                          ? "Increased"
                          : formattedHolding.priceChangeType ===
                            ChangeType.Decrease
                          ? "Decreased"
                          : "Same"
                      }}
                      by
                    </span>
                    {{ formattedHolding.priceChangePercentage24H }}
                  </span>
                </td>
                <td class="vx-table-row">
                  <div class="vx-balance-sb text-text-1">
                    {{ formattedHolding.holdingValue }}
                  </div>
                  <div class="vx-paragraph text-text-3">
                    {{ formattedHolding.holdingQuantity }}
                  </div>
                </td>
                <td
                  class="vx-table-row vx-paragraph hidden text-text-1 md:table-cell"
                >
                  {{ formattedHolding.allocationPercentage }}
                </td>
                <td class="vx-table-row relative text-right">
                  <button
                    @click.prevent="emit('editHolding', formattedHolding.index)"
                    class="text-text-3 hover:text-text-2"
                  >
                    <span class="relative inline-block">
                      <PencilAltIcon class="h-5 w-5" aria-hidden="true" />
                      <span
                        v-if="holdingData[id].quantity < 0"
                        class="absolute top-0 right-0 block h-1.5 w-1.5 rounded-full bg-red-400 ring-2 ring-white"
                      />
                    </span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div class="relative mb-2">
      <div class="absolute inset-0 flex items-center" aria-hidden="true">
        <div class="w-full border-t border-separator" />
      </div>
      <div class="relative flex justify-center">
        <button
          type="button"
          class="vx-paragraph inline-flex items-center rounded-full border border-separator bg-white px-4 py-1.5 leading-5 text-text-3 shadow-sm hover:bg-gray-50"
          @click.prevent="emit('addAsset')"
        >
          <PlusSmIcon class="-ml-1.5 mr-1 h-5 w-5" aria-hidden="true" />
          <p class="hover:text-text-2">Add New</p>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vx-table-header {
  @apply px-6 py-3 text-left tracking-wider lg:px-3 xl:px-6;
}

.vx-table-row {
  @apply px-6 py-4 lg:px-2 xl:px-6;
}
</style>
