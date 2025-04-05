export declare class Vec2 {
    x: number;
    y: number;
    constructor(x?: number, y?: number);
    static zero(): Vec2;
    static one(): Vec2;
    static fromDegrees(degrees: number, scalar?: number): Vec2;
    static fromRadians(radians: number, scalar?: number): Vec2;
    static fromArray([x, y]: [number, number]): Vec2;
    static add(v1: Vec2, v2: Vec2): Vec2;
    static addX(v: Vec2, x: number): Vec2;
    static addY(v: Vec2, y: number): Vec2;
    static sum(...vectors: Vec2[]): Vec2;
    static scale(v: Vec2, scalar: number): Vec2;
    static scaleXY(v: Vec2, xScalar: number, yScalar: number): Vec2;
    /**
     * @param v
     * @returns Modifies the existing vector
    */
    add(v: Vec2): Vec2;
    /**
     * @param scalar
     * @returns Modifies the existing vector
     */
    addX(scalar: number): Vec2;
    /**
     * @param scalar
     * @returns Modifies the existing vector
     */
    addY(scalar: number): Vec2;
    subtract(v: Vec2): Vec2;
    multiply(v: Vec2): Vec2;
    divide(v: Vec2): Vec2;
    scale(scalar: number): Vec2;
    dot(v: Vec2): number;
    normalize(): Vec2;
    get magnitude(): number;
    toString(): string;
}
