import {Vec2} from 'p2d/src/vec2';
import {System} from 'p2d/src/ecs/systems/system';
import {defineQuery} from 'bitecs';
import {Transform} from 'p2d/src/ecs/components/transform';
import {Rigidbody} from 'p2d/src/ecs/components/rigidbody';

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

			Transform.rotation[e] += Rigidbody.angularVelocity[e] * deltaTime;
		}
	}
}
