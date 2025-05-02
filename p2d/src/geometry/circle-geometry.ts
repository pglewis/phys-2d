import {Geometry, GeometryTypes} from 'p2d/src/geometry/geometry';
import {Vec2} from 'p2d/src/vec2';

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
