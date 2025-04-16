import {Vec2} from '../vec2.js';
import {Geometry, GeometryTypes} from './geometry.js';

export class EdgeGeometry extends Geometry {
	p1: Vec2;
	p2: Vec2;

	constructor(p1: Vec2, p2: Vec2) {
		super(GeometryTypes.edge);
		this.p1 = p1;
		this.p2 = p2;
	}
}
