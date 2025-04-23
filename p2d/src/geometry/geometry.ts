import {Vec2} from '../vec2.js';

export enum GeometryTypes {
	circle,
	polygon,
	edge,
	path,
}

export interface AABB {
	min: Vec2;
	max: Vec2;
}

export abstract class Geometry {
	type: GeometryTypes;

	constructor(type: GeometryTypes) {
		this.type = type;
	}

	abstract getAABB(position: Vec2): AABB;
}