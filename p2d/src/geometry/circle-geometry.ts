import {Geometry, GeometryTypes} from 'p2d/src/geometry/geometry';
import {Vec2} from '../vec2.js';

export class CircleGeometry extends Geometry {
	radius: number;

	constructor(radius: number) {
		super(GeometryTypes.circle);
		this.radius = radius;
	}

	getExtents(): Vec2 {
		return new Vec2(this.radius, this.radius);
	}
}
