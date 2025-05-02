import {Vec2} from '../vec2.js';

export enum GeometryTypes {
	circle,
	box,
	polygon,
	edge,
	path,
}

export interface AABB {
	min: Vec2;
	max: Vec2;
}

export function getAABB(position: Vec2, geometry: Geometry): AABB {
	const extent = geometry.getExtents();
	return {
		min: new Vec2(
			position.x - extent.x,
			position.y - extent.y
		),
		max: new Vec2(
			position.x + extent.x,
			position.y + extent.y
		)
	};
}

export abstract class Geometry {
	type: GeometryTypes;

	constructor(type: GeometryTypes) {
		this.type = type;
	}

	abstract getExtents(): Vec2;
}