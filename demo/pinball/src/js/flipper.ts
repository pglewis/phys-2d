import {Vec2} from 'p2d-vec2';

export type FlipperProps = {
	radius: number
	position: Vec2
	length: number
	restAngle: number
	maxRotation: number
	angularVelocity: number
	restitution: number
}

export class Flipper {
	radius: number;
	position: Vec2;
	length: number;
	restAngle: number;
	maxRotation: number;
	angularVelocity: number;
	restitution: number; //--!! Currently unused

	sign: number;
	rotation: number;
	currentAngularVelocity: number;
	touchIdentifier: number;

	constructor(initialProps: FlipperProps) {
		const {
			radius,
			position,
			length,
			restAngle,
			maxRotation,
			angularVelocity,
			restitution,
		} = initialProps;

		// fixed
		this.radius = radius;
		this.position = position.clone();
		this.length = length;
		this.restAngle = restAngle;
		this.maxRotation = Math.abs(maxRotation);
		this.sign = Math.sign(maxRotation);
		this.angularVelocity = angularVelocity;
		this.restitution = restitution;

		// changing
		this.rotation = 0.0;
		this.currentAngularVelocity = 0.0;
		this.touchIdentifier = -1;
	}

	simulate(tDelta: number): void {
		const prevRotation = this.rotation;
		const pressed = this.touchIdentifier >= 0;

		if (pressed) {
			this.rotation =
				Math.min(this.rotation + tDelta * this.angularVelocity, this.maxRotation);
		} else {
			this.rotation =
				Math.max(this.rotation - tDelta * this.angularVelocity, 0.0);
		}

		this.currentAngularVelocity = this.sign * (this.rotation - prevRotation) / tDelta;
	}

	select(position: Vec2): boolean {
		const d = Vec2.subtract(this.position, position);

		return d.length < this.length;
	}

	getTip(): Vec2 {
		const angle = this.restAngle + this.sign * this.rotation;
		const dir = new Vec2(Math.cos(angle), Math.sin(angle));
		const tip = this.position.clone();

		return tip.add(dir, this.length);
	}
}