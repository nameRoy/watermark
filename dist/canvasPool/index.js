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
export default new CanvasPool();
//# sourceMappingURL=index.js.map