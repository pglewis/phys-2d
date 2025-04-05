export type CanvasProps = {
    parent?: HTMLElement;
    width?: number;
    height?: number;
};
export declare class Canvas {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    width: number;
    height: number;
    constructor(props?: CanvasProps);
    clear(): void;
    drawCircle(pos: {
        x: number;
        y: number;
    }, radius: number, filled: boolean): void;
    drawGround(): void;
    drawBob(): void;
    drawBasket(): void;
}
