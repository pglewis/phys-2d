export enum GeometryTypes {
	circle,
	polygon,
	edge,
	path,
}

export abstract class Geometry {
	type: GeometryTypes;

	constructor(type: GeometryTypes) {
		this.type = type;
	}
}