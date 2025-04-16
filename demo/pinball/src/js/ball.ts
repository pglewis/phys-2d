import {Vec2} from 'p2d';

export type BallProps = {
	radius: number
	mass: number
	position: Vec2
	velocity: Vec2
	restitution: number
}

export class Ball {
	radius: number;
	mass: number;
	position: Vec2;
	velocity: Vec2;
	restitution: number;

	constructor(initialProps: BallProps) {
		const {
			radius,
			mass,
			position,
			velocity,
			restitution,
		} = initialProps;

		this.radius = radius;
		this.mass = mass;
		this.restitution = restitution;
		this.position = position.clone();
		this.velocity = velocity.clone();
	}
	simulate(tDelta: number, gravity: Vec2) {
		this.velocity.add(gravity, tDelta);
		this.position.add(this.velocity, tDelta);
	}
}
