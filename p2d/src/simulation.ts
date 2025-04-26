import {Vec2} from 'p2d/src/vec2';
import {RenderSystem} from 'p2d/src/ecs/systems/render-system';
import {IntegrationSystem} from 'p2d/src/ecs/systems/integration-system';
import {CollisionSystem} from 'p2d/src/ecs/systems/collision-system';
import {System} from 'p2d/src/ecs/systems/system';

export interface SimulationProps {
	world: object;
	renderSystem: RenderSystem;
	gravity?: Vec2;
	tDelta?: number;
	substeps?: number;
}

export class Simulation {
	private world: object;
	private readonly physicsSystems: System[];
	private readonly renderSystem: System;
	private tDelta: number;
	private substeps: number;
	private running = false;
	private stepping = false;

	constructor(props: SimulationProps) {
		const {
			world,
			gravity = new Vec2(0, -9.8),
			renderSystem,
			tDelta = 1 / 60,
			substeps = 8,
		} = props;

		this.world = world;

		this.physicsSystems = [
			new IntegrationSystem(gravity),
			new CollisionSystem(),
		];

		this.renderSystem = renderSystem;
		this.tDelta = tDelta;
		this.substeps = substeps;
	}

	private mainLoop = () => {
		if (!this.running) {
			return;
		}

		this.update();
		this.render();

		if (!this.stepping) {
			window.requestAnimationFrame(this.mainLoop);
		}
	};

	private update() {
		const stepDelta = this.tDelta / this.substeps;

		for (let i = 0; i < this.substeps; i++) {
			this.physicsSystems.forEach(system => system.update(this.world, stepDelta));
		}
	}

	render() {
		this.renderSystem.update(this.world, this.tDelta);
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
		this.stepping = true;
		this.running = true;
		this.mainLoop();
		this.stepping = false;
		this.running = false;
	}
}
