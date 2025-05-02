import {Vec2} from 'p2d/src/vec2';
import {System} from 'p2d/src/ecs/systems/system';
import {CircleGeometry} from 'p2d/src/geometry/circle-geometry';
import {Shape} from 'p2d/src/ecs/components/shape';
import {Rigidbody} from 'p2d/src/ecs/components/rigidbody';
import {Transform} from 'p2d/src/ecs/components/transform';
import {EdgeGeometry} from 'p2d/src/geometry/edge-geometry';
import {PathGeometry} from 'p2d/src/geometry/path-geometry';
import {PolygonGeometry} from 'p2d/src/geometry/polygon-geometry';
import {defineQuery} from 'bitecs';
import {Collider} from '../components/collider.js';
import {Renderable} from '../components/renderable.js';
import {BoxGeometry} from '../../geometry/box-geometry.js';
import {Geometry, getAABB} from '../../geometry/geometry.js';

const collisionQuery = defineQuery([Transform, Collider, Rigidbody, Shape]);

interface CandidatePair {
	entityA: number,
	entityB: number
}

export class CollisionSystem implements System {
	candidatePairs!: CandidatePair[];

	/**
	 * Run the collision detection system
	 *
	 * @param world
	 */
	update(world: object): void {
		this.candidatePairs = [];

		this.broadPhase(collisionQuery(world));
		this.narrowPhase();
	}

	/**
	 * Broad phase collision detection
	 *
	 * @param entities - Array of entity IDs to check for collisions
	 */
	private broadPhase(entities: number[]): void {
		const len = entities.length;

		for (let i = 0; i < len - 1; i++) {
			const entityA = entities[i];
			const geoA = Shape.geometry[entityA];
			const posA = Transform.position[entityA];
			const boxA = getAABB(posA, geoA);
			const isKinematicA = Rigidbody.isKinematic[entityA];

			for (let j = i + 1; j < len; j++) {
				const entityB = entities[j];
				const isKinematicB = Rigidbody.isKinematic[entityB];

				// DEBUG
				Renderable.isColliding[entityA] = false;
				Renderable.isColliding[entityB] = false;

				// Two static bodies aren't going to collide
				if (isKinematicA && isKinematicB) continue;

				const geoB = Shape.geometry[entityB];
				const posB = Transform.position[entityB];
				const boxB = getAABB(posB, geoB);

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

	/**
	 * Narrow phase collision detection
	 */
	private narrowPhase(): void {

		for (const pair of this.candidatePairs) {
			const {entityA, entityB} = pair;
			// const isKinematicA = Rigidbody.isKinematic[entityA];
			// const isKinematicB = Rigidbody.isKinematic[entityB];

			switch (true) {
				case (Shape.geometry[entityA] instanceof BoxGeometry && Shape.geometry[entityB] instanceof BoxGeometry): {
					this.polyPolyCollision(entityA, entityB);
					break;
				}
				case (Shape.geometry[entityA] instanceof BoxGeometry && Shape.geometry[entityB] instanceof CircleGeometry): {
					this.polyCircleCollision(entityA, entityB);
					break;
				}
				case (Shape.geometry[entityA] instanceof CircleGeometry && Shape.geometry[entityB] instanceof BoxGeometry): {
					this.polyCircleCollision(entityB, entityA);
					break;
				}
				case (Shape.geometry[entityA] instanceof CircleGeometry && Shape.geometry[entityB] instanceof CircleGeometry): {
					this.circleCircleCollision(entityA, entityB);
					break;
				}
			}

			// if (!isKinematicA && !isKinematicB) {
			// 	// Two dynamic bodies
			// 	this.circleCircleCollision(entityA, entityB);
			// } else if (isKinematicA) {
			// 	// Entity A is static
			// 	this.handleStaticCollision(entityB, entityA);
			// } else {
			// 	// Entity B is static
			// 	this.handleStaticCollision(entityA, entityB);
			// }
		}
	}

	/**
	 * Handle collision between two polygons
	 *
	 * @param entityA - Entity ID of the first polygon
	 * @param entityB - Entity ID of the second polygon
	 */
	private polyPolyCollision(entityA: number, entityB: number): void {
		let normal = Vec2.zero();
		let depth = Infinity;

		const verticiesA = this.getBoxVerticies(entityA);
		Renderable.translatedVertices[entityA] = verticiesA;

		const verticiesB = this.getBoxVerticies(entityB);
		Renderable.translatedVertices[entityB] = verticiesB;

		// Calculate centers of polygons
		const centerA = this.calculateCenter(verticiesA);
		const centerB = this.calculateCenter(verticiesB);
		const aToB = Vec2.subtract(centerB, centerA);

		let len = verticiesA.length;
		for (let i = 0; i < len; i++) {
			const vA = verticiesA[i];
			const vB = verticiesA[(i + 1) % len];
			const separatingAxis = Vec2.subtract(vB, vA).perp().normalize();

			const [minA, maxA] = this.projectVerticies(verticiesA, separatingAxis);
			const [minB, maxB] = this.projectVerticies(verticiesB, separatingAxis);

			if (minA > maxB || minB > maxA) {
				return;
			}

			const axisDepth = Math.min(maxB - minA, maxA - minB);
			if (axisDepth < depth) {
				depth = axisDepth;
				normal = separatingAxis;
			}
		}

		len = verticiesB.length;
		for (let i = 0; i < len; i++) {
			const vA = verticiesB[i];
			const vB = verticiesB[(i + 1) % verticiesB.length];
			const separatingAxis = Vec2.subtract(vB, vA).perp().normalize();

			const [minA, maxA] = this.projectVerticies(verticiesA, separatingAxis);
			const [minB, maxB] = this.projectVerticies(verticiesB, separatingAxis);

			if (minA > maxB || minB > maxA) {
				return;
			}

			const axisDepth = Math.min(maxB - minA, maxA - minB);
			if (axisDepth < depth) {
				depth = axisDepth;
				normal = separatingAxis;
			}
		}

		// Make sure normal points from A to B
		if (normal.dot(aToB) > 0) {
			normal.scale(-1);
		}

		depth /= normal.length;
		normal.normalize();

		/** DEBUG */
		Renderable.isColliding[entityA] = true;
		Renderable.isColliding[entityB] = true;
		Transform.position[entityA].addMult(normal, depth / 2);
		Transform.position[entityB].addMult(normal, -depth / 2);
	}

	/**
	 * Handle collision between a polygon and a circle
	 *
	 * @param polyEntity - Entity ID of the polygon
	 * @param circleEntity - Entity ID of the circle
	 */
	private polyCircleCollision(polyEntity: number, circleEntity: number): void {
		const radius = (Shape.geometry[circleEntity] as CircleGeometry).radius;
		let closestPoint: Vec2 | null = null;
		let minDist = Infinity;
		let collisionAxis: Vec2 | null = null;

		const vertices = this.getBoxVerticies(polyEntity);
		Renderable.translatedVertices[polyEntity] = vertices;

		// Calculate centers of polygons
		const circleCenter = Transform.position[circleEntity];

		const len = vertices.length;
		for (let i = 0; i < len; i++) {
			const a = vertices[i];
			const b = vertices[(i + 1) % len];
			const ab = Vec2.subtract(b, a);
			const separatingAxis = ab.perp().normalize();

			const [minA, maxA] = this.projectVerticies(vertices, separatingAxis);
			const [minB, maxB] = this.projectCircle(circleEntity, separatingAxis);

			// Any gap means no collision
			if (minA > maxB || minB > maxA) {
				return;
			}

			// While we're here, check if this edge is closest
			const t = Math.max(0, Math.min(1, (circleCenter.dot(ab) - a.dot(ab)) / ab.dot(ab)));
			const point = Vec2.add(a, Vec2.scale(ab, t));
			const dist = Vec2.subtract(circleCenter, point).length;

			if (dist < minDist) {
				minDist = dist;
				closestPoint = point.clone();
				collisionAxis = separatingAxis;
			}
		}

		// DEBUG
		Renderable.isColliding[polyEntity] = true;
		Renderable.isColliding[circleEntity] = true;

		if (!closestPoint || !collisionAxis || minDist >= radius) {
			return;
		}

		const normal = Vec2.subtract(circleCenter, closestPoint).normalize();
		const depth = radius - minDist;

		// Check if normal points in roughly same direction as separating axis
		// If not, we're deeply penetrated and should move in opposite direction
		if (normal.dot(collisionAxis) > 0) {
			normal.scale(-1);
		}

		Transform.position[circleEntity].addMult(normal, depth / 2);
		Transform.position[polyEntity].addMult(normal, -depth / 2);
	}

	private circleCircleCollision(entityA: number, entityB: number) {
		// currently only support collisions for a pair of circles
		const geoA = Shape.geometry[entityA] as CircleGeometry;
		const geoB = Shape.geometry[entityB] as CircleGeometry;

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

		const restitution = Math.min(Collider.restitution[entityA], Collider.restitution[entityB]);

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

		// DEBUG
		Renderable.isColliding[entityA] = true;
		Renderable.isColliding[entityB] = true;

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

	private getBoxVerticies(entity: number): Vec2[] {
		// Get transform data
		const pos = Transform.position[entity];
		const rot = Transform.rotation[entity]; // Convert to radians
		const geo = Shape.geometry[entity] as BoxGeometry;
		const verticies: Vec2[] = [];

		// Rotate and translate corners
		for (const corner of geo.getCorners()) {
			// Rotate
			const rotatedX = corner.x * Math.cos(rot) - corner.y * Math.sin(rot);
			const rotatedY = corner.x * Math.sin(rot) + corner.y * Math.cos(rot);

			// Translate to position
			verticies.push(new Vec2(
				rotatedX + pos.x,
				rotatedY + pos.y
			));
		}

		return verticies;
	}

	private calculateCenter(vertices: Vec2[]): Vec2 {
		const center = new Vec2(0, 0);

		for (const vertex of vertices) {
			center.add(vertex);
		}

		return center.scale(1 / vertices.length);
	}

	/**
	 * Projects the vertices onto the separating axis and returns the minimum and maximum projection values
	 *
	 * @param vertices - Array of vertices
	 * @param separatingAxis - Must be normalized
	 *
	 * @returns Array containing the minimum and maximum projection values
	 */
	private projectVerticies(vertices: Vec2[], separatingAxis: Vec2): [number, number] {
		let min = Infinity;
		let max = -Infinity;

		for (const v of vertices) {
			const proj = v.dot(separatingAxis);
			if (proj < min) {
				min = proj;
			}
			if (proj > max) {
				max = proj;
			}
		}

		return [min, max];
	}

	/**
	 * Projects the circle onto the separating axis and returns the minimum and maximum projection values
	 *
	 * @param entity - Entity ID of the circle
	 * @param separatingAxis - Must be normalized
	 *
	 * @returns Array containing the minimum and maximum projection values
	 */
	private projectCircle(entity: number, separatingAxis: Vec2): [number, number] {
		const geo = Shape.geometry[entity] as CircleGeometry;
		const radius = geo.radius;
		const center = Transform.position[entity];

		const min = center.dot(separatingAxis) - radius;
		const max = center.dot(separatingAxis) + radius;

		return [min, max];
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
		const totalEnergyChange = normalVelocity + normalVelocity * Collider.restitution[entityA];

		velocityA.addMult(dir, -totalEnergyChange);;
	}

	/**
	 * Returns the closest point on the line segment to the point p
	 *
	 * @param p - Point to find the closest point to
	 * @param a - Start of the line segment
	 * @param b - End of the line segment
	 *
	 * @returns The closest point on the line segment to the point p
	 */
	private closestPointOnSegment(p: Vec2, a: Vec2, b: Vec2): Vec2 {
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
