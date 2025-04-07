import {Vec2} from 'p2d-vec2';
import {Canvas} from 'p2d-canvas';
import {Camera} from 'p2d-camera';
import {Ball} from './ball';
import {Obstacle} from './obstacle';
import {Flipper} from './flipper';
import {
	handleBallBallCollision,
	handleBallBorderCollision,
	handleBallFlipperCollision,
	handleBallObstacleCollision
} from './collisions';

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

const physicsScene = {
	gravity: new Vec2(0, -3),
	tDelta: 1 / 60,
	score: 0,
	paused: true,
	border: [] as Vec2[],
	balls: [] as Ball[],
	obstacles: [] as Obstacle[],
	flippers: [] as Flipper[]
};

function setupScene() {
	const offset = 0.02;
	physicsScene.score = 0;

	// border
	physicsScene.border.push(new Vec2(0.74, 0.25));
	physicsScene.border.push(new Vec2(1 - offset, 0.4));
	physicsScene.border.push(new Vec2(1 - offset, flipperHeight - offset));
	physicsScene.border.push(new Vec2(offset, flipperHeight - offset));
	physicsScene.border.push(new Vec2(offset, 0.4));
	physicsScene.border.push(new Vec2(0.26, 0.25));
	physicsScene.border.push(new Vec2(0.26, 0));
	physicsScene.border.push(new Vec2(0.74, 0));

	// ball
	{
		physicsScene.balls = [];
		const radius = 0.03;
		const mass = Math.PI * radius * radius;

		physicsScene.balls.push(new Ball({
			radius: radius,
			mass: mass,
			position: new Vec2(0.92, 0.5),
			velocity: new Vec2(-0.2, 3.5),
			restitution: 0.2,
		}));

		physicsScene.balls.push(new Ball({
			radius: radius,
			mass: mass,
			position: new Vec2(0.08, 0.5),
			velocity: new Vec2(0.2, 3.5),
			restitution: 0.2,
		}));
	}

	// obstacles
	{
		physicsScene.obstacles = [];

		physicsScene.obstacles.push(new Obstacle(0.1, new Vec2(0.25, 0.6), 2));
		physicsScene.obstacles.push(new Obstacle(0.1, new Vec2(0.75, 0.5), 2));
		physicsScene.obstacles.push(new Obstacle(0.12, new Vec2(0.7, 1.0), 2));
		physicsScene.obstacles.push(new Obstacle(0.1, new Vec2(0.2, 1.2), 2));
	}

	// flippers
	{
		const radius = 0.03;
		const length = 0.2;
		const maxRotation = 1.0;
		const restAngle = 0.5;
		const angularVelocity = 10.0;
		const restitution = 0.0;

		const pos1 = new Vec2(0.26, 0.22);
		const pos2 = new Vec2(0.74, 0.22);

		physicsScene.flippers.push(new Flipper({
			radius: radius,
			position: pos1,
			length: length,
			restAngle: -restAngle,
			maxRotation: maxRotation,
			angularVelocity: angularVelocity,
			restitution: restitution,
		}));

		physicsScene.flippers.push(new Flipper({
			radius: radius,
			position: pos2,
			length: length,
			restAngle: Math.PI + restAngle,
			maxRotation: -maxRotation,
			angularVelocity: angularVelocity,
			restitution: restitution,
		}));
	}
}

function worldToCanvas(v: Vec2): Vec2 {
	const cameraSpace = camera.transform(v);

	// Canvas space has a top left origin
	return new Vec2(cameraSpace.x, canvas.height - cameraSpace.y);
}

function draw() {
	const c = canvas.ctx;

	c.clearRect(0, 0, canvas.width, canvas.height);

	// border
	if (physicsScene.border.length >= 2) {

		c.lineWidth = 5;
		let v = worldToCanvas(physicsScene.border[0]);

		c.beginPath();
		c.moveTo(v.x, v.y);
		for (let i = 1; i < physicsScene.border.length + 1; i++) {
			v = worldToCanvas(physicsScene.border[i % physicsScene.border.length]);
			c.lineTo(v.x, v.y);
		}
		c.stroke();
		c.lineWidth = 1;
	}

	// balls
	c.fillStyle = '#202020';

	for (let i = 0; i < physicsScene.balls.length; i++) {
		const ball = physicsScene.balls[i];
		canvas.drawCircle({
			position: worldToCanvas(ball.position),
			radius: ball.radius * camera.scale,
		});
	}

	// obstacles
	for (let i = 0; i < physicsScene.obstacles.length; i++) {
		const obstacle = physicsScene.obstacles[i];
		canvas.drawCircle({
			position: worldToCanvas(obstacle.position),
			radius: obstacle.radius * camera.scale,
			color: '#ff8000',
		});
	}

	// flippers
	for (let i = 0; i < physicsScene.flippers.length; i++) {
		const flipper = physicsScene.flippers[i];
		const flipperToCanvas = worldToCanvas(flipper.position);

		c.translate(flipperToCanvas.x, flipperToCanvas.y);
		c.rotate(-flipper.restAngle - flipper.sign * flipper.rotation);

		c.fillStyle = '#FF0000';
		c.fillRect(0.0, -flipper.radius * camera.scale,
			flipper.length * camera.scale, 2.0 * flipper.radius * camera.scale);

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
		c.resetTransform();
	}
}

function simulate() {
	for (let i = 0; i < physicsScene.flippers.length; i++)
		physicsScene.flippers[i].simulate(physicsScene.tDelta);

	for (let i = 0; i < physicsScene.balls.length; i++) {
		const ball = physicsScene.balls[i];
		ball.simulate(physicsScene.tDelta, physicsScene.gravity);

		for (let j = i + 1; j < physicsScene.balls.length; j++) {
			const ball2 = physicsScene.balls[j];
			handleBallBallCollision(ball, ball2);
		}

		for (let j = 0; j < physicsScene.obstacles.length; j++) {
			handleBallObstacleCollision(ball, physicsScene.obstacles[j], physicsScene);
		}

		for (let j = 0; j < physicsScene.flippers.length; j++) {
			handleBallFlipperCollision(ball, physicsScene.flippers[j]);
		}

		handleBallBorderCollision(ball, physicsScene.border);
	}
}

function update() {
	simulate();
	draw();
	scoreElement.innerHTML = physicsScene.score.toString();
	requestAnimationFrame(update);
}

canvas.canvas.addEventListener('touchstart', onTouchStart, false);
canvas.canvas.addEventListener('touchend', onTouchEnd, false);

canvas.canvas.addEventListener('mousedown', onMouseDown, false);
canvas.canvas.addEventListener('mouseup', onMouseUp, false);

function onTouchStart(event: TouchEvent) {
	for (let i = 0; i < event.touches.length; i++) {
		const touch = event.touches[i];

		const rect = canvas.canvas.getBoundingClientRect();
		const touchPos = new Vec2(
			(touch.clientX - rect.left) / camera.scale,
			simHeight - (touch.clientY - rect.top) / camera.scale);

		for (let j = 0; j < physicsScene.flippers.length; j++) {
			const flipper = physicsScene.flippers[j];
			if (flipper.select(touchPos))
				flipper.touchIdentifier = touch.identifier;
		}
	}
}

function onTouchEnd(event: TouchEvent) {

	for (let i = 0; i < physicsScene.flippers.length; i++) {
		const flipper = physicsScene.flippers[i];

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

function onMouseDown(event: MouseEvent) {
	const rect = canvas.canvas.getBoundingClientRect();
	const mousePos = new Vec2(
		(event.clientX - rect.left) / camera.scale,
		simHeight - (event.clientY - rect.top) / camera.scale
	);

	for (let j = 0; j < physicsScene.flippers.length; j++) {
		const flipper = physicsScene.flippers[j];
		if (flipper.select(mousePos)) {
			flipper.touchIdentifier = 0;
		}
	}
}

function onMouseUp() {
	for (let i = 0; i < physicsScene.flippers.length; i++) {
		physicsScene.flippers[i].touchIdentifier = -1;
	}
}

setupScene();
update();
