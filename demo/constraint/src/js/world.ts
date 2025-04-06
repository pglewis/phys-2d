import {Vec2} from 'p2d-vec2';
import {Bead} from './bead';
import {Wire} from './wire';

export class World {
	gravity: Vec2;
	wire: Wire;
	bead: Bead;

	constructor(gravity: Vec2, bead: Bead, wire: Wire) {
		this.gravity = gravity;
		this.wire = wire;
		this.bead = bead;
	}

	step(tDelta: number): void {
		const {bead} = this;
		const prevPosition = bead.position.clone();

		bead.velocity.add(this.gravity, tDelta); // vf = vi + gt
		bead.position.add(bead.velocity, tDelta); // d = vt

		// solve the constraint
		this.solve();

		// Fix-up the velocity after solving the constraint or gravity will accumulate
		// v = (xf - xi) / t
		const tInverse = tDelta === 0 ? 0 : 1 / tDelta;
		bead.velocity = Vec2.subtract(bead.position, prevPosition).scale(tInverse);
	}

	/**
	 * If the bead is not on the wire put it on the wire at the closest point
	 */
	solve() {
		const {wire, bead} = this;

		// Vector from the center of the wire to the bead
		const dir = Vec2.subtract(bead.position, wire.position);

		// The distance from the center of the wire to the bead
		const len = dir.length;
		if (len === 0) {
			return;
		}

		// Normalize the vector pointing from the center of the wire to the bead
		dir.normalize();

		// The constraint error is the radius of the wire minus the distance from
		// the center of the wire to the center of the bead
		const lambda = wire.radius - len;

		// We know which way and how far to move
		bead.position.add(dir, lambda);
	}
}
