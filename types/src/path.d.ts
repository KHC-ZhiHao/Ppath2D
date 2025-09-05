import ModuleBase from './base';
interface Point {
    x: number;
    y: number;
}
interface PointData {
    p1x: number;
    p1y: number;
    p2x: number;
    p2y: number;
    ex: number;
    ey: number;
}
interface Offset {
    x: number;
    y: number;
}
type CompileMode = 'path' | 'polygon' | 'polyline';
declare class Path extends ModuleBase {
    points: PointBase[];
    length: number;
    cacheMode: boolean;
    siteCaches: Point[];
    lengthCaches: number[];
    constructor(data?: string, mode?: CompileMode);
    compile(data: string, mode?: CompileMode): void;
    readPolyline(data: string): void;
    eachPoint(callback: (point: PointBase) => void): void;
    addPoint(point: PointBase): void;
    setCache(enable: boolean): void;
    addPath(path: Path): void;
    render(context: CanvasRenderingContext2D): void;
    toPathString(): string;
    getLastPoint(): {
        ex: number;
        ey: number;
    };
    getLastPosition(): Point;
    getLinePosition(t: number): Point;
    getRect(): {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    getDirection(t: number): number;
    moveTo(x: number, y: number, abs?: boolean): this;
    lineTo(x: number, y: number, abs?: boolean): this;
    curve(x1: number, y1: number, x2: number, y2: number, x: number, y: number, abs?: boolean): this;
    quadraticBezierCurve(x1: number, y1: number, x: number, y: number, abs?: boolean): this;
    smoothCurve(x2: number, y2: number, x: number, y: number, abs?: boolean): this;
    smoothQuadraticBezierCurve(x: number, y: number, abs?: boolean): this;
    horizontalLineTo(x: number, abs?: boolean): this;
    verticalLineTo(y: number, abs?: boolean): this;
    arc(rx: number, ry: number, rotation: number, large: number, sweep: number, x: number, y: number, abs?: boolean): this;
    closePath(): this;
}
declare class PointBase {
    error: string | null;
    path: Path;
    parent: {
        ex: number;
        ey: number;
    };
    offset: Offset;
    _absolute: boolean;
    length: number;
    data: PointData;
    static MoveTo: typeof MoveTo;
    static LineTo: typeof LineTo;
    static HorizontalLineTo: typeof HorizontalLineTo;
    static VerticalLineTo: typeof VerticalLineTo;
    static Curve: typeof Curve;
    static QuadraticBezierCurve: typeof QuadraticBezierCurve;
    static SmoothCurve: typeof SmoothCurve;
    static SmoothQuadraticBezierCurve: typeof SmoothQuadraticBezierCurve;
    static Arc: typeof Arc;
    static ClosePath: typeof ClosePath;
    constructor(path: Path, parent: {
        ex: number;
        ey: number;
    }, absolute?: boolean);
    set absolute(absolute: boolean);
    get absolute(): boolean;
    get sx(): number;
    get sy(): number;
    get ex(): number;
    set ex(val: number);
    get ey(): number;
    set ey(val: number);
    get p1x(): number;
    set p1x(val: number);
    get p1y(): number;
    set p1y(val: number);
    get p2x(): number;
    set p2x(val: number);
    get p2y(): number;
    set p2y(val: number);
    resetReference(path: Path, parent?: {
        ex: number;
        ey: number;
    }): void;
    initData(): void;
    resetData(options: Partial<PointData>): void;
    refresh(): void;
    getLength(): number;
    getLastPosition(): Point;
    getType(): string;
    render(context: CanvasRenderingContext2D): void;
    toPathString(): string;
    getLinePosition(t?: number): Point;
}
declare class MoveTo extends PointBase {
    constructor(path: Path, parent: {
        ex: number;
        ey: number;
    }, x: number, y: number, absolute: boolean);
    render(context: CanvasRenderingContext2D): void;
    toPathString(): string;
    getLinePosition(): Point;
    getPositionX(): number;
    getPositionY(): number;
}
declare class LineTo extends PointBase {
    constructor(path: Path, parent: {
        ex: number;
        ey: number;
    }, x: number, y: number, absolute: boolean);
    render(context: CanvasRenderingContext2D): void;
    toPathString(): string;
    getLinePosition(t: number): Point;
    getLength(): number;
}
declare class HorizontalLineTo extends LineTo {
    constructor(path: Path, parent: {
        ex: number;
        ey: number;
    }, x: number, absolute: boolean);
    toPathString(): string;
}
declare class VerticalLineTo extends LineTo {
    constructor(path: Path, parent: {
        ex: number;
        ey: number;
    }, y: number, absolute: boolean);
    toPathString(): string;
}
declare class Curve extends PointBase {
    constructor(path: Path, parent: {
        ex: number;
        ey: number;
    }, x1: number, y1: number, x2: number, y2: number, x: number, y: number, absolute?: boolean);
    getStep(): number;
    getPoint(t: number, s: number, p1: number, p2: number, e: number): number;
    getLength(): number;
    render(context: CanvasRenderingContext2D): void;
    toPathString(): string;
    getLinePosition(t: number): Point;
}
declare class QuadraticBezierCurve extends Curve {
    constructor(path: Path, parent: {
        ex: number;
        ey: number;
    }, p1x: number, p1y: number, ex: number, ey: number, absolute?: boolean);
    get p2x(): number;
    set p2x(val: number);
    get p2y(): number;
    set p2y(val: number);
    render(context: CanvasRenderingContext2D): void;
    toPathString(): string;
    getPoint(t: number, s: number, p1: number, p2: number, e: number): number;
}
declare class SmoothCurve extends Curve {
    constructor(path: Path, parent: {
        ex: number;
        ey: number;
    }, p2x: number, p2y: number, ex: number, ey: number, absolute?: boolean);
    get parentIsCurve(): boolean;
    get p1x(): number;
    set p1x(val: number);
    get p1y(): number;
    set p1y(val: number);
    render(context: CanvasRenderingContext2D): void;
    toPathString(): string;
}
declare class SmoothQuadraticBezierCurve extends Curve {
    constructor(path: Path, parent: {
        ex: number;
        ey: number;
        getType(): string;
        p1x?: number;
        p1y?: number;
    }, ex: number, ey: number, absolute?: boolean);
    get p2x(): number;
    set p2x(val: number);
    get p2y(): number;
    set p2y(val: number);
    get p1x(): number;
    set p1x(val: number);
    get p1y(): number;
    set p1y(val: number);
    render(context: CanvasRenderingContext2D): void;
    toPathString(): string;
    getPoint(t: number, s: number, p1: number, p2: number, e: number): number;
}
declare class Arc extends PointBase {
    rx: number;
    ry: number;
    sweepFlag: number;
    largeArcFlag: number;
    xAxisRotation: number;
    constructor(path: Path, parent: {
        ex: number;
        ey: number;
    }, rx: number, ry: number, xAxisRotation: number, largeArcFlag: number, sweepFlag: number, x: number, y: number, absolute?: boolean);
    resetData(options: Partial<PointData> & Partial<{
        rx: number;
        ry: number;
        sweepFlag: number;
        largeArcFlag: number;
        xAxisRotation: number;
    }>): void;
    getStep(): number;
    render(context: CanvasRenderingContext2D): void;
    toPathString(): string;
    angleBetween(v0: Point, v1: Point): number;
    getLinePosition(per: number): Point;
    getDistance(p1: Point, p2: Point): number;
    getLength(): number;
}
declare class ClosePath extends LineTo {
    constructor(path: Path, parent: {
        ex: number;
        ey: number;
    }, target: {
        ex: number;
        ey: number;
        absolute: boolean;
    });
    render(context: CanvasRenderingContext2D): void;
    toPathString(): string;
}
export default Path;
