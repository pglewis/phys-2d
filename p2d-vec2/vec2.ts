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

	static fromDegrees(degrees: number, scalar: number = 1): Vec2 {
		return Vec2.fromRadians(degrees * Math.PI / 180, scalar);
	}

	static fromRadians(radians: number, scalar: number = 1): Vec2 {
		return Vec2.scale(
			new Vec2(Math.cos(radians), Math.sin(radians)),
			scalar
		);
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

	static sum(...vectors: Vec2[]): Vec2 {
		let sum = Vec2.zero();

		for (const thisVector of vectors) {
			sum = Vec2.add(sum, thisVector);
		}

		return sum;
	}

	static scale(v: Vec2, scalar: number): Vec2 {
		return new Vec2(v.x * scalar, v.y * scalar);
	}

	static scaleXY(v: Vec2, xScalar: number, yScalar: number): Vec2 {
		return new Vec2(v.x * xScalar, v.y * yScalar);
	}

	/**
	 * @param v
	*/
	add(v: Vec2): void {
		this.x = this.x + v.x;
		this.y = this.y + v.y;
	}

	/**
	 * @param scalar
	 * @returns Modifies the existing vector
	 */
	addX(scalar: number): Vec2 {
		return Vec2.addX(this, scalar);
	}

	/**
	 * @param scalar
	 * @returns Modifies the existing vector
	 */
	addY(scalar: number): Vec2 {
		return Vec2.addY(this, scalar);
	}

	subtract(v: Vec2): Vec2 {
		return new Vec2(this.x - v.x, this.y - v.y);
	}

	multiply(v: Vec2): Vec2 {
		return new Vec2(this.x * v.x, this.y * v.y);
	}

	divide(v: Vec2): Vec2 {
		return new Vec2(this.x / v.x, this.y / v.y);
	}

	scale(scalar: number): Vec2 {
		return Vec2.scale(this, scalar);
	}

	scaleXY(xScalar: number, yScalar: number): Vec2 {
		return Vec2.scaleXY(this, xScalar, yScalar);
	}

	dot(v: Vec2): number {
		return this.x * v.x + this.y * v.y;
	}

	normalize(): Vec2 {
		return new Vec2(this.x / this.magnitude, this.y / this.magnitude);
	}

	get magnitude(): number {
		return Math.sqrt(this.x ** 2 + this.y ** 2);
	}

	toString(): string {
		return `Vec2 { x: ${this.x}, y: ${this.y} }`;
	}
}
