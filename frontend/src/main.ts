// App and plugins
import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";
import { router } from "./router/index";

const app = createApp(App);
app.use(createPinia()).use(router).mount("#app");

// Global styles
import "./styles/globals.css";
import "./styles/textStyles.css";

// PWA
import { registerSW } from "virtual:pwa-register";

const intervalMS = 60 * 60 * 1000;
const updateSW = registerSW({
  onRegistered(r: any) {
    r &&
      setInterval(() => {
        r.update();
      }, intervalMS);
  },
});
