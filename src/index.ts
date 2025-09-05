import Path from './path'

class Main {
    private _core: Path

    constructor(data?: string, mode?: 'path' | 'polygon' | 'polyline') {
        this._core = new Path(data, mode)
    }

    setCache(enable: boolean): void {
        this._core.setCache(enable)
    }

    addPath(path: Main): Main {
        if (path instanceof Main) {
            this._core.addPath(path._core)
            return this
        } else {
            this.systemError('addPath', 'Object not a Ppath2D data.', path)
        }
    }

    render(context: CanvasRenderingContext2D): void {
        this._core.render(context)
    }

    toPathString(): string {
        return this._core.toPathString()
    }

    getRect(): { x: number, y: number, width: number, height: number } {
        return this._core.getRect()
    }

    getLastPosition(): { x: number, y: number } {
        return this._core.getLastPosition()
    }

    getLinePosition(t: number): { x: number, y: number } {
        return this._core.getLinePosition(t)
    }

    getDirection(t: number): number {
        return this._core.getDirection(t)
    }

    moveTo(x: number, y: number, abs?: boolean): Main {
        this._core.moveTo(x, y, abs)
        return this
    }

    lineTo(x: number, y: number, abs?: boolean): Main {
        this._core.lineTo(x, y, abs)
        return this
    }

    curve(x1: number, y1: number, x2: number, y2: number, x: number, y: number, abs?: boolean): Main {
        this._core.curve(x1, y1, x2, y2, x, y, abs)
        return this
    }

    quadraticBezierCurve(x1: number, y1: number, x: number, y: number, abs?: boolean): Main {
        this._core.quadraticBezierCurve(x1, y1, x, y, abs)
        return this
    }

    smoothCurve(x2: number, y2: number, x: number, y: number, abs?: boolean): Main {
        this._core.smoothCurve(x2, y2, x, y, abs)
        return this
    }

    smoothQuadraticBezierCurve(x: number, y: number, abs?: boolean): Main {
        this._core.smoothQuadraticBezierCurve(x, y, abs)
        return this
    }

    horizontalLineTo(x: number, abs?: boolean): Main {
        this._core.horizontalLineTo(x, abs)
        return this
    }

    verticalLineTo(y: number, abs?: boolean): Main {
        this._core.verticalLineTo(y, abs)
        return this
    }

    arc(rx: number, ry: number, rotation: number, large: number, sweep: number, x: number, y: number, abs?: boolean): Main {
        this._core.arc(rx, ry, rotation, large, sweep, x, y, abs)
        return this
    }

    closePath(): Main {
        this._core.closePath()
        return this
    }

    private systemError(functionName: string, message: string, object: any = 'no_message'): never {
        if (object !== 'no_message') {
            console.log('%c error object is : ', 'color:#FFF; background:red')
            console.log(object)
        }
        throw new Error(`(☉д⊙)!! Main => ${functionName} -> ${message}`)
    }
}

export default Main
