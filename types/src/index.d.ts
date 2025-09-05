declare class Main {
    private _core;
    constructor(data?: string, mode?: 'path' | 'polygon' | 'polyline');
    setCache(enable: boolean): void;
    addPath(path: Main): Main;
    render(context: CanvasRenderingContext2D): void;
    toPathString(): string;
    getRect(): {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    getLastPosition(): {
        x: number;
        y: number;
    };
    getLinePosition(t: number): {
        x: number;
        y: number;
    };
    getDirection(t: number): number;
    moveTo(x: number, y: number, abs?: boolean): Main;
    lineTo(x: number, y: number, abs?: boolean): Main;
    curve(x1: number, y1: number, x2: number, y2: number, x: number, y: number, abs?: boolean): Main;
    quadraticBezierCurve(x1: number, y1: number, x: number, y: number, abs?: boolean): Main;
    smoothCurve(x2: number, y2: number, x: number, y: number, abs?: boolean): Main;
    smoothQuadraticBezierCurve(x: number, y: number, abs?: boolean): Main;
    horizontalLineTo(x: number, abs?: boolean): Main;
    verticalLineTo(y: number, abs?: boolean): Main;
    arc(rx: number, ry: number, rotation: number, large: number, sweep: number, x: number, y: number, abs?: boolean): Main;
    closePath(): Main;
    private systemError;
}
export default Main;
