class CanvasPool {
    canvases: HTMLCanvasElement[]
    constructor() {
        this.canvases = []
    }
    pop() {
        if (this.length === 0) {
            this.canvases.push(document.createElement('canvas'));
        }
        return this.canvases.pop() as HTMLCanvasElement;
    };
    get length() {
        return this.canvases.length;
    };
    release(canvas: HTMLCanvasElement) {
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;
        context.clearRect(0, 0, canvas.width, canvas.height);
        this.canvases.push(canvas);
    };
    clear() {
        this.canvases.length = 0
    };
    get elements() {
        return this.canvases;
    }
}
export default new CanvasPool()