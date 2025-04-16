import {Vec2} from './vec2';
import {BodyTypes, SimBody} from './sim-body';
import {CircleGeometry} from './geometry/circle-geometry';
import {PathGeometry} from './geometry/path-geometry';
import {PolygonGeometry} from './geometry/polygon-geometry';
import {EdgeGeometry} from './geometry/edge-geometry';

export type WorldProps = {
	gravity?: Vec2
};

export class World {
	gravity: Vec2;
	dynamicBodies: SimBody[] = [];
	staticBodies: SimBody[] = [];

	constructor(props: WorldProps) {
		const {
			gravity = new Vec2(0, -9.8), // Default to Earth's gravity
		} = props;

		this.gravity = gravity;
	}

	addBody(...bodies: SimBody[]) {
		for (const body of bodies) {
			if (body.type === BodyTypes.dynamic) {
				this.dynamicBodies.push(body);
			} else {
				this.staticBodies.push(body);
			}
		}
	}

	step(tDelta: number) {
		// Integrate all dynamic bodies
		for (const body of this.dynamicBodies) {
			body.velocity.add(this.gravity, tDelta);
			body.position.add(body.velocity, tDelta);
		}

		// Collision detection and resolution
		for (let i = 0; i < this.dynamicBodies.length; i++) {
			const body = this.dynamicBodies[i];

			// Check for collisions with other dynamic bodies
			for (let j = i + 1; j < this.dynamicBodies.length; j++) {
				const body2 = this.dynamicBodies[j];

				this.handleCircleCollision(body, body2);
			}

			// Check for collisions with static bodies
			for (const staticBody of this.staticBodies) {
				this.handleStaticCollision(body, staticBody);
			}
		}
	}

	private handleCircleCollision(dynamicBody: SimBody, body2: SimBody) {
		// currently only support collisions for circles
		if (!(dynamicBody.geometry instanceof CircleGeometry) || !(body2.geometry instanceof CircleGeometry)) {
			return;
		}

		const dir = Vec2.subtract(body2.position, dynamicBody.position);
		const centerDist = dir.length;

		// Early exit if no collision
		if (centerDist === 0 || centerDist > dynamicBody.geometry.radius + body2.geometry.radius) {
			return;
		}

		dir.normalize();

		// Position correction
		const overlap = dynamicBody.geometry.radius + body2.geometry.radius - centerDist;

		// Velocity correction
		const v1 = dynamicBody.velocity.dot(dir);
		const v2 = body2.velocity.dot(dir);

		const restitution = Math.min(dynamicBody.material.restitution, body2.material.restitution);

		// body2 may be static
		if (body2.type === BodyTypes.static) {
			// Update the dynamic body's position
			dynamicBody.position.add(dir, -overlap);

			// Update the dynamic body's velocity
			const energyTransfer = v1 * restitution;           // Energy transferred back
			const totalEnergyChange = v1 + energyTransfer;     // Total energy change
			dynamicBody.velocity.add(dir, -totalEnergyChange); // Negative because it's opposing motion

			// Static bodies don't budge, we're done here
			return;
		}

		// Dynamic collision: move both bodies
		dynamicBody.position.add(dir, -overlap / 2);
		body2.position.add(dir, overlap / 2);

		// Dynamic collision: update both velocities
		// m1 * v1 + m2 * v2 = m1 * v1' + m2 * v2'
		const m1 = dynamicBody.material.mass;
		const m2 = body2.material.mass;
		const newV1 = (m1 * v1 + m2 * v2 - m2 * (v1 - v2) * restitution) / (m1 + m2);
		const newV2 = (m1 * v1 + m2 * v2 - m1 * (v2 - v1) * restitution) / (m1 + m2);

		dynamicBody.velocity.add(dir, newV1 - v1);
		body2.velocity.add(dir, newV2 - v2);
	}

	private handleStaticCollision(dynamicBody: SimBody, staticBody: SimBody): void {
		// Only handle circle vs. static shapes for now
		if (!(dynamicBody.geometry instanceof CircleGeometry)) {
			return;
		}

		const {geometry} = staticBody;

		switch (true) {
			case (geometry instanceof CircleGeometry): {
				this.handleCircleCollision(dynamicBody, staticBody);
				break;
			}

			case (geometry instanceof EdgeGeometry): {
				this.handleCircleLineSegmentCollision(
					dynamicBody,
					{p1: geometry.p1, p2: geometry.p2}
				);
				break;
			}

			case (geometry instanceof PathGeometry): {
				if (geometry.verticies.length >= 2) {
					const points = geometry.verticies;
					for (let k = 0; k < points.length - 1; k++) {
						const segment = {p1: points[k], p2: points[k + 1]};
						this.handleCircleLineSegmentCollision(dynamicBody, segment);
					}
					if (points.length > 2) {
						const lastSegment = {p1: points[points.length - 1], p2: points[0]};
						this.handleCircleLineSegmentCollision(dynamicBody, lastSegment);
					}
				}
				break;
			}

			case (geometry instanceof PolygonGeometry): {
				if (geometry.verticies.length >= 2) {
					const vertices = geometry.verticies;
					for (let k = 0; k < vertices.length; k++) {
						const p1 = vertices[k];
						const p2 = vertices[(k + 1) % vertices.length];
						this.handleCircleLineSegmentCollision(dynamicBody, {p1, p2});
					}
				}
				break;
			}
		}
	}

	private handleCircleLineSegmentCollision(ball: SimBody, lineSegment: {p1: Vec2, p2: Vec2}): void {
		const circleRad = (ball.geometry as CircleGeometry).radius;
		const c = this.closestPointOnSegment(ball.position, lineSegment.p1, lineSegment.p2);
		const dir = Vec2.subtract(ball.position, c);
		const distance = dir.length;

		if (distance === 0 || distance > circleRad) {
			return; // No collision
		}

		dir.normalize();
		const overlap = circleRad - distance;
		ball.position.add(dir, overlap);

		const normalVelocity = ball.velocity.dot(dir);
		const restitution = ball.material.restitution;
		const energyTransfer = normalVelocity * restitution;
		const totalEnergyChange = normalVelocity + energyTransfer;

		ball.velocity.add(dir, -totalEnergyChange);;
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
		return Vec2.add(a, ab.scale(t));
	}
}
