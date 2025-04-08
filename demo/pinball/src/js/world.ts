import {Vec2} from 'p2d-vec2';
import {Ball} from './ball';
import {Bumper} from './bumper';
import {Flipper} from './flipper';
import {
	handleBallBallCollision,
	handleBallBorderCollision,
	handleBallFlipperCollision,
	handleBallObstacleCollision
} from './collisions';

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
		const {
			gravity = new Vec2(0, -1.15),
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
				handleBallBallCollision(ball, ball2);
			}

			for (let j = 0; j < this.bumpers.length; j++) {
				handleBallObstacleCollision(ball, this.bumpers[j], this);
			}

			for (let j = 0; j < this.flippers.length; j++) {
				handleBallFlipperCollision(ball, this.flippers[j]);
			}

			handleBallBorderCollision(ball, this.borderVerticies);
		}
	}
};

