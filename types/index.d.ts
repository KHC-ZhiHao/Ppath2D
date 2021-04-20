export class Ppath2D {
    constructor(path?: string, mode?: 'path' | 'polygon' | 'polyline')
    setCache(enable: boolean): void
    addPath(path: Ppath2D): Ppath2D 
    render(context: CanvasRenderingContext2D): void
    toPathString(): string
    getLastPosition(): { x: number, y: number }
    getLinePosition(t: number): { x: number, y: number }
    getDirection(t: number): number
    moveTo(x: number, y: number, abs?: boolean): Ppath2D
    lineTo(x: number, y: number, abs?: boolean): Ppath2D
    curve(x1: number, y1: number, x2: number, y2: number, x: number, y: number, abs?: boolean): Ppath2D
    quadraticBezierCurve(x1: number, y1: number, x: number, y: number, abs?: boolean): Ppath2D 
    smoothCurve(x2: number, y2: number, x: number, y: number, abs?: boolean): Ppath2D 
    smoothQuadraticBezierCurve(x: number, y: number, abs?: boolean): Ppath2D
    horizontalLineTo(x: number, abs?: boolean): Ppath2D
    verticalLineTo(y: number, abs?: boolean): Ppath2D
    arc(rx: number, ry: number, rotation: number, large: number, sweep: number, x: number, y: number, abs?: boolean): Ppath2D
    closePath(): Ppath2D
}

export default Ppath2D
