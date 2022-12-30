<script setup lang="ts">
import { ref } from "vue";
import {
  RadioGroup,
  RadioGroupDescription,
  RadioGroupLabel,
  RadioGroupOption,
  Switch,
  SwitchGroup,
  SwitchLabel,
} from "@headlessui/vue";

const plans = [
  {
    name: "Startup",
    priceMonthly: 29,
    priceYearly: 290,
    limit: "Up to 5 active job postings",
  },
  {
    name: "Business",
    priceMonthly: 99,
    priceYearly: 990,
    limit: "Up to 25 active job postings",
  },
  {
    name: "Enterprise",
    priceMonthly: 249,
    priceYearly: 2490,
    limit: "Unlimited active job postings",
  },
];
const payments = [
  {
    id: 1,
    date: "1/1/2020",
    datetime: "2020-01-01",
    description: "Business Plan - Annual Billing",
    amount: "CA$109.00",
    href: "#",
  },
  // More payments...
];

const selectedPlan = ref(plans[1]);
const annualBillingEnabled = ref(true);
</script>

<template>
  <div class="h-full">
    <main class="mx-auto mb-10 max-w-7xl">
      <!-- Payment details -->
      <div class="space-y-6 sm:px-6 lg:px-0">
        <section aria-labelledby="payment-details-heading">
          <form action="#" method="POST">
            <div class="shadow sm:overflow-hidden sm:rounded-md">
              <div class="bg-white py-6 px-4 sm:p-6">
                <div>
                  <h2
                    id="payment-details-heading"
                    class="text-lg font-medium leading-6 text-text-1"
                  >
                    Payment details
                  </h2>
                  <p class="mt-1 text-sm text-gray-500">
                    Update your billing information. Please note that updating
                    your location could affect your tax rates.
                  </p>
                </div>

                <div class="mt-6 grid grid-cols-4 gap-6">
                  <div class="col-span-4 sm:col-span-2">
                    <label
                      for="first-name"
                      class="block text-sm font-medium text-text-1"
                      >First name</label
                    >
                    <input
                      type="text"
                      name="first-name"
                      id="first-name"
                      autocomplete="cc-given-name"
                      class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm sm:text-sm"
                    />
                  </div>

                  <div class="col-span-4 sm:col-span-2">
                    <label
                      for="last-name"
                      class="block text-sm font-medium text-text-1"
                      >Last name</label
                    >
                    <input
                      type="text"
                      name="last-name"
                      id="last-name"
                      autocomplete="cc-family-name"
                      class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm sm:text-sm"
                    />
                  </div>

                  <div class="col-span-4 sm:col-span-2">
                    <label
                      for="email-address"
                      class="block text-sm font-medium text-text-1"
                      >Email address</label
                    >
                    <input
                      type="text"
                      name="email-address"
                      id="email-address"
                      autocomplete="email"
                      class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm sm:text-sm"
                    />
                  </div>

                  <div class="col-span-4 sm:col-span-1">
                    <label
                      for="expiration-date"
                      class="block text-sm font-medium text-text-1"
                      >Expration date</label
                    >
                    <input
                      type="text"
                      name="expiration-date"
                      id="expiration-date"
                      autocomplete="cc-exp"
                      class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm sm:text-sm"
                      placeholder="MM / YY"
                    />
                  </div>

                  <div class="col-span-4 sm:col-span-1">
                    <label
                      for="security-code"
                      class="flex items-center text-sm font-medium text-text-1"
                    >
                      <span>Security code</span>
                    </label>
                    <input
                      type="text"
                      name="security-code"
                      id="security-code"
                      autocomplete="cc-csc"
                      class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm sm:text-sm"
                    />
                  </div>

                  <div class="col-span-4 sm:col-span-2">
                    <label
                      for="country"
                      class="block text-sm font-medium text-text-1"
                      >Country</label
                    >
                    <select
                      id="country"
                      name="country"
                      autocomplete="country-name"
                      class="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm sm:text-sm"
                    >
                      <option>United States</option>
                      <option>Canada</option>
                      <option>Mexico</option>
                    </select>
                  </div>

                  <div class="col-span-4 sm:col-span-2">
                    <label
                      for="postal-code"
                      class="block text-sm font-medium text-text-1"
                      >ZIP / Postal code</label
                    >
                    <input
                      type="text"
                      name="postal-code"
                      id="postal-code"
                      autocomplete="postal-code"
                      class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm sm:text-sm"
                    />
                  </div>
                </div>
              </div>
              <div class="bg-gray-50 px-4 py-3 text-right sm:px-6">
                <button
                  type="submit"
                  class="inline-flex justify-center rounded-md border border-transparent bg-gray-800 py-2 px-4 text-sm font-medium text-white shadow-sm"
                >
                  Save
                </button>
              </div>
            </div>
          </form>
        </section>

        <!-- Plan -->
        <section aria-labelledby="plan-heading">
          <form action="#" method="POST">
            <div class="shadow sm:overflow-hidden sm:rounded-md">
              <div class="space-y-6 bg-white py-6 px-4 sm:p-6">
                <div>
                  <h2
                    id="plan-heading"
                    class="text-lg font-medium leading-6 text-text-1"
                  >
                    Plan
                  </h2>
                </div>

                <RadioGroup v-model="selectedPlan">
                  <RadioGroupLabel class="sr-only">
                    Pricing plans
                  </RadioGroupLabel>
                  <div class="relative -space-y-px rounded-md bg-white">
                    <RadioGroupOption
                      as="template"
                      v-for="(plan, planIdx) in plans"
                      :key="plan.name"
                      :value="plan"
                      v-slot="{ checked, active }"
                    >
                      <div
                        :class="[
                          planIdx === 0 ? 'rounded-tl-md rounded-tr-md' : '',
                          planIdx === plans.length - 1
                            ? 'rounded-bl-md rounded-br-md'
                            : '',
                          checked
                            ? 'z-10 border-secondary-2 bg-secondary-3'
                            : 'border-gray-200',
                          'relative flex cursor-pointer flex-col border p-4 md:grid md:grid-cols-3 md:pl-4 md:pr-6',
                        ]"
                      >
                        <div class="flex items-center text-sm">
                          <span
                            :class="[
                              checked
                                ? 'border-transparent bg-secondary-1'
                                : 'border-gray-300 bg-white',
                              active ? '' : '',
                              'flex h-4 w-4 items-center justify-center rounded-full border',
                            ]"
                            aria-hidden="true"
                          >
                            <span class="h-1.5 w-1.5 rounded-full bg-white" />
                          </span>
                          <RadioGroupLabel
                            as="span"
                            class="ml-3 font-medium text-text-1"
                            >{{ plan.name }}</RadioGroupLabel
                          >
                        </div>
                        <RadioGroupDescription
                          class="ml-6 pl-1 text-sm md:ml-0 md:pl-0 md:text-center"
                        >
                          <span
                            :class="[
                              checked ? 'text-secondary-1' : 'text-text-1',
                              'font-medium',
                            ]"
                            >${{ plan.priceMonthly }} / mo</span
                          >
                          {{ " " }}
                          <span
                            :class="
                              checked ? 'text-secondary-4' : 'text-gray-500'
                            "
                            >(${{ plan.priceYearly }} / yr)</span
                          >
                        </RadioGroupDescription>
                        <RadioGroupDescription
                          :class="[
                            checked ? 'text-secondary-4' : 'text-gray-500',
                            'ml-6 pl-1 text-sm md:ml-0 md:pl-0 md:text-right',
                          ]"
                          >{{ plan.limit }}</RadioGroupDescription
                        >
                      </div>
                    </RadioGroupOption>
                  </div>
                </RadioGroup>

                <SwitchGroup as="div" class="flex items-center">
                  <Switch
                    v-model="annualBillingEnabled"
                    :class="[
                      annualBillingEnabled ? 'bg-secondary-1' : 'bg-gray-200',
                      'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ',
                    ]"
                  >
                    <span
                      aria-hidden="true"
                      :class="[
                        annualBillingEnabled
                          ? 'translate-x-5'
                          : 'translate-x-0',
                        'inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                      ]"
                    />
                  </Switch>
                  <SwitchLabel as="span" class="ml-3">
                    <span class="text-sm font-medium text-text-1"
                      >Annual billing
                    </span>
                    <span class="text-sm text-gray-500">(Save 10%)</span>
                  </SwitchLabel>
                </SwitchGroup>
              </div>
              <div class="bg-gray-50 px-4 py-3 text-right sm:px-6">
                <button
                  type="submit"
                  class="inline-flex justify-center rounded-md border border-transparent bg-gray-800 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-900"
                >
                  Save
                </button>
              </div>
            </div>
          </form>
        </section>

        <!-- Billing history -->
        <section aria-labelledby="billing-history-heading">
          <div class="bg-white pt-6 shadow sm:overflow-hidden sm:rounded-md">
            <div class="px-4 sm:px-6">
              <h2
                id="billing-history-heading"
                class="text-lg font-medium leading-6 text-text-1"
              >
                Billing history
              </h2>
            </div>
            <div class="mt-6 flex flex-col">
              <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div
                  class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8"
                >
                  <div class="overflow-hidden border-t border-gray-200">
                    <table class="min-w-full divide-y divide-gray-200">
                      <thead class="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                          >
                            Date
                          </th>
                          <th
                            scope="col"
                            class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                          >
                            Description
                          </th>
                          <th
                            scope="col"
                            class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                          >
                            Amount
                          </th>
                          <!--
                              `relative` is added here due to a weird bug in Safari that causes `sr-only` headings to introduce overflow on the body on mobile.
                            -->
                          <th
                            scope="col"
                            class="relative px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                          >
                            <span class="sr-only">View receipt</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-200 bg-white">
                        <tr v-for="payment in payments" :key="payment.id">
                          <td
                            class="whitespace-nowrap px-6 py-4 text-sm font-medium text-text-1"
                          >
                            <time :datetime="payment.datetime">{{
                              payment.date
                            }}</time>
                          </td>
                          <td
                            class="whitespace-nowrap px-6 py-4 text-sm text-gray-500"
                          >
                            {{ payment.description }}
                          </td>
                          <td
                            class="whitespace-nowrap px-6 py-4 text-sm text-gray-500"
                          >
                            {{ payment.amount }}
                          </td>
                          <td
                            class="whitespace-nowrap px-6 py-4 text-right text-sm font-medium"
                          >
                            <a
                              :href="payment.href"
                              class="text-orange-600 hover:text-orange-900"
                              >View receipt</a
                            >
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<style scoped></style>
