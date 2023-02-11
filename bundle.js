(function () {
    'use strict';

    class CanvasUtils {
        constructor(canvas) {
            this.canvas = canvas;
        }
        ;
        drawText(text, options) {
            const canvas = this.canvas;
            canvas.width = options.width * 2;
            canvas.height = options.height * 2;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = options.color;
            ctx.font = options.fontStyle;
            ctx.textAlign = 'center';
            const wordLen = ctx.measureText(text).width;
            ctx.save();
            ctx.rotate(options.rotateDeg);
            ctx.fillText(text, options.width + wordLen / 2, options.height / 2);
            ctx.restore();
            ctx.rotate(options.rotateDeg);
            ctx.fillText(text, wordLen / 2, options.height * 1.5);
            return this.genDataUrl();
        }
        ;
        drawImage(image, options = {}) {
            const canvas = this.canvas;
            const ctx = canvas.getContext('2d');
            canvas.width = image.width;
            canvas.height = image.height;
            options.rotateDeg && ctx.rotate(options.rotateDeg);
            ctx.drawImage(image, 0, 20);
            return this.genDataUrl();
        }
        ;
        genDataUrl(options = {
            quality: 0.9
        }) {
            return this.canvas.toDataURL("image/png", options.quality);
        }
        ;
    }

    class CanvasPool {
        constructor() {
            this.canvases = [];
        }
        pop() {
            if (this.length === 0) {
                this.canvases.push(document.createElement('canvas'));
            }
            return this.canvases.pop();
        }
        ;
        get length() {
            return this.canvases.length;
        }
        ;
        release(canvas) {
            const context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);
            this.canvases.push(canvas);
        }
        ;
        clear() {
            this.canvases.length = 0;
        }
        ;
        get elements() {
            return this.canvases;
        }
    }
    var canvasPool = new CanvasPool();

    const WATERMARK_ID = "_watermark-container";
    class Watermark {
        constructor(options) {
            this.config = this.genConfig(options);
        }
        genConfig(options) {
            const res = JSON.parse(JSON.stringify(Watermark.defaultConfig));
            if (typeof options !== "undefined") {
                Object.assign(res, options);
                if (typeof res.color === "function") {
                    res.color = res.color();
                }
            }
            res.rotateDeg = (res.rotateDeg * Math.PI) / 180;
            return res;
        }
        injectWatermark(imgContent) {
            const watermarkContainer = document.createElement("div");
            watermarkContainer.setAttribute("class", WATERMARK_ID);
            this.watermarkContainer = watermarkContainer;
            watermarkContainer.style.position = "fixed";
            watermarkContainer.style.pointerEvents = "none";
            watermarkContainer.style.backgroundRepeat = "repeat";
            watermarkContainer.style.backgroundImage = `url(${imgContent})`;
            watermarkContainer.style.backgroundSize = `${this.config.width}px ${this.config.height}px`;
            document.body.appendChild(watermarkContainer);
            this.registerUpdateFn();
        }
        destroy() {
            canvasPool.release(this.canvas);
            this.canvas = null;
            document.body.removeChild(this.watermarkContainer);
            this.watermarkContainer = null;
            this.resizeObserver.disconnect();
            this.target = null;
            this.mutationObserver.disconnect();
        }
        mount(target) {
            if (typeof target === "string") {
                target = document.querySelector(target) || document.body;
            }
            this.target = target;
            this.canvas = canvasPool.pop();
            if (this.config.path) {
                const img = new Image();
                img.src = this.config.path;
                img.onload = () => {
                    const imgContent = new CanvasUtils(this.canvas).drawImage(img, this.config);
                    this.injectWatermark(imgContent);
                };
                return this;
            }
            if (this.config.text) {
                const imgContent = new CanvasUtils(this.canvas).drawText(this.config.text, this.config);
                this.injectWatermark(imgContent);
                return this;
            }
        }
        registerUpdateFn() {
            function setWatermarkStyle(contentRect, watermarkContainer) {
                const { top, left, width, height } = contentRect;
                watermarkContainer.style.top = `${top}px`;
                watermarkContainer.style.left = `${left}px`;
                watermarkContainer.style.width = `${width}px`;
                watermarkContainer.style.height = `${height}px`;
            }
            this.resizeObserver = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    setWatermarkStyle(entry.contentRect, this.watermarkContainer);
                }
            });
            this.resizeObserver.observe(this.target);
            const parentNode = this.watermarkContainer.parentNode;
            const originWatermarkContainer = this.watermarkContainer.cloneNode(true);
            const watchParentNode = () => {
                this.mutationObserver.observe(parentNode, {
                    attributeFilter: ["class", "style"],
                    attributes: true,
                    childList: true,
                    subtree: true,
                });
            };
            this.mutationObserver = new MutationObserver((mutationsList) => {
                for (let mutation of mutationsList) {
                    if (mutation.type === "childList" && mutation.removedNodes.length) {
                        const className = mutation.removedNodes[0].getAttribute("class");
                        if (className === WATERMARK_ID) {
                            this.watermarkContainer = originWatermarkContainer.cloneNode(true);
                            parentNode.appendChild(this.watermarkContainer);
                            setWatermarkStyle(this.target.getBoundingClientRect(), this.watermarkContainer);
                        }
                    }
                    if (mutation.type === "attributes" &&
                        mutation.target.getAttribute("class") ===
                            WATERMARK_ID) {
                        this.mutationObserver.disconnect();
                        const replaceNode = originWatermarkContainer.cloneNode(true);
                        parentNode.replaceChild(replaceNode, this.watermarkContainer);
                        this.watermarkContainer = replaceNode;
                        setWatermarkStyle(this.target.getBoundingClientRect(), this.watermarkContainer);
                        watchParentNode();
                    }
                }
            });
            watchParentNode();
        }
    }
    Watermark.defaultConfig = {
        text: "默认水印",
        color: "rgba(0,0,0,0.5)",
        fontStyle: "24px PingFang SC, sans-serif",
        width: 340,
        height: 240,
        rotateDeg: -14,
    };

    // @ts-check

    new Watermark({
        text: "测试",
        // path: "http://127.0.0.1:5500/logo.png",
        color: "#ccc"
    }).mount("#watermark-container");

})();
