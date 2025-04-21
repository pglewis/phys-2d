import {Vec2} from 'p2d/src/vec2';
import {Simulation} from 'p2d/src/simulation';
import {Canvas} from 'p2d/src/canvas';
import {Camera} from 'p2d/src/camera';
import {CircleGeometry} from 'p2d/src/geometry/circle-geometry';
import {PathGeometry} from 'p2d/src/geometry/path-geometry';
import {RenderSystem} from 'p2d/src/ecs/systems/render-system';
import {addComponent, addEntity, createWorld, resetWorld} from 'bitecs';
import {Transform} from 'p2d/src/ecs/components/transform';
import {Rigidbody} from 'p2d/src/ecs/components/rigidbody';
import {Shape} from 'p2d/src/ecs/components/shape';
import {Renderable} from 'p2d/src/ecs/components/renderable';
import {EdgeGeometry} from 'p2d/src/geometry/edge-geometry';

const WIDTH_IN_M = 50;

const canvas = new Canvas({
	parent: document.getElementById('canvas-container') as HTMLElement,
	width: 720,
	height: 500,
});

const camera = new Camera({
	position: new Vec2(0, 0),
	scale: canvas.width / WIDTH_IN_M,
});

const world = createWorld({
	components: {
		Transform: Transform,
		Rigidbody: Rigidbody,
		Shape: Shape,
		Renderable: Renderable,
	}
});

const simulation = new Simulation({
	world,
	substeps: 4,
	tDelta: 1 / 60,
	gravity: new Vec2(0, -9.8),
	renderSystem: new RenderSystem(canvas, camera),
});

reset();

function reset() {
	resetWorld(world);
	border();
	edges();
	balls();

	simulation.singleStep(); // Resolve overlap from random placement
	simulation.render();
}

export interface BallProps {
	position: Vec2;
	velocity: Vec2;
	color?: string;
	radius?: number;
	mass?: number;
	restitution?: number;
	debug?: boolean;
}

function balls() {
	for (let i = 0; i < 200; i++) {
		const radius = Math.random() * (.8 - .15) + .15;
		const pX = Math.random() * (WIDTH_IN_M - radius) + radius;
		const pY = Math.random() * (canvas.height / camera.scale - radius) + radius;
		const velocity = new Vec2(Math.random() * 40 - 20, Math.random() * 40 - 20);
		const color = '#' + (Math.random().toString(16) + '000000').substring(2, 8);

		createBall({
			position: new Vec2(pX, pY),
			velocity: velocity,
			radius: radius,
			mass: radius * 5,
			restitution: 0.85,
			color: color,
		});
	}
}

function createBall(props: BallProps): number {
	const {
		position,
		velocity,
		color = '#eee',
		radius = 0.0225,
		mass = 0.0806,
		restitution = 0.75,
		debug = false,
	} = props;

	const ball = addEntity(world);

	addComponent(world, Transform, ball);
	Transform.position[ball] = position;

	addComponent(world, Rigidbody, ball);
	Rigidbody.isKinematic[ball] = false;
	Rigidbody.velocity[ball] = velocity;
	Rigidbody.mass[ball] = mass;
	Rigidbody.restitution[ball] = restitution;

	addComponent(world, Shape, ball);
	Shape.geometry[ball] = new CircleGeometry(radius);

	addComponent(world, Renderable, ball);
	Renderable.color[ball] = color;
	Renderable.debug[ball] = debug;

	return ball;
}

function border() {
	const points = [
		new Vec2(0, 0),
		new Vec2(WIDTH_IN_M, 0),
		new Vec2(WIDTH_IN_M, canvas.height / camera.scale),
		new Vec2(0, canvas.height / camera.scale),
		new Vec2(0, 0),
	];

	const border = addEntity(world);

	addComponent(world, Transform, border);

	addComponent(world, Rigidbody, border);
	Rigidbody.isKinematic[border] = true;
	Rigidbody.mass[border] = Infinity;
	Rigidbody.restitution[border] = 1;

	addComponent(world, Shape, border);
	Shape.geometry[border] = new PathGeometry(points);
}

export interface EdgeProps {
	p1: Vec2;
	p2: Vec2;
	color?: string;
}

function edges() {

	createEdge({
		p1: new Vec2(5, 13),
		p2: new Vec2(15, 13)
	});

	createEdge({
		p1: new Vec2(35, 13),
		p2: new Vec2(45, 13)
	});

	createEdge({
		p1: new Vec2(10, 27),
		p2: new Vec2(20, 18)
	});

	createEdge({
		p1: new Vec2(30, 18),
		p2: new Vec2(40, 27)
	});
}

function createEdge(props: EdgeProps): number {
	const {p1, p2, color = 'black'} = props;

	const edge = addEntity(world);

	addComponent(world, Transform, edge);

	addComponent(world, Rigidbody, edge);
	Rigidbody.isKinematic[edge] = true;
	Rigidbody.mass[edge] = Infinity;
	Rigidbody.restitution[edge] = 1;

	addComponent(world, Shape, edge);
	Shape.geometry[edge] = new EdgeGeometry(p1, p2);

	addComponent(world, Renderable, edge);
	Renderable.color[edge] = color;

	return edge;
}

const playPauseBtn = document.getElementById('play-pause-btn') as HTMLButtonElement;
const stepBtn = document.getElementById('step-btn') as HTMLButtonElement;
const resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;

playPauseBtn.addEventListener('click', () => {
	if (!simulation.isRunning()) {
		playPauseBtn.textContent = '⏸';
		simulation.start();
	} else {
		playPauseBtn.textContent = '▶';
		simulation.stop();
	}
});

stepBtn.addEventListener('click', () => {
	playPauseBtn.textContent = '▶';
	simulation.singleStep();
});

resetBtn.addEventListener('click', () => {
	playPauseBtn.textContent = '▶';
	simulation.stop();
	reset();
});
