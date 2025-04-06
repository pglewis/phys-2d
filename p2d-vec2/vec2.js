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
    static fromDegrees(deg, scale = 1) {
        return Vec2.fromRadians(deg * Math.PI / 180, scale);
    }
    static fromRadians(rad, scale = 1) {
        return Vec2.scale(new Vec2(Math.cos(rad), Math.sin(rad)), scale);
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
    static subtract(v1, v2) {
        return new Vec2(v1.x - v2.x, v1.y - v2.y);
    }
    static sum(...vectors) {
        let sum = Vec2.zero();
        for (const thisVector of vectors) {
            sum = Vec2.add(sum, thisVector);
        }
        return sum;
    }
    static scale(v, scale) {
        return new Vec2(v.x * scale, v.y * scale);
    }
    static scaleXY(v, xScale, yScale) {
        return new Vec2(v.x * xScale, v.y * yScale);
    }
    static normalize(v) {
        return new Vec2(v.x / v.magnitude, v.y / v.magnitude);
    }
    clone() {
        return new Vec2(this.x, this.y);
    }
    set(v) {
        this.x = v.x;
        this.y = v.y;
        return this;
    }
    add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }
    addX(x) {
        this.x += x;
        return this;
    }
    addY(y) {
        this.y += y;
        return this;
    }
    subtract(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }
    scale(scale) {
        this.x *= scale;
        this.y *= scale;
        return this;
    }
    scaleXY(xScale, yScale) {
        this.x *= xScale;
        this.y *= yScale;
        return this;
    }
    normalize() {
        this.x /= this.magnitude;
        this.y /= this.magnitude;
        return this;
    }
    dot(v) {
        return this.x * v.x + this.y * v.y;
    }
    get length() {
        return this.magnitude;
    }
    get magnitude() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }
    toString() {
        return `Vec2 { x: ${this.x}, y: ${this.y} }`;
    }
}
