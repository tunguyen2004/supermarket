import { createApp } from "vue";
import { createPinia } from "pinia"; // 1. Import Pinia
import App from "./App.vue";
import router from "./router";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "./style/main.css";
import "./style/tailwind.css";
import "./style/responsive_style.css";

const app = createApp(App);
const pinia = createPinia(); // 2. Tạo một instance của Pinia

app.use(router);
app.use(ElementPlus);
app.use(pinia); // 3. Yêu cầu Vue sử dụng Pinia

app.mount("#app");
