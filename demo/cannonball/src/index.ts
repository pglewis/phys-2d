import {Vec2} from 'p2d/src/vec2';
import {Canvas} from 'p2d/src/canvas';
import {Camera} from 'p2d/src/camera';

const simMinWidth = 20.0;
const gravity = new Vec2(0, -9.8);

const canvas = new Canvas({
	parent: document.getElementById('canvas-container') as HTMLElement,
	width: 720,
	height: 500
});

const camera = new Camera({
	position: Vec2.zero(),
	scale: canvas.height / simMinWidth,
});

const ball = {
	radius: 0.2,
	position: new Vec2(0.2, 0.2),
	velocity: new Vec2(10.0, 15.0),
};

function worldToCanvas(v: Vec2): Vec2 {
	const cameraSpace = camera.transform(v);

	// Canvas space has a top left origin
	return new Vec2(cameraSpace.x, canvas.height - cameraSpace.y);
}

function draw() {
	canvas.clear();

	canvas.drawCircle({
		position: worldToCanvas(ball.position),
		radius: ball.radius * camera.scale,
		color: '#f00',
	});
}

function simulate(tDelta: number) {
	ball.velocity.addMult(gravity, tDelta);
	ball.position.addMult(ball.velocity, tDelta);

	if (ball.position.x < 0.0) {
		ball.position.x = 0.0;
		ball.velocity.x = -ball.velocity.x;
	}
	if (ball.position.x > canvas.width / camera.scale) {
		ball.position.x = canvas.width / camera.scale;
		ball.velocity.x = -ball.velocity.x;
	}
	if (ball.position.y < 0.0) {
		ball.position.y = 0.0;
		ball.velocity.y = -ball.velocity.y;
	}
}

function update() {
	simulate(1.0 / 60.0);
	draw();
	requestAnimationFrame(update);
}

update();
