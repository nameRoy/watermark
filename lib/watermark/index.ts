import type { Config } from "./type";
import CanvasUtils from "../canvasUtils/index";
import canvasPool from "../canvasPool/index";
const WATERMARK_ID = "_watermark-container";
export default class Watermark {
  static readonly defaultConfig: Config = {
    text: "默认水印",
    color: "rgba(0,0,0,0.5)",
    fontStyle: "24px PingFang SC, sans-serif",
    width: 340,
    height: 240,
    rotateDeg: -14,
  };
  config: Config;
  canvas: HTMLCanvasElement | null;
  watermarkContainer: HTMLDivElement | null;
  resizeObserver: ResizeObserver;
  target: Element;
  mutationObserver: MutationObserver;
  constructor(options?: Config) {
    this.config = this.genConfig(options);
  }
  private genConfig(options?: Config) {
    const res: Config = JSON.parse(JSON.stringify(Watermark.defaultConfig));
    if (typeof options !== "undefined") {
      Object.assign(res, options);
      if (typeof res.color === "function") {
        res.color = res.color();
      }
    }
    res.rotateDeg = (res.rotateDeg * Math.PI) / 180;
    return res;
  }
  injectWatermark(imgContent: string) {
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
  mount(target: string | Element) {
    if (typeof target === "string") {
      target = document.querySelector(target) || document.body;
    }
    this.target = target;
    this.canvas = canvasPool.pop();
    if (this.config.path) {
      const img = new Image();
      img.src = this.config.path;
      img.onload = () => {
        const imgContent = new CanvasUtils(this.canvas).drawImage(
          img,
          // @ts-ignore
          this.config
        );
        this.injectWatermark(imgContent);
      };
      return this;
    }
    if (this.config.text) {
      const imgContent = new CanvasUtils(this.canvas).drawText(
        this.config.text,
        // @ts-ignore
        this.config
      );
      this.injectWatermark(imgContent);
      return this;
    }
  }
  registerUpdateFn() {
    function setWatermarkStyle(
      contentRect: { top: number; left: number; width: number; height: number },
      watermarkContainer: HTMLDivElement
    ) {
      const { top, left, width, height } = contentRect;
      watermarkContainer.style.top = `${top}px`;
      watermarkContainer.style.left = `${left}px`;
      watermarkContainer.style.width = `${width}px`;
      watermarkContainer.style.height = `${height}px`;
    }
    // 以下为需要加水印的元素发生大小变动
    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWatermarkStyle(entry.contentRect, this.watermarkContainer);
      }
    });
    this.resizeObserver.observe(this.target);
    // 以下为防止删除 dom 和修改样式属性
    const parentNode = this.watermarkContainer.parentNode;
    const originWatermarkContainer = this.watermarkContainer.cloneNode(
      true
    ) as HTMLDivElement;
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
          const className = (
            mutation.removedNodes[0] as HTMLElement
          ).getAttribute("class");
          if (className === WATERMARK_ID) {
            this.watermarkContainer = originWatermarkContainer.cloneNode(
              true
            ) as HTMLDivElement;
            parentNode.appendChild(this.watermarkContainer);
            setWatermarkStyle(
              this.target.getBoundingClientRect(),
              this.watermarkContainer
            );
          }
        }
        if (
          mutation.type === "attributes" &&
          (mutation.target as HTMLElement).getAttribute("class") ===
            WATERMARK_ID
        ) {
          this.mutationObserver.disconnect();
          const replaceNode = originWatermarkContainer.cloneNode(
            true
          ) as HTMLDivElement;
          parentNode.replaceChild(replaceNode, this.watermarkContainer);
          this.watermarkContainer = replaceNode;
          setWatermarkStyle(
            this.target.getBoundingClientRect(),
            this.watermarkContainer
          );
          watchParentNode();
        }
      }
    });
    watchParentNode();
  }
}
