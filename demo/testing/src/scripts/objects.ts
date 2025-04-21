import {CircleGeometry, Geometry, Vec2} from 'p2d';
import {createRenderable, createRigidbody, createShape, createTransform} from 'p2d/src/ecs/components/factories';
import * as ECS from 'p2d/src/ecs/entity';

export interface PinballParams {
	position: Vec2;
	velocity: Vec2;
	color?: string;
	radius?: number;
	mass?: number;
	restitution?: number;
	debug?: boolean;
}

export function createPinball(props: PinballParams): ECS.Entity {
	const {
		position,
		velocity,
		color = '#eee',
		radius = 0.0225,
		mass = 0.0806,
		restitution = 0.95,
		debug = false,
	} = props;

	return ECS.buildEntity()
		.with('transform', createTransform({position}))
		.with('rigidbody', createRigidbody({
			velocity,
			mass,
			restitution,
			isKinematic: false
		}))
		.with('shape', createShape(new CircleGeometry(radius)))
		.with('renderable', createRenderable({color, debug}))
		.build();
}

export interface BumperParams {
	position: Vec2;
	color: string;
	mass?: number;
	radius?: number;
	restitution?: number;
}

export function createBumper(props: BumperParams): ECS.Entity {
	const {
		position,
		color,
		mass = 0.05,
		radius = 0.07,
		restitution = 0.95
	} = props;

	return ECS.buildEntity()
		.with('transform', createTransform({position}))
		.with('rigidbody', createRigidbody({
			mass: mass,
			restitution,
			isKinematic: true
		}))
		.with('shape', createShape(new CircleGeometry(radius)))
		.with('renderable', createRenderable({color}))
		.build();
}

export interface EdgeParams {
	geometry: Geometry;
	color: string;
	radius?: number;
	restitution?: number;
}

export function createEdge(props: EdgeParams): ECS.Entity {
	const {
		geometry,
		color,
		restitution = 1
	} = props;

	return ECS.buildEntity()
		.with('transform', createTransform())
		.with('rigidbody', createRigidbody({
			mass: Infinity,
			restitution,
			isKinematic: true
		}))
		.with('shape', createShape(geometry))
		.with('renderable', createRenderable({color}))
		.build();
}
