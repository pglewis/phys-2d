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

const collisionQuery = defineQuery([Transform, Rigidbody, Shape]);

interface CandidatePair {
	entityA: number,
	entityB: number
}

export class CollisionSystem implements System {
	candidatePairs!: CandidatePair[];

	update(world: object): void {
		this.candidatePairs = [];
		const entities = collisionQuery(world);
		this.broadPhase(entities);
		this.narrowPhase();
	}

	private broadPhase(entities: number[]): void {
		const len = entities.length;

		for (let i = 0; i < len - 1; i++) {
			const entityA = entities[i];
			const geoA = Shape.geometry[entityA];
			const posA = Transform.position[entityA];
			const boxA = geoA.getAABB(posA);
			const isKinematicA = Rigidbody.isKinematic[entityA];

			for (let j = i + 1; j < len; j++) {
				const entityB = entities[j];
				const isKinematicB = Rigidbody.isKinematic[entityB];

				// Two static bodies aren't going to collide
				if (isKinematicA && isKinematicB) continue;

				const geoB = Shape.geometry[entityB];
				const posB = Transform.position[entityB];
				const boxB = geoB.getAABB(posB);

				if (
					boxA.min.x < boxB.max.x &&
					boxA.max.x > boxB.min.x &&
					boxA.min.y < boxB.max.y &&
					boxA.max.y > boxB.min.y
				) {
					this.candidatePairs.push({entityA, entityB});
				}
			}
		}
	}

	private narrowPhase(): void {

		for (const pair of this.candidatePairs) {
			const {entityA, entityB} = pair;
			const isKinematicA = Rigidbody.isKinematic[entityA];
			const isKinematicB = Rigidbody.isKinematic[entityB];

			if (!isKinematicA && !isKinematicB) {
				// Two dynamic bodies
				this.circleCircleCollision(entityA, entityB);
			} else if (isKinematicA) {
				// Entity A is static
				this.handleStaticCollision(entityB, entityA);
			} else {
				// Entity B is static
				this.handleStaticCollision(entityA, entityB);
			}
		}
	}

	private circleCircleCollision(entityA: number, entityB: number) {
		// currently only support collisions for a pair of circles
		const geoA = Shape.geometry[entityA];
		const geoB = Shape.geometry[entityB];
		if (!(geoA instanceof CircleGeometry) || !(geoB instanceof CircleGeometry)) {
			return;
		}

		const posA = Transform.position[entityA];
		const posB = Transform.position[entityB];
		const dir = Vec2.subtract(posB, posA);
		const centerDist = dir.length;

		// Early exit if no collision
		if (centerDist === 0 || centerDist > geoA.radius + geoB.radius) {
			return;
		}

		dir.normalize();

		// Position correction
		const overlap = geoA.radius + geoB.radius - centerDist;

		// Velocity correction
		const v1 = Rigidbody.velocity[entityA].dot(dir);
		const v2 = Rigidbody.velocity[entityB].dot(dir);

		const restitution = Math.min(Rigidbody.restitution[entityA], Rigidbody.restitution[entityB]);

		// body2 may be static
		if (Rigidbody.isKinematic[entityB]) {
			// Update the dynamic body's position
			Transform.position[entityA].addMult(dir, -overlap);

			// Update the dynamic body's velocity
			const energyTransfer = v1 * restitution;           // Energy transferred back
			const totalEnergyChange = v1 + energyTransfer;     // Total energy change
			Rigidbody.velocity[entityA].addMult(dir, -totalEnergyChange); // Negative because it's opposing motion

			// Static bodies don't budge, we're done here
			return;
		}

		// Dynamic collision: move both bodies
		posA.addMult(dir, -overlap / 2);
		Transform.position[entityB].addMult(dir, overlap / 2);

		// Dynamic collision: update both velocities
		// m1 * v1 + m2 * v2 = m1 * v1' + m2 * v2'
		const m1 = Rigidbody.mass[entityA];
		const m2 = Rigidbody.mass[entityB];
		const newV1 = (m1 * v1 + m2 * v2 - m2 * (v1 - v2) * restitution) / (m1 + m2);
		const newV2 = (m1 * v1 + m2 * v2 - m1 * (v2 - v1) * restitution) / (m1 + m2);

		Rigidbody.velocity[entityA].addMult(dir, newV1 - v1);
		Rigidbody.velocity[entityB].addMult(dir, newV2 - v2);
	}

	private handleStaticCollision(entityA: number, entityB: number): void {
		const geoA = Shape.geometry[entityA];
		const geoB = Shape.geometry[entityB];

		// Only handle circle vs. static shapes for now
		if (!(geoA instanceof CircleGeometry)) {
			return;
		}

		switch (true) {
			case (geoB instanceof CircleGeometry): {
				this.circleCircleCollision(entityA, entityB);
				break;
			}
			case (geoB instanceof EdgeGeometry): {
				this.handleCircleLineSegmentCollision(
					entityA,
					{p1: geoB.p1, p2: geoB.p2}
				);
				break;
			}
			case (geoB instanceof PathGeometry): {
				if (geoB.verticies.length >= 2) {
					const points = geoB.verticies;
					for (let k = 0; k < points.length - 1; k++) {
						const segment = {p1: points[k], p2: points[k + 1]};
						this.handleCircleLineSegmentCollision(entityA, segment);
					}
				}
				break;
			}
			case (geoB instanceof PolygonGeometry): {
				if (geoB.verticies.length >= 2) {
					const vertices = geoB.verticies;
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
		const posA = Transform.position[entityA];
		const c = this.closestPointOnSegment(posA, lineSegment.p1, lineSegment.p2);
		const dir = Vec2.subtract(posA, c);
		const distance = dir.length;

		if (distance === 0 || distance > circleRad) {
			return; // No collision
		}

		dir.normalize();
		posA.addMult(dir, circleRad - distance);

		const velocityA = Rigidbody.velocity[entityA];
		const normalVelocity = velocityA.dot(dir);
		const totalEnergyChange = normalVelocity + normalVelocity * Rigidbody.restitution[entityA];

		velocityA.addMult(dir, -totalEnergyChange);;
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
