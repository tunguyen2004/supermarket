import { createApp } from "vue";
import { createPinia } from "pinia"; // 1. Import Pinia
import App from "./App.vue";
import router from "./router";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "./style/main.css";
import "./style/tailwind.css";
import "./style/responsive_style.css";
import { useAuthStore } from "./store";

// Ignore ResizeObserver loop errors (common with Element Plus components)
window.addEventListener("error", (e) => {
  if (
    e.message.includes("ResizeObserver loop") ||
    e.message.includes(
      "ResizeObserver loop completed with undelivered notifications",
    )
  ) {
    const resizeObserverErrDiv = document.getElementById(
      "webpack-dev-server-client-overlay-div",
    );
    const resizeObserverErr = document.getElementById(
      "webpack-dev-server-client-overlay",
    );
    if (resizeObserverErr)
      resizeObserverErr.setAttribute("style", "display: none");
    if (resizeObserverErrDiv)
      resizeObserverErrDiv.setAttribute("style", "display: none");
    e.stopImmediatePropagation();
    e.preventDefault();
  }
});

const app = createApp(App);
const pinia = createPinia(); // 2. Tạo một instance của Pinia

app.use(pinia); // 3. Yêu cầu Vue sử dụng Pinia (PHẢI dùng trước router)
app.use(router);
app.use(ElementPlus);

// 4. Load user từ localStorage sau khi Pinia đã được khởi tạo
const authStore = useAuthStore();
authStore.loadUserFromStorage();

app.mount("#app");
