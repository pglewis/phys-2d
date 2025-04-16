import {Geometry, GeometryTypes} from './geometry.js';

export class CircleGeometry extends Geometry {
	radius: number;

	constructor(radius: number) {
		super(GeometryTypes.circle);
		this.radius = radius;
	}
}
