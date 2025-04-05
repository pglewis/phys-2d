import { Vec2 } from 'p2d-vec2';
export type CameraState = {
    position: Vec2;
    scale: number;
};
export declare class Camera {
    private initialState;
    position: Vec2;
    scale: number;
    constructor(initialState: CameraState);
    reset(): void;
}
