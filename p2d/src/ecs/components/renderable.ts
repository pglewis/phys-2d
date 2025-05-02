import {Vec2} from 'p2d/src/vec2';

export const Renderable = {
	color: [] as string[],
	strokeColor: [] as string[],
	scale: [] as number[],
	offset: [] as Vec2[],
	debug: [] as boolean[],
	filled: [] as boolean[],
	//--!! Debugging only
	translatedVertices: [] as Vec2[][],
	isColliding: [] as boolean[],
};
