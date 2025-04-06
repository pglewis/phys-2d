import {Vec2} from 'p2d-vec2';
import {Canvas} from 'p2d-canvas';
import {Wire} from './wire';
import {Bead} from './bead';
import {World} from './world';

const PIXEL_W = 720;
const PIXEL_H = 500;

const canvas = new Canvas({
	parent: document.getElementById('canvas-container') as HTMLElement,
	width: PIXEL_W,
	height: PIXEL_H,
});

const wire = new Wire(new Vec2(PIXEL_W / 2, PIXEL_H / 2), 100);
const bead = new Bead(new Vec2(PIXEL_W / 2 + 50, PIXEL_H / 2 - 100), 10, new Vec2(0, 0));
const world = new World(new Vec2(0, 9.8), bead, wire);

let tLast = performance.now();

function draw() {
	canvas.clear();

	canvas.drawCircle({
		position: world.wire.position,
		radius: world.wire.radius,
		filled: false,
	});

	canvas.drawCircle({
		position: world.bead.position,
		radius: world.bead.radius,
	});
}

function run() {
	const now = performance.now();
	const tDelta = (now - tLast) / 1000;
	tLast = now;

	for (let step = 0; step < 5; step++) {
		world.step(tDelta);
	}
	draw();
	requestAnimationFrame(run);
}

run();
