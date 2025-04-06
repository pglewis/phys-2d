export class Vec2 {
	x: number;
	y: number;

	constructor(x: number = 0, y: number = 0) {
		this.x = x;
		this.y = y;
	}

	static zero(): Vec2 {
		return new Vec2(0, 0);
	}

	static one(): Vec2 {
		return new Vec2(1, 1);
	}

	static fromDegrees(deg: number, scale: number = 1): Vec2 {
		return Vec2.fromRadians(deg * Math.PI / 180, scale);
	}

	static fromRadians(rad: number, scale: number = 1): Vec2 {
		return Vec2.scale(new Vec2(Math.cos(rad), Math.sin(rad)), scale);
	}

	static fromArray([x, y]: [number, number]): Vec2 {
		return new Vec2(x, y);
	}

	static add(v1: Vec2, v2: Vec2) {
		return new Vec2(v1.x + v2.x, v1.y + v2.y);
	}

	static addX(v: Vec2, x: number): Vec2 {
		return new Vec2(v.x + x, v.y);
	}

	static addY(v: Vec2, y: number): Vec2 {
		return new Vec2(v.x, v.y + y);
	}

	static subtract(v1: Vec2, v2: Vec2) {
		return new Vec2(v1.x - v2.x, v1.y - v2.y);
	}

	static sum(...vectors: Vec2[]): Vec2 {
		let sum = Vec2.zero();

		for (const thisVector of vectors) {
			sum = Vec2.add(sum, thisVector);
		}

		return sum;
	}

	static scale(v: Vec2, scale: number): Vec2 {
		return new Vec2(v.x * scale, v.y * scale);
	}

	static scaleXY(v: Vec2, xScale: number, yScale: number): Vec2 {
		return new Vec2(v.x * xScale, v.y * yScale);
	}

	static normalize(v: Vec2): Vec2 {
		return new Vec2(v.x / v.magnitude, v.y / v.magnitude);
	}

	clone() {
		return new Vec2(this.x, this.y);
	}

	set(v: Vec2): Vec2 {
		this.x = v.x;
		this.y = v.y;

		return this;
	}

	add(v: Vec2): Vec2 {
		this.x += v.x;
		this.y += v.y;

		return this;
	}

	addX(x: number): Vec2 {
		this.x += x;

		return this;
	}

	addY(y: number): Vec2 {
		this.y += y;

		return this;
	}

	subtract(v: Vec2): Vec2 {
		this.x -= v.x;
		this.y -= v.y;

		return this;
	}

	scale(scale: number): Vec2 {
		this.x *= scale;
		this.y *= scale;

		return this;
	}

	scaleXY(xScale: number, yScale: number): Vec2 {
		this.x *= xScale;
		this.y *= yScale;

		return this;
	}

	normalize(): Vec2 {
		this.x /= this.magnitude;
		this.y /= this.magnitude;

		return this;
	}

	dot(v: Vec2): number {
		return this.x * v.x + this.y * v.y;
	}

	get length(): number {
		return this.magnitude;
	}

	get magnitude(): number {
		return Math.sqrt(this.x ** 2 + this.y ** 2);
	}

	toString(): string {
		return `Vec2 { x: ${this.x}, y: ${this.y} }`;
	}
}
