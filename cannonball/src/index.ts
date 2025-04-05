import {Vec2} from 'p2d-vec2';
import {Canvas} from 'p2d-canvas';
import {Camera} from 'p2d-camera';

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

function translate(v: Vec2): Vec2 {
	/**
	 * Scale and move the origin to the bottom left
	 */
	return Vec2.add(v, camera.position)
		.scaleXY(camera.scale, -camera.scale)
		.addY(canvas.height);
}

function draw() {
	canvas.clear();

	canvas.drawCircle({
		position: translate(ball.position),
		radius: ball.radius * camera.scale,
		color: '#f00',
	});
}

function simulate(tDelta: number) {
	ball.velocity.add(Vec2.scale(gravity, tDelta));
	ball.position.add(Vec2.scale(ball.velocity, tDelta));

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
