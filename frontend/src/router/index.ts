import { createRouter, createWebHistory } from "vue-router";
import Settings from "../views/Settings.vue";
import SignIn from "../views/SignIn.vue";
import AppLayout from "../views/AppLayout.vue";
import Assets from "../views/Assets.vue";
import Connections from "../views/Connections.vue";
import NotFound from "../views/NotFound.vue";
import { ref } from "vue";
import {
  ViewGridIcon,
  HashtagIcon,
  AdjustmentsIcon,
} from "@heroicons/vue/outline";
import { Route } from "../base/types";
import { getCurrentUser } from "../firebase/auth";

export const routes: Route[] = [
  {
    path: "/sign-in",
    name: "Sign In",
    isPrimary: false,
    component: SignIn,
  },
  {
    path: "/app",
    name: "App",
    isPrimary: false,
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "assets",
        name: "Assets",
        isPrimary: true,
        component: Assets,
        icon: ViewGridIcon,
        current: ref(true),
      },
      {
        path: "connections",
        name: "Connections",
        isPrimary: true,
        component: Connections,
        icon: AdjustmentsIcon,
        current: ref(false),
      },

      {
        path: "settings",
        name: "Settings",
        isPrimary: false,
        component: Settings,
        icon: HashtagIcon,
        current: ref(false),
      },
    ],
  },
  {
    path: "/404",
    name: "Not Found",
    isPrimary: false,
    component: NotFound,
  },
  {
    path: "/:catchAll(.*)",
    name: "Not Found",
    isPrimary: false,
    component: NotFound,
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  if (to.path === "/") next("/app");
  else if (to.path === "/app") next("/app/assets");
  else {
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
    const isAuthenticated = await getCurrentUser();

    if (requiresAuth && !isAuthenticated) {
      next("/sign-in");
    } else {
      next();
    }
  }
});
