export type CanvasProps = {
    parent?: HTMLElement;
    width?: number;
    height?: number;
};
export type CircleProps = {
    position: {
        x: number;
        y: number;
    };
    radius: number;
    filled?: boolean;
    color?: string | CanvasGradient | CanvasPattern;
};
export declare class Canvas {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    width: number;
    height: number;
    constructor(props?: CanvasProps);
    clear(): void;
    drawCircle(props: CircleProps): void;
    drawGround(): void;
    drawBob(): void;
    drawBasket(): void;
}
