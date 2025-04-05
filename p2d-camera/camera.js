export class Camera {
    initialState;
    position;
    scale;
    constructor(initialState) {
        this.initialState = initialState;
        this.reset();
    }
    reset() {
        const { position, scale = 1, } = this.initialState;
        this.position = position;
        this.scale = scale;
    }
}
