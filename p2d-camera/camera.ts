import {Vec2} from 'p2d-vec2';

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

	reset() {
		const {
			position,
			scale = 1,
		} = this.initialState;

		this.position = position;
		this.scale = scale;
	}
}
