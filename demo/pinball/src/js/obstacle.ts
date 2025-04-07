import {Vec2} from 'p2d-vec2';

export class Obstacle {
	radius: number;
	position: Vec2;
	pushVel: number;

	constructor(radius: number, position: Vec2, pushVel: number) {
		this.radius = radius;
		this.position = position.clone();
		this.pushVel = pushVel;
	}
}
