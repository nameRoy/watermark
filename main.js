// @ts-check
import Watermark from "./dist/watermark/index";

new Watermark({
    text: "测试",
    // path: "http://127.0.0.1:5500/logo.png",
    color: "#ccc"
}).mount("#watermark-container")