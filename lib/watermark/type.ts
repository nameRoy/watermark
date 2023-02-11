export interface Config {
    text?: string,
    color?: string | (() => string),
    fontStyle?: string,
    path?: string,
    width?: number,
    height?: number,
    rotateDeg?: number
}