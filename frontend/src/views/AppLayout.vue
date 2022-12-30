<script setup lang="ts">
import { computed, ref } from "vue";
import {
  Dialog,
  DialogOverlay,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue";
import { MenuAlt2Icon, XIcon } from "@heroicons/vue/outline";
import { useCoreStore } from "../stores/core";
import { routes as allRoutes } from "../router/index";
import { Route } from "../base/types";
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "../stores/user";
import { useAuthStore } from "../stores/auth";

// Core Variables
const coreStore = useCoreStore();
const userStore = useUserStore();
const authStore = useAuthStore();
const router = useRouter();
const sidebarOpen = ref(false);
const appRoutesParent = computed(() => {
  const route = allRoutes.find((f) => f.name === "App");
  if (route) return route;
  else return {} as Route;
});
const appRoutes = computed(() => {
  const children = appRoutesParent.value.children;
  if (children) return children;
  else return [] as Route[];
});
const currentRoute = computed(() => {
  const route = appRoutes.value.find((f) => f.name === useRoute().name);
  if (route) return route;
  else return {} as Route;
});

// User navigation
interface userNav {
  name: string;
  onClicked: () => void;
}

let userNavigation: userNav[] = [
  { name: "Settings", onClicked: onSettingsClicked },
  { name: "Sign out", onClicked: onSignOutClicked },
];

async function onLogoClicked() {
  await router.push("/app");
}

async function onSettingsClicked() {
  await router.push("/app/settings");
}

async function onSignOutClicked() {
  await authStore.signOut();
  await router.push("/sign-in");
}
</script>

<template>
  <div id="appLayout">
    <!-- Mobile Sidebar -->
    <TransitionRoot as="template" :show="sidebarOpen">
      <Dialog
        as="div"
        class="fixed inset-0 z-40 flex lg:hidden"
        @close="sidebarOpen = false"
      >
        <TransitionChild
          as="template"
          enter="transition-opacity ease-linear duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <DialogOverlay class="fixed inset-0 bg-gray-600 bg-opacity-75" />
        </TransitionChild>
        <TransitionChild
          as="template"
          enter="transition ease-in-out duration-300 transform"
          enter-from="-translate-x-full"
          enter-to="translate-x-0"
          leave="transition ease-in-out duration-300 transform"
          leave-from="translate-x-0"
          leave-to="-translate-x-full"
        >
          <div
            class="relative flex w-full max-w-xs flex-1 flex-col bg-primary-1 pt-5 pb-4"
          >
            <TransitionChild
              as="template"
              enter="ease-in-out duration-300"
              enter-from="opacity-0"
              enter-to="opacity-100"
              leave="ease-in-out duration-300"
              leave-from="opacity-100"
              leave-to="opacity-0"
            >
              <div class="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  class="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  @click="sidebarOpen = false"
                >
                  <span class="sr-only">Close sidebar</span>
                  <XIcon class="h-6 w-6 text-white" aria-hidden="true" />
                </button>
              </div>
            </TransitionChild>
            <div class="flex flex-shrink-0 items-center px-4 py-2">
              <img
                class="h-12 w-auto"
                :src="coreStore.logoDarkPath"
                @click.prevent="onLogoClicked()"
                alt="Vealth Logo"
              />
            </div>
            <div class="mt-5 h-0 flex-1 overflow-y-auto">
              <nav class="space-y-1 px-2">
                <router-link
                  v-for="item in appRoutes.filter((f) => f.isPrimary)"
                  :to="appRoutesParent.path + '/' + item.path"
                  :class="[
                    item.name == currentRoute.name
                      ? 'bg-primary-2 text-white'
                      : 'text-white hover:bg-primary-2',
                    'group flex items-center rounded-md px-2 py-2 text-base font-medium',
                  ]"
                  @click="sidebarOpen = false"
                >
                  <component
                    :is="item.icon"
                    class="mr-4 h-6 w-6 flex-shrink-0 text-gray-200"
                    aria-hidden="true"
                  />
                  {{ item.name }}
                </router-link>
              </nav>
            </div>
          </div>
        </TransitionChild>
        <div class="w-14 flex-shrink-0" aria-hidden="true">
          <!-- Dummy element to force sidebar to shrink to fit close icon -->
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Desktop Sidebar -->
    <div
      class="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col xl:w-96"
    >
      <!-- Sidebar Component -->
      <div class="flex flex-grow flex-col overflow-y-auto bg-primary-1 pt-36">
        <div class="flex flex-shrink-0 items-center px-12">
          <img
            class="w-auto hover:cursor-pointer lg:h-14 xl:h-16"
            :src="coreStore.logoDarkPath"
            @click.prevent="onLogoClicked()"
            alt="Vealth Logo"
          />
        </div>
        <!-- Menu Container -->
        <div class="mt-8 flex flex-1 flex-col">
          <nav class="flex-1 pl-10 pb-4">
            <!-- Menu Items -->
            <div v-for="item in appRoutes.filter((f) => f.isPrimary)">
              <!-- Rounded Corner Top Right -->
              <div
                v-if="item.name == currentRoute.name"
                class="absolute right-0 -mt-[30px]"
              >
                <div class="w-[fit-content] bg-contentVx">
                  <div class="h-[30px] w-10 rounded-br-4xl bg-primary-1"></div>
                </div>
              </div>
              <!-- Single Menu Item -->
              <router-link
                :to="appRoutesParent.path + '/' + item.path"
                :class="[
                  item.name == currentRoute.name
                    ? 'bg-contentVx text-secondary-1 hover:cursor-default'
                    : 'text-white decoration-secondary-1 decoration-1 underline-offset-2 hover:underline lg:decoration-2',
                  'vx-menu group flex items-center rounded-l-4xl py-4 pl-5',
                ]"
              >
                <component
                  :is="item.icon"
                  :class="[
                    item.name == currentRoute.name
                      ? 'text-secondary-1'
                      : 'text-primary-2',
                    'h-6 w-6 flex-shrink-0 md:mr-3 lg:mr-5',
                  ]"
                  aria-hidden="true"
                />{{ item.name }}
              </router-link>
              <!-- Rounded Corner Bottom Right -->
              <div
                v-if="item.name == currentRoute.name"
                class="absolute right-0"
              >
                <div class="w-[fit-content] bg-contentVx">
                  <div class="h-[30px] w-10 rounded-tr-4xl bg-primary-1"></div>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </div>
    <!-- Content Box -->
    <div class="flex flex-1 flex-col sm:min-h-screen lg:pl-72 xl:pl-96">
      <div
        class="flex-grow flex-row bg-contentVx lg:my-8 lg:mr-8 lg:rounded-4xl lg:px-8 lg:pt-10"
      >
        <!-- Top Bar -->
        <div
          class="sticky top-0 z-10 mx-auto flex h-16 max-w-7xl flex-shrink-0 bg-white shadow lg:relative lg:rounded-4xl lg:bg-contentVx lg:shadow-none"
        >
          <!-- Menu Icon Button -->
          <button
            type="button"
            class="border-r border-gray-200 px-4 text-primary-3 lg:hidden"
            @click="sidebarOpen = true"
          >
            <span class="sr-only">Open sidebar</span>
            <MenuAlt2Icon class="h-6 w-6" aria-hidden="true" />
          </button>
          <!-- Header Bar -->
          <div class="flex flex-1 justify-between px-4 sm:px-6">
            <div class="flex items-center">
              <img
                class="h-full w-auto py-3 pr-4 hover:cursor-pointer lg:hidden"
                :src="coreStore.logoIconOnlyPath"
                @click.prevent="onLogoClicked()"
                alt="Vealth Logo"
              />
              <h1 class="vx-header-big text-text-1">
                {{ currentRoute.name }}
              </h1>
            </div>
            <div class="ml-4 flex items-center md:ml-6">
              <!-- Profile Dropdown -->

              <Menu as="div" class="relative ml-3">
                <div class="vx-profile-dashed-border p-0.5">
                  <MenuButton
                    class="flex max-w-xs items-center rounded-full bg-white text-sm hover:bg-gray-200"
                  >
                    <span class="sr-only">Open user menu</span>
                    <img
                      class="h-10 w-10 rounded-full p-1"
                      :src="userStore.userProfilePath"
                      alt="Profile"
                    />
                  </MenuButton>
                </div>
                <transition
                  enter-active-class="transition ease-out duration-100"
                  enter-from-class="transform opacity-0 scale-95"
                  enter-to-class="transform opacity-100 scale-100"
                  leave-active-class="transition ease-in duration-75"
                  leave-from-class="transform opacity-100 scale-100"
                  leave-to-class="transform opacity-0 scale-95"
                >
                  <MenuItems
                    class="absolute right-0 mt-2 w-32 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                  >
                    <MenuItem
                      v-for="item in userNavigation"
                      v-slot="{ active }"
                    >
                      <button
                        :class="[
                          active ? 'bg-selection' : '',
                          'vx-paragraph block w-full px-4 py-2 text-left text-text-2',
                        ]"
                        @click.prevent="item.onClicked()"
                      >
                        {{ item.name }}
                      </button>
                    </MenuItem>
                  </MenuItems>
                </transition>
              </Menu>
            </div>
          </div>
        </div>
        <!-- Content Container -->
        <main>
          <div class="mx-auto max-w-7xl px-4 py-4 sm:px-6 md:px-8">
            <router-view></router-view>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<style>
/* Using https://kovart.github.io/dashed-border-generator/ */
.vx-profile-dashed-border {
  background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='100' ry='100' stroke='%23EC3463' stroke-width='2' stroke-dasharray='50%25%2c 13%25' stroke-dashoffset='86' stroke-linecap='butt'/%3e%3c/svg%3e");
  border-radius: 100px;
}

.vx-profile-dashed-border:hover {
  background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='100' ry='100' stroke='%23EC3463' stroke-width='2' stroke-dasharray='0' stroke-dashoffset='86' stroke-linecap='butt'/%3e%3c/svg%3e");
  border-radius: 100px;
}
</style>
