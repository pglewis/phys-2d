import {AABB, Geometry, GeometryTypes} from 'p2d/src/geometry/geometry';
import {Vec2} from '../vec2.js';

export class CircleGeometry extends Geometry {
	radius: number;

	constructor(radius: number) {
		super(GeometryTypes.circle);
		this.radius = radius;
	}

	getAABB(position: Vec2): AABB {
		const {x, y} = position;
		const radius = this.radius;

		return {
			min: new Vec2(x - radius, y - radius),
			max: new Vec2(x + radius, y + radius)
		};
	}
}
