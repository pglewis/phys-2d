import {System} from 'p2d/src/ecs/systems/system';
import {CircleGeometry} from 'p2d/src/geometry/circle-geometry';
import {Vec2} from 'p2d/src/vec2';
import {Shape} from 'p2d/src/ecs/components/shape';
import {Rigidbody} from 'p2d/src/ecs/components/rigidbody';
import {Transform} from 'p2d/src/ecs/components/transform';
import {EdgeGeometry} from 'p2d/src/geometry/edge-geometry';
import {PathGeometry} from 'p2d/src/geometry/path-geometry';
import {PolygonGeometry} from 'p2d/src/geometry/polygon-geometry';
import {defineQuery} from 'bitecs';

export class CollisionSystem implements System {

	update(world: object): void {
		const entities = defineQuery([Transform, Rigidbody, Shape])(world);

		for (let i = 0; i < entities.length - 1; i++) {
			const entityA = entities[i];

			for (let j = i + 1; j < entities.length; j++) {
				const entityB = entities[j];

				// Two static bodies aren't going to collide
				if (Rigidbody.isKinematic[entityA] && Rigidbody.isKinematic[entityB]) {
					continue;
				}

				if (!Rigidbody.isKinematic[entityA] && !Rigidbody.isKinematic[entityB]) {
					// Two dynamic bodies
					this.circleCircleCollision(entityA, entityB);
				} else if (Rigidbody.isKinematic[entityA]) {
					// Entity A is static
					this.handleStaticCollision(entityB, entityA);
				} else {
					// Entity B is static
					this.handleStaticCollision(entityA, entityB);
				}
			}
		}
	}

	private circleCircleCollision(entityA: number, entityB: number) {
		// currently only support collisions for a pair of circles
		if (!(Shape.geometry[entityA] instanceof CircleGeometry) || !(Shape.geometry[entityB] instanceof CircleGeometry)) {
			return;
		}

		const dir = Vec2.subtract(Transform.position[entityB], Transform.position[entityA]);
		const centerDist = dir.length;

		// Early exit if no collision
		if (centerDist === 0 || centerDist > Shape.geometry[entityA].radius + Shape.geometry[entityB].radius) {
			return;
		}

		dir.normalize();

		// Position correction
		const overlap = Shape.geometry[entityA].radius + Shape.geometry[entityB].radius - centerDist;

		// Velocity correction
		const v1 = Rigidbody.velocity[entityA].dot(dir);
		const v2 = Rigidbody.velocity[entityB].dot(dir);

		const restitution = Math.min(Rigidbody.restitution[entityA], Rigidbody.restitution[entityB]);

		// body2 may be static
		if (Rigidbody.isKinematic[entityB]) {
			// Update the dynamic body's position
			Transform.position[entityA].add(dir, -overlap);

			// Update the dynamic body's velocity
			const energyTransfer = v1 * restitution;           // Energy transferred back
			const totalEnergyChange = v1 + energyTransfer;     // Total energy change
			Rigidbody.velocity[entityA].add(dir, -totalEnergyChange); // Negative because it's opposing motion

			// Static bodies don't budge, we're done here
			return;
		}

		// Dynamic collision: move both bodies
		Transform.position[entityA].add(dir, -overlap / 2);
		Transform.position[entityB].add(dir, overlap / 2);

		// Dynamic collision: update both velocities
		// m1 * v1 + m2 * v2 = m1 * v1' + m2 * v2'
		const m1 = Rigidbody.mass[entityA];
		const m2 = Rigidbody.mass[entityB];
		const newV1 = (m1 * v1 + m2 * v2 - m2 * (v1 - v2) * restitution) / (m1 + m2);
		const newV2 = (m1 * v1 + m2 * v2 - m1 * (v2 - v1) * restitution) / (m1 + m2);

		Rigidbody.velocity[entityA].add(dir, newV1 - v1);
		Rigidbody.velocity[entityB].add(dir, newV2 - v2);
	}

	private handleStaticCollision(entityA: number, entityB: number): void {
		// Only handle circle vs. static shapes for now
		if (!(Shape.geometry[entityA] instanceof CircleGeometry)) {
			return;
		}

		switch (true) {
			case (Shape.geometry[entityB] instanceof CircleGeometry): {
				this.circleCircleCollision(entityA, entityB);
				break;
			}
			case (Shape.geometry[entityB] instanceof EdgeGeometry): {
				this.handleCircleLineSegmentCollision(
					entityA,
					{p1: Shape.geometry[entityB].p1, p2: Shape.geometry[entityB].p2}
				);
				break;
			}
			case (Shape.geometry[entityB] instanceof PathGeometry): {
				if (Shape.geometry[entityB].verticies.length >= 2) {
					const points = Shape.geometry[entityB].verticies;
					for (let k = 0; k < points.length - 1; k++) {
						const segment = {p1: points[k], p2: points[k + 1]};
						this.handleCircleLineSegmentCollision(entityA, segment);
					}
					if (points.length > 2) {
						const lastSegment = {p1: points[points.length - 1], p2: points[0]};
						this.handleCircleLineSegmentCollision(entityA, lastSegment);
					}
				}
				break;
			}
			case (Shape.geometry[entityB] instanceof PolygonGeometry): {
				if (Shape.geometry[entityB].verticies.length >= 2) {
					const vertices = Shape.geometry[entityB].verticies;
					for (let k = 0; k < vertices.length; k++) {
						const p1 = vertices[k];
						const p2 = vertices[(k + 1) % vertices.length];
						this.handleCircleLineSegmentCollision(entityA, {p1, p2});
					}
				}
				break;
			}
		}
	}

	private handleCircleLineSegmentCollision(entityA: number, lineSegment: {p1: Vec2, p2: Vec2}): void {
		const circleRad = (Shape.geometry[entityA] as CircleGeometry).radius;
		const c = this.closestPointOnSegment(Transform.position[entityA], lineSegment.p1, lineSegment.p2);
		const dir = Vec2.subtract(Transform.position[entityA], c);
		const distance = dir.length;

		if (distance === 0 || distance > circleRad) {
			return; // No collision
		}

		dir.normalize();
		const overlap = circleRad - distance;
		Transform.position[entityA].add(dir, overlap);

		const normalVelocity = Rigidbody.velocity[entityA].dot(dir);
		const energyTransfer = normalVelocity * Rigidbody.restitution[entityA];
		const totalEnergyChange = normalVelocity + energyTransfer;

		Rigidbody.velocity[entityA].add(dir, -totalEnergyChange);;
	}

	private closestPointOnSegment(p: Vec2, a: Vec2, b: Vec2) {
		const {min, max} = Math;
		const ab = Vec2.subtract(b, a);
		const abLenSquared = ab.dot(ab);

		if (abLenSquared === 0) {
			return a.clone();
		}

		// t = (p - a)⋅(b - a) / (b - a)⋅(b - a)
		// t = (p - a)⋅ab / ab⋅ab
		// t = p⋅ab - a⋅ab / ab⋅ab
		const t = max(0, min(1, (p.dot(ab) - a.dot(ab)) / abLenSquared));

		// c = a + t(ab)
		return Vec2.add(a, Vec2.scale(ab, t));
	}
}
