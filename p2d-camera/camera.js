import { Vec2 } from 'p2d-vec2';
export class Camera {
    initialState;
    position;
    scale;
    constructor(initialState) {
        this.initialState = initialState;
        this.reset();
    }
    transform(v) {
        // Scaled by -1 because world objects move opposite the camera's movement
        return Vec2.add(v, Vec2.scale(this.position, -1), this.scale);
    }
    reset() {
        const { position, scale = 1, } = this.initialState;
        this.position = position;
        this.scale = scale;
    }
}
