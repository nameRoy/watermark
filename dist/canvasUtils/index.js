export default class CanvasUtils {
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
//# sourceMappingURL=index.js.map