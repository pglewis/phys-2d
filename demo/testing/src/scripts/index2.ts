import {Vec2} from 'p2d/src/vec2';
import {Simulation} from 'p2d/src/simulation';
import {Canvas} from 'p2d/src/canvas';
import {Camera} from 'p2d/src/camera';
import {RenderSystem} from 'p2d/src/ecs/systems/render-system';
import {addComponent, addEntity, createWorld, deleteWorld} from 'bitecs';
import {Transform} from 'p2d/src/ecs/components/transform';
import {Rigidbody} from 'p2d/src/ecs/components/rigidbody';
import {Shape} from 'p2d/src/ecs/components/shape';
import {Renderable} from 'p2d/src/ecs/components/renderable';
import {Collider} from 'p2d/src/ecs/components/collider';
import {BoxGeometry} from 'p2d/src/geometry/box-geometry';
import {CircleGeometry} from 'p2d/src/geometry/circle-geometry';

const CANVAS_WIDTH = 720;
const CANVAS_HEIGHT = 500;

const WIDTH_IN_M = 100;
const HEIGHT_IN_M = CANVAS_HEIGHT / (CANVAS_WIDTH / WIDTH_IN_M);

const canvas = new Canvas({
	parent: document.getElementById('canvas-container') as HTMLElement,
	width: CANVAS_WIDTH,
	height: CANVAS_HEIGHT,
});

let camera: Camera;
let world: object;
let simulation: Simulation;

// let blueBox: number;
// let greenBox: number;
// let currentBox: number;

reset();

function reset() {
	if (world) {
		deleteWorld(world);
	}

	camera = new Camera({
		position: new Vec2(WIDTH_IN_M / 2, HEIGHT_IN_M / 2),
		scale: CANVAS_WIDTH / WIDTH_IN_M,
	});

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
		gravity: new Vec2(0, -9.81),
		renderSystem: new RenderSystem(canvas, camera),
	});

	setupObjects();
	//currentBox = blueBox;

	simulation.singleStep(); // Resolve overlap from random object placement
	simulation.render();
}

function setupTest() {

	blueBox = makeBox(new Vec2(20, 20), 'blue');
	greenBox = makeBox(new Vec2(35, 35), 'green');

	function makeBox(position: Vec2, color: string): number {
		const e = addEntity(world);

		addComponent(world, Transform, e);
		Transform.position[e] = position;
		Transform.rotation[e] = 0;

		addComponent(world, Collider, e);
		Collider.restitution[e] = 0.5;

		addComponent(world, Rigidbody, e);
		Rigidbody.velocity[e] = new Vec2(0, 0);
		Rigidbody.mass[e] = 1;
		Rigidbody.angularVelocity[e] = 0;

		addComponent(world, Shape, e);
		Shape.geometry[e] = new BoxGeometry(1.5);

		addComponent(world, Renderable, e);
		Renderable.color[e] = color;
		Renderable.debug[e] = true;
		Renderable.isColliding[e] = false;

		return e;
	}
}

function setupObjects() {
	const NUM_OBJECTS = 25;

	for (let i = 0; i < NUM_OBJECTS; i++) {
		const radius = Math.random() * 3 + 1.5;
		const pX = getRandomIntInclusive(radius, WIDTH_IN_M - radius);
		const pY = getRandomIntInclusive(radius, HEIGHT_IN_M - radius);
		// const r = getRandomIntInclusive(0, 255).toString(16).padStart(2, '0');
		// const g = getRandomIntInclusive(0, 255).toString(16).padStart(2, '0');
		// const b = getRandomIntInclusive(0, 255).toString(16).padStart(2, '0');
		const e = addEntity(world);

		addComponent(world, Transform, e);
		Transform.position[e] = new Vec2(pX, pY);
		Transform.rotation[e] = getRandomIntInclusive(0, 180);

		addComponent(world, Collider, e);
		Collider.restitution[e] = 0.5;

		addComponent(world, Rigidbody, e);
		Rigidbody.velocity[e] = new Vec2(getRandomIntInclusive(-8, 8), getRandomIntInclusive(9, 29));
		Rigidbody.mass[e] = 1;
		//Rigidbody.angularVelocity[e] = getRandomIntInclusive(-180, 180) * Math.PI / 180;
		Rigidbody.angularVelocity[e] = 0;

		addComponent(world, Shape, e);
		if (getRandomIntInclusive(0, 1)) {
			Shape.geometry[e] = new BoxGeometry(radius);
		} else {
			Shape.geometry[e] = new CircleGeometry(radius);
		}

		addComponent(world, Renderable, e);
		Renderable.color[e] = 'green';
		Renderable.strokeColor[e] = 'white';
		Renderable.debug[e] = true;
	}
}

function getRandomIntInclusive(min: number, max: number) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1) + min);
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

window.addEventListener('keydown', (event: KeyboardEvent) => {
	event.preventDefault();

	switch (event.key) {
		case '1': {
			currentBox = blueBox;
			update();
			break;
		}
		case '2': {
			currentBox = greenBox;
			update();
			break;
		}
		case 'ArrowLeft': {
			Transform.position[currentBox].addX(event.ctrlKey ? -0.05 : -1);
			update();
			break;
		}
		case 'ArrowRight': {
			Transform.position[currentBox].addX(event.ctrlKey ? 0.05 : 1);
			update();
			break;
		}
		case 'ArrowUp': {
			Transform.position[currentBox].addY(event.ctrlKey ? 0.05 : 1);
			update();
			break;
		}
		case 'ArrowDown': {
			Transform.position[currentBox].addY(event.ctrlKey ? -0.05 : -1);
			update();
			break;
		}
		case '+': {
			Transform.rotation[currentBox] += (event.ctrlKey ? .5 : 3) * Math.PI / 180;
			update();
			break;
		}
		case '-': {
			Transform.rotation[currentBox] -= (event.ctrlKey ? .5 : 3) * Math.PI / 180;
			update();
			break;
		}
		case 'Home': {
			camera.position.x = WIDTH_IN_M / 2;
			camera.position.y = HEIGHT_IN_M / 2;
			camera.scale = CANVAS_WIDTH / WIDTH_IN_M;
			update();
			break;
		}
	}

	function update() {
		if (!simulation.isRunning()) {
			simulation.singleStep();
			simulation.render();
		}
	}
});

document.addEventListener('wheel', (event: WheelEvent) => {
	event.preventDefault();

	// Adjust scale
	const ZOOM_FACTOR = 1.05;
	if (event.deltaY < 0) {
		camera.scale *= ZOOM_FACTOR;
	} else {
		camera.scale /= ZOOM_FACTOR;
	}

	if (!simulation.isRunning()) {
		simulation.render();
	}
}, {passive: false});

/* ======================================= */

// Camera drag state
interface DragState {
	isDragging: boolean;
	lastX: number;
	lastY: number;
}

const dragState: DragState = {
	isDragging: false,
	lastX: 0,
	lastY: 0
};

// Add these event listeners after your existing event listeners
document.addEventListener('mousedown', (event: MouseEvent) => {
	dragState.isDragging = true;
	dragState.lastX = event.clientX;
	dragState.lastY = event.clientY;
});

document.addEventListener('mousemove', (event: MouseEvent) => {
	if (!dragState.isDragging) return;

	// Convert mouse movement to world space
	const deltaX = (event.clientX - dragState.lastX) / camera.scale;
	const deltaY = (event.clientY - dragState.lastY) / camera.scale;
	camera.position.add(new Vec2(-deltaX, deltaY));

	dragState.lastX = event.clientX;
	dragState.lastY = event.clientY;

	if (!simulation.isRunning()) {
		simulation.render();
	}
});

document.addEventListener('mouseup', () => {
	dragState.isDragging = false;
});