import {Vec2} from 'p2d/src/vec2';
import {Simulation} from 'p2d/src/simulation';
import {Canvas} from 'p2d/src/canvas';
import {Camera, EdgeGeometry, PathGeometry} from 'p2d';
import * as ECS from 'p2d/src/ecs/entity';
import {RenderSystem} from 'p2d/src/ecs/systems/render-system';
import {createTransform, createRigidbody, createShape, createRenderable} from 'p2d/src/ecs/components/factories';
import {createBumper, createEdge, createPinball} from './objects';

const HEIGHT_IN_M = 1.7;

const canvas = new Canvas({
	parent: document.getElementById('canvas-container') as HTMLElement,
	width: 720,
	height: 500
});

const camera = new Camera({
	position: new Vec2(0, 0),
	scale: canvas.height / HEIGHT_IN_M
});

const simulation = new Simulation({
	// table slope = 6.5 degrees, gravity = 9.8 m/s^2
	// Ignoring friction: a = g * sin(theta)
	gravity: new Vec2(0, -9.8 * Math.sin(6.5 * (Math.PI / 180))),
	renderSystem: new RenderSystem(canvas, camera)
});

reset();

function reset() {
	ECS.clearEntities();

	playingField();
	bumpers();
	edges();
	pinballs();

	simulation.render();
}

// ------------------------------------------------------

function bumpers() {
	createBumper({
		position: new Vec2(0.3, 0.8),
		color: '#f00'
	});

	createBumper({
		position: new Vec2(0.65, 1.5),
		color: '#0f0'
	});

	createBumper({
		position: new Vec2(0.18, 1.45),
		color: '#00f'
	});
}

function edges() {
	createEdge({
		geometry: new EdgeGeometry(new Vec2(0.5, 0.5), new Vec2(0.85, 0.95)),
		color: '#ff0'
	});

	createEdge({
		geometry: new EdgeGeometry(new Vec2(0.6, 1), new Vec2(0.3, 1.25)),
		color: '#0ff'
	});
}

function pinballs() {
	createPinball({
		position: new Vec2(0.23, 1.6),
		velocity: new Vec2(0.5, -1.5),
	});

	createPinball({
		position: new Vec2(0.4, 0.6),
		velocity: new Vec2(0.5, -0.5),
		radius: 0.04,
		mass: 0.16,
		color: '#aac',
	});

	createPinball({
		position: new Vec2(0.9, 1.6),
		velocity: new Vec2(0, 0),
		radius: 0.08,
		mass: 0.48,
		color: '#caa',
	});
}

function playingField() {
	const offset = 0.02;
	const points = [
		new Vec2(0.74, 0.25),
		new Vec2(1 - offset, 0.4),
		new Vec2(1 - offset, HEIGHT_IN_M - offset),
		new Vec2(offset, HEIGHT_IN_M - offset),
		new Vec2(offset, 0.4),
		new Vec2(0.26, 0.25),
		new Vec2(0.26, 0),
		new Vec2(0.74, 0)
	];

	ECS.buildEntity()
		.with('transform', createTransform())
		.with('rigidbody', createRigidbody({
			mass: Infinity,
			restitution: 1,
			isKinematic: true
		}))
		.with('shape', createShape(new PathGeometry(points)))
		.with('renderable', createRenderable({color: '#f0f'}))
		.build();
}

const playPauseBtn = document.getElementById('play-pause-btn') as HTMLButtonElement;
const stepBtn = document.getElementById('step-btn') as HTMLButtonElement;
const resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;

playPauseBtn.addEventListener('click', () => {
	if (!simulation.isRunning()) {
		playPauseBtn.textContent = '⏸';
		simulation.start();
	} else {
		playPauseBtn.textContent = '▶';
		simulation.stop();
	}
});

stepBtn.addEventListener('click', () => {
	playPauseBtn.textContent = '▶';
	simulation.singleStep();
});

resetBtn.addEventListener('click', () => {
	playPauseBtn.textContent = '▶';
	simulation.stop();
	reset();
});
