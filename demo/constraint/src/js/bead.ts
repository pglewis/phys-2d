import {Vec2} from 'p2d-vec2';

export class Bead {
	position: Vec2;
	velocity: Vec2;
	radius: number;

	constructor(position: Vec2, radius: number, velocity: Vec2) {
		this.velocity = velocity;
		this.position = position;
		this.radius = radius;
	}
}
