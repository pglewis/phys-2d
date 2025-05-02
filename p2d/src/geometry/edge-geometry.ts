import {Vec2} from 'p2d/src/vec2';
import {Geometry, GeometryTypes} from 'p2d/src/geometry/geometry';

export class EdgeGeometry extends Geometry {
	private readonly extents: Vec2;
	p1: Vec2;
	p2: Vec2;

	constructor(p1: Vec2, p2: Vec2) {
		super(GeometryTypes.edge);
		this.p1 = p1;
		this.p2 = p2;
		this.extents = Vec2.subtract(p2, p1);
	}

	getExtents(): Vec2 {
		return this.extents;
	}
}
