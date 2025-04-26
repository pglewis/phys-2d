import {AABB, Geometry, GeometryTypes} from 'p2d/src/geometry/geometry';
import {Vec2} from '../vec2.js';

export class BoxGeometry extends Geometry {
	size: number;

	constructor(size: number) {
		super(GeometryTypes.circle);
		this.size = size;
	}

	getAABB(position: Vec2): AABB {
		const {x, y} = position;
		const size = this.size;

		return {
			min: new Vec2(x - size, y - size),
			max: new Vec2(x + size, y + size)
		};
	}
}
