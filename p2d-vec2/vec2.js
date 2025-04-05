export class Vec2 {
    x;
    y;
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    static zero() {
        return new Vec2(0, 0);
    }
    static one() {
        return new Vec2(1, 1);
    }
    static fromDegrees(degrees, scalar = 1) {
        return Vec2.fromRadians(degrees * Math.PI / 180, scalar);
    }
    static fromRadians(radians, scalar = 1) {
        return Vec2.scale(new Vec2(Math.cos(radians), Math.sin(radians)), scalar);
    }
    static fromArray([x, y]) {
        return new Vec2(x, y);
    }
    static add(v1, v2) {
        return new Vec2(v1.x + v2.x, v1.y + v2.y);
    }
    static addX(v, x) {
        return new Vec2(v.x + x, v.y);
    }
    static addY(v, y) {
        return new Vec2(v.x, v.y + y);
    }
    static sum(...vectors) {
        let sum = Vec2.zero();
        for (const thisVector of vectors) {
            sum = Vec2.add(sum, thisVector);
        }
        return sum;
    }
    static scale(v, scalar) {
        return new Vec2(v.x * scalar, v.y * scalar);
    }
    static scaleXY(v, xScalar, yScalar) {
        return new Vec2(v.x * xScalar, v.y * yScalar);
    }
    /**
     * @param v
    */
    add(v) {
        this.x = this.x + v.x;
        this.y = this.y + v.y;
    }
    /**
     * @param scalar
     * @returns Modifies the existing vector
     */
    addX(scalar) {
        return Vec2.addX(this, scalar);
    }
    /**
     * @param scalar
     * @returns Modifies the existing vector
     */
    addY(scalar) {
        return Vec2.addY(this, scalar);
    }
    subtract(v) {
        return new Vec2(this.x - v.x, this.y - v.y);
    }
    multiply(v) {
        return new Vec2(this.x * v.x, this.y * v.y);
    }
    divide(v) {
        return new Vec2(this.x / v.x, this.y / v.y);
    }
    scale(scalar) {
        return Vec2.scale(this, scalar);
    }
    scaleXY(xScalar, yScalar) {
        return Vec2.scaleXY(this, xScalar, yScalar);
    }
    dot(v) {
        return this.x * v.x + this.y * v.y;
    }
    normalize() {
        return new Vec2(this.x / this.magnitude, this.y / this.magnitude);
    }
    get magnitude() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }
    toString() {
        return `Vec2 { x: ${this.x}, y: ${this.y} }`;
    }
}
