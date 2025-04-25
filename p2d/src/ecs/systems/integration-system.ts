import {Vec2} from 'p2d/src/vec2';
import {System} from 'p2d/src/ecs/systems/system';
import {defineQuery} from 'bitecs';
import {Transform} from '../components/transform.js';
import {Rigidbody} from '../components/rigidbody.js';

const query = defineQuery([Transform, Rigidbody]);

export class IntegrationSystem implements System {
	constructor(private readonly gravity: Vec2 = new Vec2(0, -9.8)) { }

	update(world: object, deltaTime: number): void {
		const entities = query(world);

		for (const e of entities) {
			if (Rigidbody.isKinematic[e]) continue;

			const velocity = Rigidbody.velocity[e];
			velocity.addMult(this.gravity, deltaTime);
			Transform.position[e].addMult(velocity, deltaTime);
		}
	}
}
