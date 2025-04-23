import {Vec2} from 'p2d/src/vec2';
import {AABB, Geometry, GeometryTypes} from 'p2d/src/geometry/geometry';

export class EdgeGeometry extends Geometry {
	private aabb: AABB;
	p1: Vec2;
	p2: Vec2;

	constructor(p1: Vec2, p2: Vec2) {
		super(GeometryTypes.edge);
		this.p1 = p1;
		this.p2 = p2;

		this.aabb = {
			min: new Vec2(
				Math.min(this.p1.x, this.p2.x),
				Math.min(this.p1.y, this.p2.y)
			),
			max: new Vec2(
				Math.max(this.p1.x, this.p2.x),
				Math.max(this.p1.y, this.p2.y)
			)
		};
	}

	getAABB(): AABB {
		return this.aabb;
	}
}
