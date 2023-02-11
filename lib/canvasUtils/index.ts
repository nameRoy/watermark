import type { Config } from "../watermark/type";
type TextOptions = Pick<Required<Config>, "width" | "height" | "rotateDeg" | "fontStyle"> & { color: string }
export default class CanvasUtils {
    canvas: HTMLCanvasElement;
    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas
    };
    drawText(text: string, options: TextOptions) {
        const canvas = this.canvas;
        canvas.width = options.width * 2;
        canvas.height = options.height * 2;
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        ctx.fillStyle = options.color;
        ctx.font = options.fontStyle;
        ctx.textAlign = 'center';
        const wordLen = ctx.measureText(text).width;
        ctx.save()
        ctx.rotate(options.rotateDeg);
        ctx.fillText(text, options.width + wordLen / 2, options.height / 2);
        ctx.restore()
        ctx.rotate(options.rotateDeg);
        ctx.fillText(text, wordLen / 2, options.height * 1.5);
        return this.genDataUrl();
    };
    drawImage(image: HTMLImageElement, options: { rotateDeg?: number } = {}) {
        const canvas = this.canvas;
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        canvas.width = image.width;
        canvas.height = image.height;
        options.rotateDeg && ctx.rotate(options.rotateDeg);
        ctx.drawImage(image, 0, 20);
        return this.genDataUrl();
    };
    genDataUrl(options = {
        quality: 0.9
    }) {
        return this.canvas.toDataURL("image/png", options.quality);
    };
}