export type CanvasProps = {
	parent?: HTMLElement;
	width?: number
	height?: number
};

export type CircleProps = {
	position: {x: number, y: number}
	radius: number
	filled?: boolean
	color?: string | CanvasGradient | CanvasPattern
};

export class Canvas {
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	width: number;
	height: number;

	constructor(props: CanvasProps = {}) {
		const {
			parent = document.body,
			width = 640,
			height = 480,
		} = props;

		this.canvas = document.createElement('canvas');
		this.canvas.id = 'canvas';
		this.canvas.width = this.width = width;
		this.canvas.height = this.height = height;
		parent.appendChild(this.canvas);

		this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
	}

	clear() {
		this.ctx.clearRect(0, 0, this.width, this.height);
	}

	drawCircle(props: CircleProps) {
		const {
			position,
			radius,
			color = '#000',
			filled = true,
		} = props;
		const {ctx} = this;

		ctx.beginPath();
		ctx.arc(position.x, position.y, radius, 0.0, 2.0 * Math.PI);
		ctx.closePath();

		if (filled) {
			ctx.fillStyle = color;
			ctx.fill();
		} else {
			ctx.strokeStyle = color;
			ctx.stroke();
		}
	}

	drawGround() {
		const {ctx, width} = this;

		ctx.beginPath();
		ctx.strokeStyle = 'rgb(240, 188, 128)';
		ctx.lineWidth = 0.4;
		ctx.moveTo(0, -0.2);
		ctx.lineTo(width, -0.2);
		ctx.stroke();
	}

	drawBob() {
		const {ctx} = this;
		const x = 2.8;
		const y = 1.98; // Bob is 1.98M tall

		ctx.beginPath();

		ctx.strokeStyle = '#4444cc';
		ctx.lineWidth = .23;

		ctx.moveTo(x, 0);
		ctx.lineTo(x, y);
		ctx.stroke();
	}

	drawBasket() {
		const {ctx} = this;
		const bottomOfBackboard = 2.84;
		const hBackboard = 1.07;
		const heightOfRim = 3.048;
		const backOfRim = 1.2192;
		const rimToBackboard = .151;
		const rimDiameter = .4572;
		const netLength = .43;

		ctx.beginPath();

		ctx.lineWidth = .03;
		ctx.strokeStyle = '#882222';

		// Draw the backboard
		ctx.moveTo(backOfRim, bottomOfBackboard);
		ctx.lineTo(backOfRim, bottomOfBackboard + hBackboard);
		ctx.stroke();

		// Draw the rim
		ctx.moveTo(backOfRim, heightOfRim);
		ctx.lineTo(backOfRim + rimDiameter + rimToBackboard, heightOfRim);
		ctx.stroke();

		// Draw the net
		ctx.moveTo(backOfRim + rimToBackboard + 0.03, heightOfRim);
		ctx.lineTo(backOfRim + rimToBackboard + 0.1 + 0.03, heightOfRim - netLength);
		ctx.stroke();
		ctx.moveTo(backOfRim + rimToBackboard + rimDiameter - 0.03, heightOfRim);
		ctx.lineTo(backOfRim + rimToBackboard + rimDiameter - 0.1 - 0.03, heightOfRim - netLength);
		ctx.stroke();

		// Draw the pole
		ctx.beginPath();
		ctx.lineWidth = .07;
		ctx.moveTo(backOfRim, heightOfRim + .25);
		ctx.lineTo(.04, 2.6);
		ctx.lineTo(.04, 0);
		ctx.stroke();
	}
}
