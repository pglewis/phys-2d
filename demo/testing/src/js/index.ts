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
	gravity: new Vec2(0, -9.8 * Math.sin(6.5 * (Math.PI / 180))),
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

function initBodies() {
	// Typical real world table: 20.25" wide by 45" high
	// Another source: 20.37" X 36.25" for the playing surface
	//     0.5174 m wide, 0.9208 m high
	balls();
	bumpers();
	playingFieldPath();
}

function balls() {
	// Real world:
	// const ballRadius = 0.0135; // Pinball diameter of 27mm
	// const mass = 0.0806;
	const ballConfig = {
		type: BodyTypes.dynamic,
		geometry: new CircleGeometry(0.03),
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
			velocity: new Vec2(0.4, -1.3),
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

const resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;
const stepBtn = document.getElementById('step-btn') as HTMLButtonElement;
const startBtn = document.getElementById('start-btn') as HTMLButtonElement;
const stopBtn = document.getElementById('stop-btn') as HTMLButtonElement;

resetBtn.addEventListener('click', () => {
	simulation.stop();
	startBtn.disabled = false;
	stopBtn.disabled = true;
	reset();
});

stepBtn.addEventListener('click', () => {
	startBtn.disabled = false;
	stopBtn.disabled = true;
	simulation.singleStep();
});

startBtn.addEventListener('click', () => {
	startBtn.disabled = true;
	stopBtn.disabled = false;
	simulation.start();
});

stopBtn.addEventListener('click', () => {
	startBtn.disabled = false;
	stopBtn.disabled = true;
	simulation.stop();
});
stopBtn.disabled = true;