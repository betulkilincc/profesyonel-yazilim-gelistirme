<script setup lang="ts">
	import { ArrowSmDownIcon, ArrowSmUpIcon } from "@heroicons/vue/solid";
	import { computed } from "vue";
	import { ChangeType } from "../base/enums";
	import { checkIncreaseType } from "../utils/checkers";
	import { formatToUSD } from "../utils/formatters";

	const props = defineProps({
		balance: {
			default: 0,
			type: Number,
		},
		previousBalance: {
			default: 0,
			type: Number,
		},
	});

	const formattedData = {
		balance: computed(() => formatToUSD(props.balance)),
		changeType: computed(() => checkIncreaseType(props.previousBalance, props.balance)),
		changePercentage: computed(
			() =>
				((Math.abs(props.balance - props.previousBalance) * 100) / props.previousBalance)
					.toFixed(2)
					.toString() + "%"
		),
		changeAmount: computed(() => formatToUSD(Math.abs(props.balance - props.previousBalance))),
	};
</script>

<template>
	<dl class="vx-bg rounded-3xl overflow-hidden shadow-lg">
		<div class="bg-gradient-to-br from-secondary-1 via-transparent to-transparent">
			<div class="px-4 py-5 sm:p-6">
				<dt class="vx-cta text-white text-opacity-60">Current Balance</dt>
				<dd class="flex">
					<div class="flex items-baseline vx-balance-big-sb text-white">
						{{ formattedData.balance.value }}
					</div>
					<div class="ml-2">
						<div
							:class="[
								formattedData.changeType.value === ChangeType.Increase
									? 'bg-greenVx'
									: formattedData.changeType.value === ChangeType.Decrease
									? 'bg-redVx'
									: 'bg-text-3',
								'inline-flex items-baseline px-2 py-0.5 rounded-full vx-paragraph text-white md:mt-2 lg:mt-0',
							]"
						>
							<ArrowSmUpIcon
								v-if="formattedData.changeType.value === ChangeType.Increase"
								class="-ml-1 flex-shrink-0 self-center h-5 w-5 text-white"
								aria-hidden="true"
							/>
							<ArrowSmDownIcon
								v-if="formattedData.changeType.value === ChangeType.Decrease"
								class="-ml-1 flex-shrink-0 self-center h-5 w-5 text-white"
								aria-hidden="true"
							/>
							<span class="sr-only">
								{{
									formattedData.changeType.value === ChangeType.Increase
										? "Increased"
										: formattedData.changeType.value === ChangeType.Decrease
										? "Decreased"
										: "Same"
								}}
								by
							</span>
							{{ formattedData.changePercentage.value }}
						</div>
						<p class="mt-1 ml-2 vx-paragraph-sm text-white text-opacity-80">
							{{ formattedData.changeType.value === ChangeType.Increase ? "+" : "-"
							}}{{ formattedData.changeAmount.value }}
						</p>
					</div>
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
