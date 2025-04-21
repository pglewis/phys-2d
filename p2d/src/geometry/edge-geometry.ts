import {Vec2} from 'p2d/src/vec2';
import {Geometry, GeometryTypes} from 'p2d/src/geometry/geometry';

export class EdgeGeometry extends Geometry {
	p1: Vec2;
	p2: Vec2;

	constructor(p1: Vec2, p2: Vec2) {
		super(GeometryTypes.edge);
		this.p1 = p1;
		this.p2 = p2;
	}
}
