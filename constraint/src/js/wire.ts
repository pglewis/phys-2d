import {Vec2} from 'p2d-vec2';

export class Wire {
	position: Vec2;
	radius: number;

	constructor(position: Vec2, radius: number) {
		this.position = position;
		this.radius = radius;
	}
}