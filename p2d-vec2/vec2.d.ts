export declare class Vec2 {
    x: number;
    y: number;
    constructor(x?: number, y?: number);
    static zero(): Vec2;
    static one(): Vec2;
    static fromDegrees(deg: number, scale?: number): Vec2;
    static fromRadians(rad: number, scale?: number): Vec2;
    static fromArray([x, y]: [number, number]): Vec2;
    static add(v1: Vec2, v2: Vec2): Vec2;
    static addX(v: Vec2, x: number): Vec2;
    static addY(v: Vec2, y: number): Vec2;
    static subtract(v1: Vec2, v2: Vec2): Vec2;
    static sum(...vectors: Vec2[]): Vec2;
    static scale(v: Vec2, scale: number): Vec2;
    static scaleXY(v: Vec2, xScale: number, yScale: number): Vec2;
    static normalize(v: Vec2): Vec2;
    clone(): Vec2;
    set(v: Vec2): Vec2;
    add(v: Vec2): Vec2;
    addX(x: number): Vec2;
    addY(y: number): Vec2;
    subtract(v: Vec2): Vec2;
    scale(scale: number): Vec2;
    scaleXY(xScale: number, yScale: number): Vec2;
    normalize(): Vec2;
    dot(v: Vec2): number;
    get length(): number;
    get magnitude(): number;
    toString(): string;
}
