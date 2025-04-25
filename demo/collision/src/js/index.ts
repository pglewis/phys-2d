import {Vec2} from 'p2d/src/vec2';
import {Canvas} from 'p2d/src/canvas';
import {Camera} from 'p2d/src/camera';
import {Ball} from './ball';

const reset = document.getElementById('reset-button') as HTMLButtonElement;
reset.addEventListener('click', () => setupScene());

const slider = document.getElementById('restitution-slider') as HTMLInputElement;
slider.addEventListener('input', () => {
	physicsScene.restitution = Number(slider.value) / 10;
});

const canvas = new Canvas({
	parent: document.getElementById('canvas-container') as HTMLElement,
	width: 720,
	height: 500
});

const simMinWidth = 2.0;

const camera = new Camera({
	position: Vec2.zero(),
	scale: canvas.height / simMinWidth,
});

const simWidth = canvas.width / camera.scale;
const simHeight = canvas.height / camera.scale;

const physicsScene = {
	gravity: new Vec2(0.0, 0.0),
	tDelta: 1.0 / 60.0,
	worldSize: new Vec2(simWidth, simHeight),
	paused: true,
	balls: [] as Ball[],
	restitution: 1.0
};

function setupScene() {
	physicsScene.balls = [];
	const numBalls = 20;

	for (let i = 0; i < numBalls; i++) {
		const radius = 0.05 + Math.random() * 0.1;
		const mass = Math.PI * radius * radius;

		physicsScene.balls.push(new Ball({
			radius: radius,
			mass: mass,
			position: new Vec2(Math.random() * simWidth - radius, Math.random() * simHeight - radius),
			velocity: new Vec2(-1.0 + 2.0 * Math.random(), -1.0 + 2.0 * Math.random()),
		}));
	}
}

function worldToCanvas(v: Vec2): Vec2 {
	const cameraSpace = camera.transform(v);

	// Canvas space has a top left origin
	return new Vec2(cameraSpace.x, canvas.height - cameraSpace.y);
}

function draw() {
	canvas.clear();

	for (const ball of physicsScene.balls) {
		canvas.drawCircle({
			position: worldToCanvas(ball.position),
			radius: ball.radius * camera.scale,
			color: '#f00',
		});
	}
}

function handleBallCollision(ball1: Ball, ball2: Ball, restitution: number) {
	const dir = Vec2.subtract(ball2.position, ball1.position);
	const d = dir.length;

	if (d === 0 || d > ball1.radius + ball2.radius) {
		return;
	}

	dir.normalize();

	const corr = (ball1.radius + ball2.radius - d) / 2.0;
	ball1.position.addMult(dir, -corr);
	ball2.position.addMult(dir, corr);

	const v1 = ball1.velocity.dot(dir);
	const v2 = ball2.velocity.dot(dir);

	const m1 = ball1.mass;
	const m2 = ball2.mass;

	const newV1 = (m1 * v1 + m2 * v2 - m2 * (v1 - v2) * restitution) / (m1 + m2);
	const newV2 = (m1 * v1 + m2 * v2 - m1 * (v2 - v1) * restitution) / (m1 + m2);

	ball1.velocity.addMult(dir, newV1 - v1);
	ball2.velocity.addMult(dir, newV2 - v2);
}

function handleWallCollision(ball: Ball, worldSize: Vec2) {
	if (ball.position.x < ball.radius) {
		ball.position.x = ball.radius;
		ball.velocity.x = -ball.velocity.x;
	}
	if (ball.position.x > worldSize.x - ball.radius) {
		ball.position.x = worldSize.x - ball.radius;
		ball.velocity.x = -ball.velocity.x;
	}
	if (ball.position.y < ball.radius) {
		ball.position.y = ball.radius;
		ball.velocity.y = -ball.velocity.y;
	}

	if (ball.position.y > worldSize.y - ball.radius) {
		ball.position.y = worldSize.y - ball.radius;
		ball.velocity.y = -ball.velocity.y;
	}
}

function simulate() {
	for (let i = 0; i < physicsScene.balls.length; i++) {
		const ball1 = physicsScene.balls[i];
		ball1.simulate(physicsScene.tDelta, physicsScene.gravity);

		for (let j = i + 1; j < physicsScene.balls.length; j++) {
			const ball2 = physicsScene.balls[j];
			handleBallCollision(ball1, ball2, physicsScene.restitution);
		}

		handleWallCollision(ball1, physicsScene.worldSize);
	}
}

function update() {
	simulate();
	draw();
	requestAnimationFrame(update);
}

setupScene();
update();
