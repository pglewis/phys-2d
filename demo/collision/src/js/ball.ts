import {Vec2} from 'p2d/src/vec2';

export type BallProps = {
	radius: number
	mass: number
	position: Vec2
	velocity: Vec2
}

export class Ball {
	radius: number;
	mass: number;
	position: Vec2;
	velocity: Vec2;

	constructor(props: BallProps) {
		const {
			radius,
			mass,
			position,
			velocity,
		} = props;

		this.radius = radius;
		this.mass = mass;
		this.position = position.clone();
		this.velocity = velocity.clone();
	}

	simulate(tDelta: number, gravity: Vec2) {
		this.velocity.addMult(gravity, tDelta);
		this.position.addMult(this.velocity, tDelta);
	}
}
