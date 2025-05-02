import {Vec2} from 'p2d/src/vec2';
import {Canvas} from 'p2d/src/canvas';
import {Camera} from 'p2d/src/camera';
import {Transform} from 'p2d/src/ecs/components/transform';
import {Shape} from 'p2d/src/ecs/components/shape';
import {Renderable} from 'p2d/src/ecs/components/renderable';
import {CircleGeometry} from 'p2d/src/geometry/circle-geometry';
import {PathGeometry} from 'p2d/src/geometry/path-geometry';
import {EdgeGeometry} from 'p2d/src/geometry/edge-geometry';
import {System} from 'p2d/src/ecs/systems/system';
import {defineQuery} from 'bitecs';
import {BoxGeometry} from 'p2d/src/geometry/box-geometry';
import {Geometry, getAABB} from 'p2d/src/geometry/geometry';
import {Rigidbody} from 'p2d/src/ecs/components/rigidbody';

export class RenderSystem implements System {
	constructor(
		private readonly canvas: Canvas,
		private readonly camera: Camera
	) { }

	worldToCanvas(v: Vec2): Vec2 {
		const cameraSpace = this.camera.transform(v);

		// camera space is at the screen center, so translate to 0, 0
		return new Vec2(
			cameraSpace.x + this.canvas.width / 2,
			this.canvas.height / 2 - cameraSpace.y
		);
	}

	update(world: object): void {
		this.canvas.clear();

		const renderables = defineQuery([Transform, Shape, Renderable])(world);

		for (const e of renderables) {
			const geometry = Shape.geometry[e];

			switch (true) {
				case (geometry instanceof CircleGeometry):
					this.renderCircle(e, geometry);
					break;

				case (geometry instanceof BoxGeometry):
					this.renderBox(e, geometry);
					break;

				case (geometry instanceof PathGeometry):
					this.renderPath(e, geometry);
					break;

				case (geometry instanceof EdgeGeometry):
					this.renderEdge(e, geometry);
					break;
			}

			if (Renderable.debug[e]) {
				this.renderDebug(e, geometry);
			}
		}
	}

	private renderCircle(e: number, geometry: CircleGeometry): void {
		const position = Transform.position[e];
		const scale = this.camera.scale;
		const radius = geometry.radius;

		this.canvas.drawCircle({
			position: this.worldToCanvas(position),
			radius: radius * scale,
			color: Renderable.color[e],
			strokeColor: (Renderable.debug[e] && Renderable.isColliding[e]) ? 'red' : Renderable.strokeColor[e],
			rotation: -Transform.rotation[e],
			debug: Renderable.debug[e],
			filled: Renderable.filled[e],
		});
	}

	private renderBox(e: number, geometry: BoxGeometry): void {
		const position = Transform.position[e];
		const scale = this.camera.scale;
		const size = geometry.size;

		const topLeft = Vec2.add(position, new Vec2(-size, size));
		this.canvas.drawRect({
			topLeft: this.worldToCanvas(topLeft),
			height: size * scale * 2,
			width: size * scale * 2,
			rotation: -Transform.rotation[e],
			color: Renderable.color[e],
			strokeColor: (Renderable.debug[e] && Renderable.isColliding[e]) ? 'red' : Renderable.strokeColor[e],
			filled: Renderable.filled[e],
		});

	}

	private renderPath(e: number, geometry: PathGeometry): void {
		this.canvas.drawPath({
			points: geometry.verticies.map(p => this.worldToCanvas(p)),
			color: Renderable.color[e],
		});
	}

	private renderEdge(e: number, geometry: EdgeGeometry): void {
		this.canvas.drawLine({
			p1: this.worldToCanvas(geometry.p1),
			p2: this.worldToCanvas(geometry.p2),
			width: 1,
			color: Renderable.color[e],
		});
	}

	private renderDebug(e: number, geometry: Geometry): void {
		const position = Transform.position[e];

		// AABB
		const aabb = getAABB(position, geometry);
		this.canvas.drawRect({
			topLeft: this.worldToCanvas(new Vec2(aabb.min.x, aabb.max.y)),
			height: (aabb.max.y - aabb.min.y) * this.camera.scale,
			width: (aabb.max.x - aabb.min.x) * this.camera.scale,
			rotation: 0,
			color: 'green',
			filled: false,
		});

		// velocity
		if (Renderable.debug[e]) {
			const velocity = Rigidbody.velocity[e];
			const p1 = position;
			const p2 = Vec2.add(p1, Vec2.scale(velocity, 0.5));
			this.canvas.drawLine({
				p1: this.worldToCanvas(p1),
				p2: this.worldToCanvas(p2),
				width: 1,
				color: 'gray',
			});
		}
	}
}
