export type CanvasProps = {
	parent?: HTMLElement;
	width?: number
	height?: number
};

export type CircleProps = {
	position: {x: number, y: number}
	radius: number
	color?: string | CanvasGradient | CanvasPattern
	filled?: boolean
};

export type RectProps = {
	x: number
	y: number
	width: number
	height: number
	color?: string | CanvasGradient | CanvasPattern
	filled?: boolean
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
		const {ctx} = this;
		const {
			position,
			radius,
			color = '#000',
			filled = true,
		} = props;

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

	drawRect(props: RectProps) {
		const {ctx} = this;
		const {
			x, y,
			width, height,
			color = '#000',
			filled = true
		} = props;

		ctx.beginPath();
		ctx.rect(x, y, width, height);
		ctx.closePath();

		if (filled) {
			ctx.fillStyle = color;
			ctx.fill();
		} else {
			ctx.strokeStyle = color;
			ctx.stroke();
		}
	}
}
