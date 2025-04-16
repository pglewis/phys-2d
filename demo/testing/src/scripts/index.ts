import {
	Vec2,
	Canvas,
	Camera,
	Simulation,
	World,
	SimBody,
	BodyTypes,
	CircleGeometry,
	PathGeometry,
	EdgeGeometry,
} from 'p2d';

const HEIGHT_IN_M = 1.7;

const canvas = new Canvas({
	parent: document.getElementById('canvas-container') as HTMLElement,
	width: 720,
	height: 500
});

const camera = new Camera({
	position: new Vec2(),
	scale: canvas.height / HEIGHT_IN_M,
});

const world = new World({
	// table slope = 6.5 degrees, gravity = 9.8 m/s^2
	// Ignoring friction: a = g * sin(theta)
	//gravity: new Vec2(0, -9.8 * Math.sin(6.5 * (Math.PI / 180))),
	gravity: new Vec2(0, -2.8),
});

const simulation = new Simulation({world, camera, canvas});

reset();

function reset() {
	world.staticBodies = [];
	world.dynamicBodies = [];
	initBodies();
	simulation.render();
}

// --------------------------------------------------------------
// A typical real world pinball table is about 20.37" X 36.25"
// for the playing surface
// 0.5174 m wide, 0.9208 m high

function initBodies() {
	balls();
	//bumpers();
	stuff();
	playingFieldPath();
}

function balls() {
	// Real world pinball:
	// ballRadius = 0.0135; // diameter of 27mm
	// mass = 0.0806;
	const ballConfig = {
		type: BodyTypes.dynamic,
		geometry: new CircleGeometry(0.0225),
		material: {
			mass: 0.0806,
			restitution: 1,
		}
	};

	world.addBody(
		new SimBody({
			name: 'ball',
			...ballConfig,
			position: new Vec2(0.23, 1.6),
			velocity: new Vec2(0.5, -0.4),
		})
	);
}

function stuff() {
	const edgeConfig = {
		type: BodyTypes.static,
		position: new Vec2(),
		velocity: new Vec2(),
		material: {mass: Infinity, restitution: 1},
	};

	const bumperConfig = {
		type: BodyTypes.static,
		velocity: new Vec2(),
		geometry: new CircleGeometry(0.07),
		material: {mass: Infinity, restitution: 1},
	};

	world.addBody(
		new SimBody({
			name: 'Edge 1',
			geometry: new EdgeGeometry(new Vec2(0.5, 0.5), new Vec2(0.85, 0.95)),
			...edgeConfig,
		}),
		new SimBody({
			name: 'Edge 2',
			geometry: new EdgeGeometry(new Vec2(0.6, 1), new Vec2(0.3, 1.25)),
			...edgeConfig,
		}),
		new SimBody({
			name: 'bumper 1',
			position: new Vec2(0.3, 0.8),
			...bumperConfig,
		}),
		new SimBody({
			name: 'bumper 2',
			position: new Vec2(0.65, 1.5),
			...bumperConfig,
		}),
		new SimBody({
			name: 'bumper 2',
			position: new Vec2(0.18, 1.45),
			...bumperConfig,
		})
	);
}

function bumpers() {
	const bumperConfig = {
		type: BodyTypes.static,
		geometry: new CircleGeometry(0.1),
		material: {
			mass: 1,
			restitution: 1,
		}
	};

	world.addBody(
		new SimBody({
			name: 'Bumper 1',
			...bumperConfig,
			position: new Vec2(0.25, 0.6),
			velocity: new Vec2(0, 0),
		}),
		new SimBody({
			name: 'Bumper 2',
			...bumperConfig,
			position: new Vec2(0.75, 0.5),
			velocity: new Vec2(0, 0),
		}),
		new SimBody({
			name: 'Bumper 3',
			...bumperConfig,
			position: new Vec2(0.7, 1.0),
			velocity: new Vec2(0, 0),
		}),
		new SimBody({
			name: 'Bumper 4',
			...bumperConfig,
			position: new Vec2(0.2, 1.2),
			velocity: new Vec2(0, 0),
		})
	);
}

function playingFieldPath() {
	const offset = 0.02;

	const pathConfig = {
		type: BodyTypes.static,
		velocity: new Vec2(0.0, 0.0),
		material: {
			mass: 1,
			restitution: 1,
		}
	};

	world.addBody(new SimBody(
		{
			...pathConfig,
			name: 'Playing field path',
			position: new Vec2(0.0, 0.0),
			geometry: new PathGeometry([
				new Vec2(0.74, 0.25),
				new Vec2(1 - offset, 0.4),
				new Vec2(1 - offset, HEIGHT_IN_M - offset),
				new Vec2(offset, HEIGHT_IN_M - offset),
				new Vec2(offset, 0.4),
				new Vec2(0.26, 0.25),
				new Vec2(0.26, 0),
				new Vec2(0.74, 0),
			]),
		}
	));
}

const playPauseBtn = document.getElementById('play-pause-btn') as HTMLButtonElement;
const stepBtn = document.getElementById('step-btn') as HTMLButtonElement;
const resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;

resetBtn.addEventListener('click', () => {
	simulation.stop();
	playPauseBtn.textContent = '▶';
	reset();
});

stepBtn.addEventListener('click', () => {
	playPauseBtn.textContent = '▶';
	simulation.singleStep();
});

playPauseBtn.addEventListener('click', () => {

	if (!simulation.isRunning()) {
		playPauseBtn.textContent = '⏸';
		simulation.start();
	} else {
		playPauseBtn.textContent = '▶';
		simulation.stop();
	}
});
