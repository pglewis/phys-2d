import {Vec2} from 'p2d/src/vec2';
import {Ball} from './ball';
import {Bumper} from './bumper';
import {Flipper} from './flipper';

export type WorldProps = {
	gravity?: Vec2
	tDelta?: number
	score?: number
};

export class World {
	gravity: Vec2;
	tDelta: number;
	score: number;
	borderVerticies = [] as Vec2[];
	balls = [] as Ball[];
	bumpers = [] as Bumper[];
	flippers = [] as Flipper[];

	constructor(props: WorldProps) {
		const {sin, PI} = Math;
		const {
			// table slope = 6.5 degrees, gravity = 9.8 m/s^2
			// Ignoring friction: a = g * sin(theta)
			gravity = new Vec2(0, -9.8 * sin(6.5 * (PI / 180))),
			tDelta = 1 / 60,
			score = 0,
		} = props;

		this.gravity = gravity;
		this.tDelta = tDelta;
		this.score = score;
	}

	simulate() {
		for (let i = 0; i < this.flippers.length; i++) {
			this.flippers[i].simulate(this.tDelta);
		}

		for (let i = 0; i < this.balls.length; i++) {
			const ball = this.balls[i];
			ball.simulate(this.tDelta, this.gravity);

			for (let j = i + 1; j < this.balls.length; j++) {
				const ball2 = this.balls[j];
				this.handleBallBallCollision(ball, ball2);
			}

			for (let j = 0; j < this.bumpers.length; j++) {
				this.handleBallBumperCollision(ball, this.bumpers[j]);
			}

			for (let j = 0; j < this.flippers.length; j++) {
				this.handleBallFlipperCollision(ball, this.flippers[j]);
			}

			this.handleBallBorderCollision(ball, this.borderVerticies);
		}
	}

	private closestPointOnSegment(p: Vec2, a: Vec2, b: Vec2) {
		const ab = Vec2.subtract(b, a);

		let t = ab.dot(ab);
		if (t === 0) {
			return a.clone();
		}

		t = Math.max(0.0, Math.min(1.0, (p.dot(ab) - a.dot(ab)) / t));

		return a.clone().addMult(ab, t);
	}

	private handleBallBallCollision(ball1: Ball, ball2: Ball) {
		const restitution = Math.min(ball1.restitution, ball2.restitution);
		const dir = Vec2.subtract(ball2.position, ball1.position);
		const d = dir.length;

		if (d == 0.0 || d > ball1.radius + ball2.radius) {
			return;
		}

		dir.normalize();

		const corr = (ball1.radius + ball2.radius - d) / 2.0;
		ball1.position.addMult(dir, -corr);
		ball2.position.addMult(dir, corr);

		const v1 = ball1.velocity.dot(dir);
		const v2 = ball2.velocity.dot(dir);

		const m1 = ball1.mass;
		const m2 = ball2.mass;

		const newV1 = (m1 * v1 + m2 * v2 - m2 * (v1 - v2) * restitution) / (m1 + m2);
		const newV2 = (m1 * v1 + m2 * v2 - m1 * (v2 - v1) * restitution) / (m1 + m2);

		ball1.velocity.addMult(dir, newV1 - v1);
		ball2.velocity.addMult(dir, newV2 - v2);
	}

	private handleBallBumperCollision(ball: Ball, bumper: Bumper) {
		const dir = Vec2.subtract(ball.position, bumper.position);
		const d = dir.length;

		if (d == 0.0 || d > ball.radius + bumper.radius) {
			return;
		}

		dir.normalize();

		const corr = ball.radius + bumper.radius - d;
		ball.position.addMult(dir, corr);

		const v = ball.velocity.dot(dir);
		ball.velocity.addMult(dir, bumper.pushVel - v);

		this.score++;
	}

	private handleBallFlipperCollision(ball: Ball, flipper: Flipper) {
		const closest = this.closestPointOnSegment(ball.position, flipper.position, flipper.getTip());
		const dir = Vec2.subtract(ball.position, closest);

		const d = dir.length;
		if (d == 0.0 || d > ball.radius + flipper.radius) {
			return;
		}

		dir.normalize();

		const corr = (ball.radius + flipper.radius - d);
		ball.position.addMult(dir, corr);

		// update velocitiy
		const radius = closest.clone();
		radius.addMult(dir, flipper.radius);
		radius.subtract(flipper.position);
		const surfaceVel = radius.perp();
		surfaceVel.scale(flipper.currentAngularVelocity);

		const v = ball.velocity.dot(dir);
		const vnew = surfaceVel.dot(dir);

		ball.velocity.addMult(dir, vnew - v);
	}

	private handleBallBorderCollision(ball: Ball, border: Vec2[]) {
		if (border.length < 3) {
			return;
		}

		// find closest segment;
		const closest = new Vec2();
		let ab = new Vec2();
		let normal = new Vec2();
		let minDist = 0.0;

		for (let i = 0; i < border.length; i++) {
			const a = border[i];
			const b = border[(i + 1) % border.length];
			const c = this.closestPointOnSegment(ball.position, a, b);

			const d = Vec2.subtract(ball.position, c);

			const dist = d.length;
			if (i === 0 || dist < minDist) {
				minDist = dist;
				closest.set(c);
				ab = Vec2.subtract(b, a);
				normal = ab.perp();
			}
		}

		// push out
		const d = Vec2.subtract(ball.position, closest);

		let dist = d.length;
		if (dist == 0.0) {
			d.set(normal);
			dist = normal.length;
		}
		d.normalize();

		if (d.dot(normal) >= 0.0) {
			if (dist > ball.radius) {
				return;
			}
			ball.position.addMult(d, ball.radius - dist);
		} else {
			ball.position.addMult(d, -(dist + ball.radius));
		}

		// update velocity
		const v = ball.velocity.dot(d);
		const vnew = Math.abs(v) * ball.restitution;
		ball.velocity.addMult(d, vnew - v);
	}
};

