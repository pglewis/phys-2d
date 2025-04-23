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

export class RenderSystem implements System {
	constructor(
		private readonly canvas: Canvas,
		private readonly camera: Camera
	) { }

	private worldToCanvas(v: Vec2): Vec2 {
		const cameraSpace = this.camera.transform(v);
		return new Vec2(cameraSpace.x, this.canvas.height - cameraSpace.y);
	}

	update(world: object): void {
		this.canvas.clear();

		const renderables = defineQuery([Transform, Shape, Renderable])(world);
		for (const e of renderables) {
			const geometry = Shape.geometry[e];
			const position = Transform.position[e];

			switch (true) {
				case (geometry instanceof CircleGeometry): {
					this.canvas.drawCircle({
						position: this.worldToCanvas(position),
						radius: geometry.radius * this.camera.scale,
						color: Renderable.color[e],
						rotation: Transform.rotation[e],
						debug: Renderable.debug[e],
						filled: Renderable.filled[e],
					});
					break;
				}
				case (geometry instanceof PathGeometry): {
					this.canvas.drawPath({
						points: geometry.verticies.map(p => this.worldToCanvas(p)),
						color: Renderable.color[e],
					});
					break;
				}
				case (geometry instanceof EdgeGeometry): {
					this.canvas.drawLine({
						p1: this.worldToCanvas(geometry.p1),
						p2: this.worldToCanvas(geometry.p2),
						width: 1,
						color: Renderable.color[e],
					});
					break;
				}
			}
		}
	}
}
