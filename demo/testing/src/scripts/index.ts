import {Vec2} from 'p2d/src/vec2';
import {Simulation} from 'p2d/src/simulation';
import {Canvas} from 'p2d/src/canvas';
import {Camera} from 'p2d/src/camera';
import {CircleGeometry} from 'p2d/src/geometry/circle-geometry';
import {PathGeometry} from 'p2d/src/geometry/path-geometry';
import {RenderSystem} from 'p2d/src/ecs/systems/render-system';
import {addComponent, addEntity, createWorld, deleteWorld} from 'bitecs';
import {Transform} from 'p2d/src/ecs/components/transform';
import {Rigidbody} from 'p2d/src/ecs/components/rigidbody';
import {Shape} from 'p2d/src/ecs/components/shape';
import {Renderable} from 'p2d/src/ecs/components/renderable';
import {Collider} from 'p2d/src/ecs/components/collider';

export interface BallProps {
	isKinematic?: boolean;
	position: Vec2;
	velocity: Vec2;
	color?: string;
	radius?: number;
	mass?: number;
	restitution?: number;
	debug?: boolean;
}

const CANVAS_WIDTH = 720;
const CANVAS_HEIGHT = 500;

const WIDTH_IN_M = 50;

const canvas = new Canvas({
	parent: document.getElementById('canvas-container') as HTMLElement,
	width: CANVAS_WIDTH,
	height: CANVAS_HEIGHT,
});

const camera = new Camera({
	position: new Vec2(0, 0),
	scale: canvas.width / WIDTH_IN_M,
});

let world: object;
let simulation: Simulation;

reset();

function reset() {
	if (world) {
		deleteWorld(world);
	}

	world = createWorld({
		components: {
			Transform: Transform,
			Rigidbody: Rigidbody,
			Collider: Collider,
			Shape: Shape,
			Renderable: Renderable,
		}
	});

	simulation = new Simulation({
		world,
		substeps: 4,
		tDelta: 1 / 60,
		gravity: new Vec2(0, -9.8),
		renderSystem: new RenderSystem(canvas, camera),
	});

	createBorder();
	createPlinkoboard();
	createBalls();

	simulation.singleStep(); // Resolve overlap from random object placement
	simulation.render();
}

function createBalls() {
	const scaleH = canvas.height / camera.scale;

	for (let i = 0; i < 500; i++) {
		const radius = Math.random() * (.8 - .15) + .15;
		const pX = Math.random() * (WIDTH_IN_M - radius) + radius;
		const pY = Math.random() * (scaleH - radius) + scaleH * 0.9;
		// const velocity = new Vec2(Math.random() * 40 - 20, Math.random() * 40 - 20);
		const r = Math.floor((Math.random() * 9)).toString(16).padStart(2, '0');
		const g = Math.floor((Math.random() * 9)).toString(16).padStart(2, '0');
		const b = Math.floor((Math.random() * 9)).toString(16).padStart(2, '0');

		const ball = createBall({
			position: new Vec2(pX, pY),
			velocity: new Vec2(),
			radius: radius,
			mass: radius * 5,
			restitution: 0.75,
			color: `#${r}${g}${b}`,
		});
		Renderable.filled[ball] = false;
	}
}

function createBall(props: BallProps): number {
	const {
		isKinematic = false,
		position,
		velocity,
		color = '#eee',
		radius = 0.0225,
		mass = 0.0806,
		restitution = 0.5,
		debug = false,
	} = props;

	const ball = addEntity(world);

	addComponent(world, Transform, ball);
	Transform.position[ball] = position;

	addComponent(world, Rigidbody, ball);
	Rigidbody.isKinematic[ball] = isKinematic;
	Rigidbody.velocity[ball] = velocity;
	Rigidbody.mass[ball] = mass;

	addComponent(world, Collider, ball);
	Collider.restitution[ball] = restitution;

	addComponent(world, Shape, ball);
	Shape.geometry[ball] = new CircleGeometry(radius);

	addComponent(world, Renderable, ball);
	Renderable.color[ball] = color;
	Renderable.debug[ball] = debug;

	return ball;
}


function createPlinkoboard() {
	const points = getPlinkoPoints();

	for (const point of points) {
		const plink = createBall({
			isKinematic: true,
			position: point,
			velocity: new Vec2(),
			radius: .4,
			color: 'black',
		});
		Renderable.filled[plink] = true;
	}
}

function getPlinkoPoints(): Vec2[] {
	const points = [] as Vec2[];
	const bottomOffset = 5;
	const rowHeight = 3;

	// Reduce the margin on each side to bring points closer to edges
	const edgeMargin = 0.045 * WIDTH_IN_M; // 5% of width as margin on each side

	for (let i = 0; i < 4; i++) {
		const y = rowHeight * 2 * i + bottomOffset;

		// Row with 7 points - evenly spaced
		const spacingRow7 = (WIDTH_IN_M - 2 * edgeMargin) / 6; // Divide by (points - 1)
		for (let j = 0; j < 7; j++) {
			const x = edgeMargin + j * spacingRow7;
			points.push(new Vec2(x, y));
		}

		// Row with 6 points - properly offset to be centered between points in row above
		// Each point should be halfway between two points in the row above
		const offsetX = spacingRow7 / 2; // Half of the spacing of row with 7 points
		for (let j = 0; j < 6; j++) {
			const x = edgeMargin + offsetX + j * spacingRow7;
			points.push(new Vec2(x, y + rowHeight));
		}
	}

	return points;
}
function createBorder() {
	const points = [
		//new Vec2(0, 0),
		new Vec2(0, (canvas.height / camera.scale) * 2),
		new Vec2(0, 0),
		new Vec2(WIDTH_IN_M, 0),
		new Vec2(WIDTH_IN_M, (canvas.height / camera.scale) * 2),
	];

	const border = addEntity(world);

	addComponent(world, Transform, border);

	addComponent(world, Rigidbody, border);
	Rigidbody.isKinematic[border] = true;
	Rigidbody.mass[border] = Infinity;

	addComponent(world, Collider, border);
	Collider.restitution[border] = 1;

	addComponent(world, Shape, border);
	Shape.geometry[border] = new PathGeometry(points);
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
