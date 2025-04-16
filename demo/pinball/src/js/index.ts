import {Vec2, Canvas, Camera} from 'p2d';
import {World} from './world'; //--!! Old implementation
import {Ball} from './ball';
import {Bumper} from './bumper';
import {Flipper} from './flipper';

const resetButton = document.getElementById('reset-button') as HTMLButtonElement;
resetButton.addEventListener('click', () => reset());

const scoreElement = document.getElementById('score') as HTMLElement;

const canvas = new Canvas({
	parent: document.getElementById('canvas-container') as HTMLElement,
	width: 720,
	height: 500
});

const HEIGHT_IN_M = 1.7;

const camera = new Camera({
	position: Vec2.zero(),
	scale: canvas.height / HEIGHT_IN_M,
});

const world = new World({});

// --------------------------------------------------------------

function reset() {
	const offset = 0.02;
	world.score = 0;

	// Typical real world table: 20.25" wide by 45" high
	// Another source: 20.37" X 36.25" for the playing surface
	//     0.5174 m wide, 0.9208 m high

	// border
	world.borderVerticies = [
		new Vec2(0.74, 0.25),
		new Vec2(1 - offset, 0.4),
		new Vec2(1 - offset, HEIGHT_IN_M - offset),
		new Vec2(offset, HEIGHT_IN_M - offset),
		new Vec2(offset, 0.4),
		new Vec2(0.26, 0.25),
		new Vec2(0.26, 0),
		new Vec2(0.74, 0),
	];

	// ball
	world.balls = [];
	const ballRadius = 0.03;
	const mass = Math.PI * ballRadius * ballRadius;

	// Real world:
	// const ballRadius = 0.0135; // Pinball diameter of 27mm
	// const mass = 0.0806;

	world.balls.push(new Ball({
		radius: ballRadius,
		mass: mass,
		position: new Vec2(0.92, 0.5),
		velocity: new Vec2(-0.2, 3.5),
		restitution: 0.2,
	}));

	world.balls.push(new Ball({
		radius: ballRadius,
		mass: mass,
		position: new Vec2(0.08, 0.5),
		velocity: new Vec2(0.2, 3.5),
		restitution: 0.2,
	}));

	// bumpers
	world.bumpers = [];
	world.bumpers.push(new Bumper(0.1, new Vec2(0.25, 0.6), 2));
	world.bumpers.push(new Bumper(0.1, new Vec2(0.75, 0.5), 2));
	world.bumpers.push(new Bumper(0.12, new Vec2(0.7, 1.0), 2));
	world.bumpers.push(new Bumper(0.1, new Vec2(0.2, 1.2), 2));

	// flippers
	world.flippers = [];
	const flipperRadius = 0.03;
	const length = 0.2;
	const maxRotation = 1.0;
	const restAngle = 0.5;
	const angularVelocity = 10.0;
	const restitution = 0.0;

	const pos1 = new Vec2(0.26, 0.22);
	const pos2 = new Vec2(0.74, 0.22);

	world.flippers.push(new Flipper({
		radius: flipperRadius,
		position: pos1,
		length: length,
		restAngle: -restAngle,
		maxRotation: maxRotation,
		angularVelocity: angularVelocity,
		restitution: restitution,
	}));

	world.flippers.push(new Flipper({
		radius: flipperRadius,
		position: pos2,
		length: length,
		restAngle: Math.PI + restAngle,
		maxRotation: -maxRotation,
		angularVelocity: angularVelocity,
		restitution: restitution,
	}));
}

function worldToCanvas(v: Vec2): Vec2 {
	// World to camera space
	const cameraSpace = camera.transform(v);

	// Canvas space has a top left origin
	return new Vec2(cameraSpace.x, canvas.height - cameraSpace.y);
}

function draw() {
	const {ctx} = canvas;

	canvas.clear();

	// border
	canvas.drawPath({
		points: world.borderVerticies.map(worldToCanvas),
		width: 5
	});

	// balls
	for (let i = 0; i < world.balls.length; i++) {
		const ball = world.balls[i];
		canvas.drawCircle({
			position: worldToCanvas(ball.position),
			radius: ball.radius * camera.scale,
			color: '#202020',
		});
	}

	// bumpers
	for (let i = 0; i < world.bumpers.length; i++) {
		const bumper = world.bumpers[i];
		canvas.drawCircle({
			position: worldToCanvas(bumper.position),
			radius: bumper.radius * camera.scale,
			color: '#ff8000',
		});
	}

	// flippers
	for (let i = 0; i < world.flippers.length; i++) {
		const flipper = world.flippers[i];
		const flipperToCanvas = worldToCanvas(flipper.position);

		ctx.translate(flipperToCanvas.x, flipperToCanvas.y);
		ctx.rotate(-flipper.restAngle - flipper.sign * flipper.rotation);

		canvas.drawRect({
			topLeft: new Vec2(0, -flipper.radius * camera.scale),
			width: flipper.length * camera.scale,
			height: 2 * flipper.radius * camera.scale,
			color: '#f00',
		});

		canvas.drawCircle({
			position: Vec2.zero(),
			radius: flipper.radius * camera.scale,
			color: '#f00'
		});

		canvas.drawCircle({
			position: new Vec2(flipper.length * camera.scale, 0),
			radius: flipper.radius * camera.scale,
			color: '#f00',
		});

		ctx.resetTransform();
	}
}

function update() {
	world.simulate();
	draw();
	scoreElement.innerHTML = world.score.toString();
	requestAnimationFrame(update);
}

document.addEventListener('keydown', (event) => {
	switch (event.key) {
		case 'ArrowLeft':
			world.flippers[0].touchIdentifier = 1;
			break;
		case 'ArrowRight':
			world.flippers[1].touchIdentifier = 1;
			break;
	}
});

document.addEventListener('keyup', (event) => {
	switch (event.key) {
		case 'ArrowLeft':
			world.flippers[0].touchIdentifier = -1;
			break;
		case 'ArrowRight':
			world.flippers[1].touchIdentifier = -1;
			break;
	}
});

reset();
update();
