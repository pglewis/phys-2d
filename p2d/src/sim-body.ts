/* eslint-disable @stylistic/js/no-tabs */
import {Vec2} from './vec2';
import {Geometry} from './geometry/geometry';

export type BodyState = {
	name: string
	position: Vec2
	velocity: Vec2
	type: BodyTypes
	geometry: Geometry
	material: BodyMaterial
	atRest?: boolean
}

export enum BodyTypes {
	static,
	dynamic,
}

// export type CircleGeometry = {
// 	shape: GeometryTypes.circle
// 	radius: number
// }

// export type PolygonGeometry = {
// 	shape: GeometryTypes.polygon
// 	vertices: Vec2[]
// }

// export type EdgeGeometry = {
// 	shape: GeometryTypes.edge
// 	start: Vec2
// 	end: Vec2
// }

// export type PathGeometry = {
// 	shape: GeometryTypes.path
// 	points: Vec2[]
// }

// export type BodyGeometry =
// 	| CircleGeometry
// 	| PolygonGeometry
// 	| EdgeGeometry
// 	| PathGeometry

export type BodyMaterial = {
	mass: number
	restitution: number
}

export class SimBody {
	name: string;
	type: BodyTypes;
	position: Vec2;
	velocity: Vec2;
	geometry: Geometry;
	material: BodyMaterial;
	atRest?: boolean;

	constructor(initialState: BodyState) {
		const {
			name = crypto.randomUUID(),
			type = BodyTypes.dynamic,
			position,
			velocity,
			geometry,
			material,
			atRest = false,
		} = initialState;

		this.name = name;
		this.type = type;
		this.geometry = geometry;
		this.material = material;
		this.position = position;
		this.velocity = velocity;
		this.atRest = atRest;
	}
}
