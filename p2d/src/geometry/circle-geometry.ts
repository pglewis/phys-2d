import {Geometry, GeometryTypes} from 'p2d/src/geometry/geometry';

export class CircleGeometry extends Geometry {
	radius: number;

	constructor(radius: number) {
		super(GeometryTypes.circle);
		this.radius = radius;
	}
}
