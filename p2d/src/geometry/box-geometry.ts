import {Geometry, GeometryTypes} from 'p2d/src/geometry/geometry';
import {Vec2} from 'p2d/src/vec2';

export class BoxGeometry extends Geometry {
	size: number;
	private readonly extent: number;
	private readonly corners: Vec2[];

	constructor(size: number) {
		super(GeometryTypes.box);
		this.size = size;
		this.extent = size * Math.SQRT2;
		this.corners = [
			new Vec2(-size, -size),
			new Vec2(size, -size),
			new Vec2(size, size),
			new Vec2(-size, size)
		];
	}

	getExtents(): Vec2 {
		return new Vec2(this.extent, this.extent);
	}

	getCorners(): Vec2[] {
		return this.corners;
	}
}
