import {Vec2} from 'p2d/src/vec2';
import {AABB, Geometry, GeometryTypes} from './geometry.js';

export class PathGeometry extends Geometry {
	private aabb: AABB;
	verticies: Vec2[];

	constructor(verticies: Vec2[]) {
		super(GeometryTypes.path);
		this.verticies = verticies;

		let maxX = 0, maxY = 0, minX = 0, minY = 0;
		for (const point of this.verticies) {
			if (point.x < minX) {
				minX = point.x;
			}
			if (point.x > maxX) {
				maxX = point.x;
			}
			if (point.y < minY) {
				minY = point.y;
			}
			if (point.y > maxY) {
				maxY = point.y;
			}
		}

		this.aabb = {
			min: new Vec2(minX, minY),
			max: new Vec2(maxX, maxY)
		};
	}

	getAABB(): AABB {
		return this.aabb;
	}
}
