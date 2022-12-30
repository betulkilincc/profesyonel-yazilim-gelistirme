import { defineStore } from "pinia";
import { Status } from "../base/enums";

export const useCoreStore = defineStore("core", {
  state: () => ({
    status: Status.Development,
    logoLightPath: "/logoFull.svg",
    logoDarkPath: "/logoFullWhite.svg",
    logoIconOnlyPath: "/logo.svg",
  }),
  getters: {},
  actions: {},
});
