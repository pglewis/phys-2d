export type CanvasProps = {
	parent?: HTMLElement;
	width?: number;
	height?: number;
};

export interface DebuggableShape {
	rotation?: number;
	color?: string | CanvasGradient | CanvasPattern;
	strokeColor?: string | CanvasGradient | CanvasPattern;
	debug?: boolean;
}

export interface LineProps extends DebuggableShape {
	p1: {x: number, y: number};
	p2: {x: number, y: number};
	width: number;
};

export interface RectProps extends DebuggableShape {
	topLeft: {x: number, y: number};
	width: number;
	height: number;
	filled?: boolean;
};

export interface CircleProps extends DebuggableShape {
	position: {x: number, y: number};
	radius: number;
	filled?: boolean;
};

export interface PathProps extends DebuggableShape {
	points: {x: number, y: number}[];
	width?: number;
}

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

	addEventListener<K extends keyof HTMLElementEventMap>(
		type: K,
		listener: (ev: HTMLElementEventMap[K]) => void,
		options?: boolean | AddEventListenerOptions
	): void {
		this.canvas.addEventListener(type, listener, options);
	}

	clear() {
		this.ctx.clearRect(0, 0, this.width, this.height);
	}

	drawLine(props: LineProps) {
		const {ctx} = this;
		const {
			p1,
			p2,
			width,
			color = '#000',
		} = props;

		ctx.save();

		ctx.strokeStyle = color;
		ctx.lineWidth = width;
		ctx.beginPath();
		ctx.moveTo(p1.x, p1.y);
		ctx.lineTo(p2.x, p2.y);
		ctx.closePath();
		ctx.stroke();

		ctx.restore();
	}

	drawRect(props: RectProps) {
		const {ctx} = this;
		const {
			topLeft,
			width,
			height,
			rotation = 0,
			color = '#000',
			strokeColor = color,
			filled = true
		} = props;

		ctx.save();

		// Translate the origin to the object center, rotate, reverse
		ctx.translate(topLeft.x + width / 2, topLeft.y + height / 2);
		ctx.rotate(rotation);
		ctx.translate(-(topLeft.x + width / 2), -(topLeft.y + height / 2));

		ctx.beginPath();
		ctx.rect(topLeft.x, topLeft.y, width, height);
		ctx.closePath();

		if (filled) {
			ctx.fillStyle = color;
			ctx.fill();
		}

		if ((strokeColor !== color) || !filled) {
			ctx.strokeStyle = strokeColor;
			ctx.stroke();
		}

		ctx.restore();
	}

	drawCircle(props: CircleProps) {
		const {ctx} = this;
		const {
			position,
			radius,
			rotation = 0,
			color = '#000',
			strokeColor = color,
			filled = true,
			debug = false,
		} = props;

		ctx.save();

		ctx.beginPath();
		ctx.arc(position.x, position.y, radius, 0.0, 2.0 * Math.PI);
		ctx.closePath();

		if (filled) {
			ctx.fillStyle = color;
			ctx.fill();
		}

		if ((strokeColor !== color) || !filled) {
			ctx.strokeStyle = strokeColor;
			ctx.stroke();
		}

		if (debug) {
			// Create contrasting color by inverting the fill color
			let debugStrokeColor = '#fff';  // default to white

			if (typeof color === 'string' && color.startsWith('#')) {
				// Convert hex to RGB and invert
				const hex = color.slice(1);
				const r = parseInt(hex.slice(0, 2), 16);
				const g = parseInt(hex.slice(2, 4), 16);
				const b = parseInt(hex.slice(4, 6), 16);
				// Calculate perceived brightness using relative luminance
				// See: https://www.w3.org/TR/WCAG20/#relativeluminancedef
				const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
				debugStrokeColor = luminance < 0.5 ? '#ffffff' : '#000000';
			}

			// Draw the rotation line
			ctx.beginPath();
			ctx.moveTo(position.x, position.y);
			ctx.lineTo(
				position.x + radius * Math.cos(rotation),
				position.y + radius * Math.sin(rotation)
			);
			ctx.strokeStyle = debugStrokeColor;
			ctx.stroke();
		}

		ctx.restore();
	}

	drawPath(props: PathProps) {
		const {ctx} = this;
		const {
			points,
			width = 1,
			color = '#000',
		} = props;

		ctx.save();
		ctx.lineWidth = width;
		ctx.strokeStyle = color;

		ctx.beginPath();
		ctx.moveTo(points[0].x, points[0].y);
		for (let i = 1; i < points.length; i++) {
			const v = points[i];
			ctx.lineTo(v.x, v.y);
		}
		ctx.stroke();

		ctx.restore();
	}
}
