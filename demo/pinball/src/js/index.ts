import {Vec2} from 'p2d-vec2';
import {Canvas} from 'p2d-canvas';
import {Camera} from 'p2d-camera';
import {Ball} from './ball';
import {Bumper} from './bumper';
import {Flipper} from './flipper';
import {World} from './world';

const reset = document.getElementById('reset-button') as HTMLButtonElement;
reset.addEventListener('click', () => setupScene());

const scoreElement = document.getElementById('score') as HTMLElement;

const canvas = new Canvas({
	parent: document.getElementById('canvas-container') as HTMLElement,
	width: 720,
	height: 500
});

const flipperHeight = 1.7;

const camera = new Camera({
	position: Vec2.zero(),
	scale: canvas.height / flipperHeight,
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const simWidth = canvas.width / camera.scale;
const simHeight = canvas.height / camera.scale;

// --------------------------------------------------------------

const world = new World({});

function setupScene() {
	const offset = 0.02;
	world.score = 0;

	// border
	world.borderVerticies = [];
	world.borderVerticies.push(new Vec2(0.74, 0.25));
	world.borderVerticies.push(new Vec2(1 - offset, 0.4));
	world.borderVerticies.push(new Vec2(1 - offset, flipperHeight - offset));
	world.borderVerticies.push(new Vec2(offset, flipperHeight - offset));
	world.borderVerticies.push(new Vec2(offset, 0.4));
	world.borderVerticies.push(new Vec2(0.26, 0.25));
	world.borderVerticies.push(new Vec2(0.26, 0));
	world.borderVerticies.push(new Vec2(0.74, 0));

	// ball
	world.balls = [];
	const ballRadius = 0.03;
	const mass = Math.PI * ballRadius * ballRadius;

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
	const cameraSpace = camera.transform(v);

	// Canvas space has a top left origin
	return new Vec2(cameraSpace.x, canvas.height - cameraSpace.y);
}

function draw() {
	const {ctx} = canvas;

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// border
	if (world.borderVerticies.length >= 2) {
		ctx.lineWidth = 5;
		let v = worldToCanvas(world.borderVerticies[0]);

		ctx.beginPath();
		ctx.moveTo(v.x, v.y);
		for (let i = 1; i < world.borderVerticies.length + 1; i++) {
			v = worldToCanvas(world.borderVerticies[i % world.borderVerticies.length]);
			ctx.lineTo(v.x, v.y);
		}
		ctx.stroke();
		ctx.lineWidth = 1;
	}

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
			x: 0,
			y: -flipper.radius * camera.scale,
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

canvas.addEventListener('touchstart', onTouchStart, false);
canvas.addEventListener('touchend', onTouchEnd, false);

function onTouchStart(event: TouchEvent) {
	for (let i = 0; i < event.touches.length; i++) {
		const touch = event.touches[i];

		const rect = canvas.canvas.getBoundingClientRect();
		const touchPos = new Vec2(
			(touch.clientX - rect.left) / camera.scale,
			simHeight - (touch.clientY - rect.top) / camera.scale);

		for (let j = 0; j < world.flippers.length; j++) {
			const flipper = world.flippers[j];
			if (flipper.select(touchPos))
				flipper.touchIdentifier = touch.identifier;
		}
	}
}

function onTouchEnd(event: TouchEvent) {
	for (let i = 0; i < world.flippers.length; i++) {
		const flipper = world.flippers[i];

		if (flipper.touchIdentifier < 0) {
			continue;
		}

		let found = false;
		for (let j = 0; j < event.touches.length; j++) {
			if (event.touches[j].identifier === flipper.touchIdentifier) {
				found = true;
			}
		}

		if (!found) {
			flipper.touchIdentifier = -1;
		}
	}
}

canvas.addEventListener('mousedown', (event) => {
	const rect = canvas.canvas.getBoundingClientRect();
	const mousePos = new Vec2(
		(event.clientX - rect.left) / camera.scale,
		simHeight - (event.clientY - rect.top) / camera.scale
	);

	for (let j = 0; j < world.flippers.length; j++) {
		const flipper = world.flippers[j];
		if (flipper.select(mousePos)) {
			flipper.touchIdentifier = 0;
		}
	}
});

canvas.addEventListener('mouseup', () => {
	for (let i = 0; i < world.flippers.length; i++) {
		world.flippers[i].touchIdentifier = -1;
	}
});

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

setupScene();
update();
