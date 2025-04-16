import {Vec2} from './vec2';
import {Canvas} from './canvas';
import {Camera} from './camera';
import {World} from './world';
import {SimBody} from './sim-body';
import {CircleGeometry} from './geometry/circle-geometry';
import {PathGeometry} from './geometry/path-geometry';
import {EdgeGeometry} from './geometry/edge-geometry';

export interface SimulationState {
	world: World
	canvas: Canvas
	camera: Camera
	tDelta?: number
	substeps?: number
}

export class Simulation {
	private readonly world: World;
	private readonly canvas: Canvas;
	private readonly camera: Camera;
	private tDelta: number;
	private substeps: number;
	private running = false;

	constructor(initialState: SimulationState) {
		const {
			world,
			canvas,
			camera,
			tDelta = 1 / 60,
			substeps = 8,
		} = initialState;

		this.world = world;
		this.canvas = canvas;
		this.camera = camera;
		this.tDelta = tDelta;
		this.substeps = substeps;
	}

	isRunning() {
		return this.running;
	}

	start() {
		this.running = true;
		this.mainLoop();
	}

	stop() {
		this.running = false;
	}

	singleStep() {
		this.running = true;
		this.mainLoop();
		this.running = false;
	}

	// Main loop
	private mainLoop = () => {
		if (!this.running) {
			return;
		}

		this.update();
		this.render();
		window.requestAnimationFrame(this.mainLoop);
	};

	private update() {
		for (let i = 0; i < this.substeps; i++) {
			this.world.step(this.tDelta / this.substeps);
		}
	}

	render() {
		const {canvas, world} = this;

		canvas.clear();
		[...world.staticBodies, ...world.dynamicBodies].forEach(b => this.renderBody(b));
	}

	private worldToCanvas(v: Vec2): Vec2 {
		const {camera, canvas} = this;

		// Convert world coordinates to camera space
		const cameraSpace = camera.transform(v);

		// Canvas space has a top left origin
		return new Vec2(cameraSpace.x, canvas.height - cameraSpace.y);
	}

	renderBody(body: SimBody) {
		const {camera, canvas} = this;
		const {position, geometry} = body;

		if (geometry instanceof CircleGeometry) {
			canvas.drawCircle({
				position: this.worldToCanvas(position),
				radius: geometry.radius * camera.scale,
				color: '#2f2',
			});

		} else if (geometry instanceof PathGeometry) {
			canvas.drawPath({
				points: geometry.verticies.map(p => this.worldToCanvas(p)),
				color: '#2f2',
			});

		} else if (geometry instanceof EdgeGeometry) {
			canvas.drawLine({
				p1: this.worldToCanvas(geometry.p1),
				p2: this.worldToCanvas(geometry.p2),
				width: 1,
				color: '#2f2',
			});

		}
	}
}
