import {Vec2} from 'p2d/src/vec2';

export type CameraState = {
	position: Vec2
	scale: number
}

export class Camera {
	private initialState: CameraState;
	position!: Vec2;
	scale!: number;

	constructor(initialState: CameraState) {
		this.initialState = initialState;
		this.reset();
	}

	transform(v: Vec2): Vec2 {
		// Scaled by -1 because world objects move opposite the camera's movement
		return Vec2.add(v, Vec2.scale(this.position, -1), this.scale);
	}

	reset() {
		const {
			position,
			scale = 1,
		} = this.initialState;

		this.position = position;
		this.scale = scale;
	}
}
