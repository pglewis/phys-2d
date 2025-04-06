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

function translate(v: Vec2): Vec2 {
	/**
	 * Scale and move the origin to the bottom left
	 */
	return Vec2.add(v, camera.position) // These are in world space
		.scaleXY(camera.scale, -camera.scale) // Scaled with Y flipped
		.addY(canvas.height); // Y is flipped, we need to offset by the height
}

function draw() {
	canvas.clear();
}

function simulate(tDelta: number) {
}

function update() {
	simulate(1.0 / 60.0);
	draw();
	//requestAnimationFrame(update);
}

update();
