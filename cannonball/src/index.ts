import {Vec2} from 'p2d-vec2';
import {Canvas} from 'p2d-canvas';

const canvas = new Canvas({
	parent: document.getElementById('canvas-container') as HTMLElement,
	width: 720,
	height: 500
});

const ball = {
	radius: 0.2,
	position: new Vec2(0.2, 0.2),
	velocity: new Vec2(10.0, 15.0),
};

const simMinWidth = 20.0;
const cScale = Math.min(canvas.width, canvas.height) / simMinWidth;
const simWidth = canvas.width / cScale;
const simHeight = canvas.height / cScale;

function translate(v: Vec2): Vec2 {
	/**
	 * Scale and move the origin to the bottom left
	 */
	return Vec2.scaleXY(v, cScale, -cScale).addY(canvas.height);
}

function draw() {
	canvas.clear();

	canvas.ctx.fillStyle = '#FF0000';
	canvas.ctx.strokeStyle = '#FF0000';
	canvas.drawCircle(translate(ball.position), cScale * ball.radius, true);
}

function simulate() {

}

function update() {
	simulate();
	draw();
	//requestAnimationFrame(update);
}

update();