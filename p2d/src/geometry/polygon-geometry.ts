import {Vec2} from 'p2d/src/vec2';
import {Geometry, GeometryTypes} from './geometry.js';

export class PolygonGeometry extends Geometry {
	verticies: Vec2[];

	constructor(verticies: Vec2[]) {
		super(GeometryTypes.path);
		this.verticies = verticies;
	}
}
