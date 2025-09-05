import ModuleBase from './base'

interface Point {
    x: number
    y: number
}

interface PointData {
    p1x: number
    p1y: number
    p2x: number
    p2y: number
    ex: number
    ey: number
}

interface Offset {
    x: number
    y: number
}

type CompileMode = 'path' | 'polygon' | 'polyline'

class Path extends ModuleBase {
    points: PointBase[]
    length: number
    cacheMode: boolean
    siteCaches: Point[]
    lengthCaches: number[]

    constructor(data?: string, mode?: CompileMode) {
        super('Path')
        this.points = []
        this.length = 0
        this.cacheMode = false
        this.siteCaches = []
        this.lengthCaches = []
        if (data) {
            let type = typeof data
            if (type === 'string') {
                this.compile(data.trim(), mode)
            }
        }
    }

    compile(data: string, mode: CompileMode = 'path'): void {
        let list = {
            a: 'arc',
            m: 'moveTo',
            l: 'lineTo',
            h: 'horizontalLineTo',
            v: 'verticalLineTo',
            c: 'curve',
            q: 'quadraticBezierCurve',
            s: 'smoothCurve',
            t: 'smoothQuadraticBezierCurve',
            z: 'closePath'
        }
        const paramCounts = {
            m: 2, // moveTo: x, y
            l: 2, // lineTo: x, y
            h: 1, // horizontalLineTo: x
            v: 1, // verticalLineTo: y
            c: 6, // curve: x1, y1, x2, y2, x, y
            q: 4, // quadraticBezierCurve: x1, y1, x, y
            s: 4, // smoothCurve: x2, y2, x, y
            t: 2, // smoothQuadraticBezierCurve: x, y
            a: 7, // arc: rx, ry, rotation, large-arc, sweep, x, y
            z: 0 // closePath: 無參數
        }
        const chunkArray = <T>(arr: T[], size: number): T[][] => {
            let result = []
            for (let i = 0; i < arr.length; i += size) {
                result.push(arr.slice(i, i + size))
            }
            return result
        }
        if (mode === 'path') {
            let keys = Object.keys(list)
            let index = -1
            let params = ['']
            for (let i = 0; i < data.length; i++) {
                if (/[a-zA-z]/.test(data[i])) {
                    index += 1
                    params[index] = ''
                }
                if (data[i] === '-') {
                    params[index] += ' '
                }
                params[index] += data[i]
            }
            for (let param of params) {
                let pt = param.trim()
                let key = pt.slice(0, 1)
                let data = pt.slice(1).split(/,|\s/).filter((t) => t !== '').map((d) => {
                    return Number(d)
                })
                let count = paramCounts[key.toLowerCase() as keyof typeof paramCounts]
                let units = chunkArray(data, count)
                if (keys.indexOf(key.toLowerCase()) !== -1) {
                    let isAbs = /[A-Z]/.test(key)
                    for (let unit of units) {
                        // @ts-ignore
                        this[list[key.toLowerCase()]](...unit, isAbs)
                    }
                } else {
                    this.systemError('compile', 'Key name not found', key)
                }
            }
        } else if (mode === 'polygon') {
            this.readPolyline(data)
            this.closePath()
        } else if (mode === 'polyline') {
            this.readPolyline(data)
        }
    }

    readPolyline(data: string): void {
        let params = ''
        for (let i = 0; i < data.length; i++) {
            if (data[i] === '-') {
                params += ' '
            }
            params += data[i]
        }
        const pos = params.split(/,|\s/).filter((t) => t !== '').map((d) => {
            return Number(d)
        })
        this.moveTo(pos[0], pos[1], true)
        for (let i = 2; i < data.length; i += 2) {
            this.lineTo(pos[i], pos[i + 1], true)
        }
    }

    eachPoint(callback: (point: PointBase) => void): void {
        let len = this.points.length
        for (let i = 0; i < len; i++) {
            callback(this.points[i])
        }
    }

    addPoint(point: PointBase): void {
        if (point.error) {
            this.systemError('addPoint', point.error, point)
        }
        this.lengthCaches.push(this.length)
        this.points.push(point)
        this.length += point.length
    }

    setCache(enable: boolean): void {
        this.cacheMode = !!enable
        this.siteCaches = []
    }

    addPath(path: Path): void {
        this.compile(path.toPathString())
    }

    render(context: CanvasRenderingContext2D): void {
        context.beginPath()
        this.eachPoint((point) => {
            point.render(context)
        })
    }

    toPathString(): string {
        let string = ''
        this.eachPoint((point) => {
            string += point.toPathString()
        })
        return string
    }

    getLastPoint(): { ex: number, ey: number } {
        return this.points.length === 0 ? { ex: 0, ey: 0 } : this.points.slice(-1)[0]
    }

    getLastPosition(): Point {
        let p = this.points[this.points.length - 1]
        return p ? p.getLastPosition() : { x: 0, y: 0 }
    }

    getLinePosition(t: number): Point {
        if (this.cacheMode && this.siteCaches[t]) {
            return this.siteCaches[t]
        }
        let target = null
        let site = null
        let dis = this.length * t
        let len = this.points.length
        let index = 0
        if (this.lengthCaches.length > 10) {
            let range = 10
            let length = Math.floor(this.lengthCaches.length * (1 / range))
            for (let i = 1; i < range; i++) {
                if (dis <= this.lengthCaches[i * length]) {
                    break
                }
                index = (i - 1) * length
            }
            dis -= this.lengthCaches[index]
        }

        for (let i = index; i < len; i++) {
            if (dis <= this.points[i].length) {
                if (this.points[i]) {
                    target = this.points[i]
                    break
                }
            } else {
                dis -= this.points[i].length
            }
        }

        if (target) {
            site = target.getLinePosition(dis / target.length)
        } else {
            site = this.getLastPosition()
        }
        if (this.cacheMode && this.siteCaches.length <= 2000) {
            this.siteCaches[t] = site
        }
        return site
    }

    getRect(): { x: number, y: number, width: number, height: number } {
        if (this.points.length === 0) {
            return {
                x: 0,
                y: 0,
                width: 0,
                height: 0
            }
        }

        let minX = Infinity
        let minY = Infinity
        let maxX = -Infinity
        let maxY = -Infinity

        const updateBounds = (x: number, y: number) => {
            minX = Math.min(minX, x)
            minY = Math.min(minY, y)
            maxX = Math.max(maxX, x)
            maxY = Math.max(maxY, y)
        }

        this.eachPoint((point) => {
            // 檢查起點
            updateBounds(point.sx, point.sy)
            // 檢查終點
            updateBounds(point.ex, point.ey)

            // 對於曲線類型的點，也檢查控制點
            if (point instanceof PointBase.Curve
              || point instanceof PointBase.QuadraticBezierCurve
              || point instanceof PointBase.SmoothCurve) {
                updateBounds(point.p1x, point.p1y)
                updateBounds(point.p2x, point.p2y)
            }

            // 對於弧線，取樣多個點來確保準確性
            if (point instanceof PointBase.Arc) {
                for (let i = 0; i <= 100; i++) {
                    const pos = point.getLinePosition(i / 100)
                    updateBounds(pos.x, pos.y)
                }
            }
        })

        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        }
    }

    getDirection(t: number): number {
        let to = t + 0.01
        let p1 = this.getLinePosition(t)
        let p2 = this.getLinePosition(to)
        return Supports.getAngle(p1.x, p1.y, p2.x, p2.y) - 270
    }

    moveTo(x: number, y: number, abs: boolean = false): this {
        this.addPoint(new PointBase.MoveTo(this, this.getLastPoint(), x, y, abs))
        return this
    }

    lineTo(x: number, y: number, abs: boolean = false): this {
        this.addPoint(new PointBase.LineTo(this, this.getLastPoint(), x, y, abs))
        return this
    }

    curve(x1: number, y1: number, x2: number, y2: number, x: number, y: number, abs: boolean = false): this {
        this.addPoint(new PointBase.Curve(this, this.getLastPoint(), x1, y1, x2, y2, x, y, abs))
        return this
    }

    quadraticBezierCurve(x1: number, y1: number, x: number, y: number, abs: boolean = false): this {
        this.addPoint(new PointBase.QuadraticBezierCurve(this, this.getLastPoint(), x1, y1, x, y, abs))
        return this
    }

    smoothCurve(x2: number, y2: number, x: number, y: number, abs: boolean = false): this {
        this.addPoint(new PointBase.SmoothCurve(this, this.getLastPoint(), x2, y2, x, y, abs))
        return this
    }

    smoothQuadraticBezierCurve(x: number, y: number, abs: boolean = false): this {
        this.addPoint(new PointBase.SmoothQuadraticBezierCurve(this, this.getLastPoint() as any, x, y, abs))
        return this
    }

    horizontalLineTo(x: number, abs: boolean = false): this {
        this.addPoint(new PointBase.HorizontalLineTo(this, this.getLastPoint(), x, abs))
        return this
    }

    verticalLineTo(y: number, abs: boolean = false): this {
        this.addPoint(new PointBase.VerticalLineTo(this, this.getLastPoint(), y, abs))
        return this
    }

    arc(rx: number, ry: number, rotation: number, large: number, sweep: number, x: number, y: number, abs: boolean = false): this {
        this.addPoint(new PointBase.Arc(this, this.getLastPoint(), rx, ry, rotation, large, sweep, x, y, abs))
        return this
    }

    closePath(): this {
        let target = this.points.filter((p) => {
            return p instanceof PointBase.MoveTo
        }).pop()
        this.addPoint(new PointBase.ClosePath(this, this.getLastPoint(), target!))
        return this
    }
}

class Supports {
    static getDistance(x: number, y: number, ax: number, ay: number): number {
        return Math.sqrt(Math.pow((ax - x), 2) + Math.pow((ay - y), 2))
    }

    static getAngle(x: number, y: number, ax: number, ay: number): number {
        if (x === ax && y === ay) {
            return 0
        }
        var angle = Math.atan2((ay - y), (ax - x)) * 180 / Math.PI
        return angle > 0 ? angle : 360 + angle
    }

    static getSvgLength(d: string): number {
        const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        pathElement.setAttributeNS(null, 'd', d)
        return pathElement.getTotalLength()
    }
}

class PointBase {
    error: string | null
    path: Path
    parent: { ex: number, ey: number }
    offset: Offset
    _absolute: boolean
    length: number
    data: PointData

    // 靜態子類屬性聲明
    static MoveTo: typeof MoveTo
    static LineTo: typeof LineTo
    static HorizontalLineTo: typeof HorizontalLineTo
    static VerticalLineTo: typeof VerticalLineTo
    static Curve: typeof Curve
    static QuadraticBezierCurve: typeof QuadraticBezierCurve
    static SmoothCurve: typeof SmoothCurve
    static SmoothQuadraticBezierCurve: typeof SmoothQuadraticBezierCurve
    static Arc: typeof Arc
    static ClosePath: typeof ClosePath

    constructor(path: Path, parent: { ex: number, ey: number }, absolute: boolean = false) {
        this.error = null
        this.length = 0
        this.data = {
            p1x: 0,
            p1y: 0,
            p2x: 0,
            p2y: 0,
            ex: 0,
            ey: 0
        }
        this.path = path
        this.parent = parent
        this.offset = { x: 0, y: 0 }
        this.absolute = !!absolute
        this._absolute = !!absolute
    }

    set absolute(absolute: boolean) {
        this._absolute = !!absolute
        this.offset.x = absolute ? 0 : this.sx
        this.offset.y = absolute ? 0 : this.sy
    }

    get absolute(): boolean { return this._absolute }

    get sx(): number { return this.parent.ex }
    get sy(): number { return this.parent.ey }

    get ex(): number { return this.data.ex + this.offset.x }
    set ex(val: number) { this.data.ex = val }

    get ey(): number { return this.data.ey + this.offset.y }
    set ey(val: number) { this.data.ey = val }

    get p1x(): number { return this.data.p1x + this.offset.x }
    set p1x(val: number) { this.data.p1x = val }

    get p1y(): number { return this.data.p1y + this.offset.y }
    set p1y(val: number) { this.data.p1y = val }

    get p2x(): number { return this.data.p2x + this.offset.x }
    set p2x(val: number) { this.data.p2x = val }

    get p2y(): number { return this.data.p2y + this.offset.y }
    set p2y(val: number) { this.data.p2y = val }

    resetReference(path: Path, parent?: { ex: number, ey: number }): void {
        this.path = path
        this.parent = parent || this.parent
    }

    initData(): void {
        this.length = 0
        this.data = {
            p1x: 0,
            p1y: 0,
            p2x: 0,
            p2y: 0,
            ex: 0,
            ey: 0
        }
    }

    resetData(options: Partial<PointData>): void {
        for (let key in options) {
            // @ts-ignore
            if (this.data[key] != null) {
                // @ts-ignore
                this[key] = options[key]
            }
        }
        this.refresh()
    }

    refresh(): void {
        this.length = this.getLength()
    }

    getLength(): number {
        return 0
    }

    getLastPosition(): Point {
        return {
            x: this.ex,
            y: this.ey
        }
    }

    getType(): string {
        return this.toPathString().trim()[0]
    }

    render(context: CanvasRenderingContext2D): void {}
    toPathString(): string { return '' }
    getLinePosition(t?: number): Point { return { x: 0, y: 0 } }
}

class MoveTo extends PointBase {
    constructor(path: Path, parent: { ex: number, ey: number }, x: number, y: number, absolute: boolean) {
        super(path, parent, absolute)
        this.resetData({
            ex: x,
            ey: y
        })
    }

    render(context: CanvasRenderingContext2D): void {
        context.moveTo(this.ex, this.ey)
    }

    toPathString(): string {
        return `M${this.ex},${this.ey}`
    }

    getLinePosition(): Point {
        return {
            x: this.ex,
            y: this.ey
        }
    }

    getPositionX(): number {
        return this.ex
    }

    getPositionY(): number {
        return this.ey
    }
}

class LineTo extends PointBase {
    constructor(path: Path, parent: { ex: number, ey: number }, x: number, y: number, absolute: boolean) {
        super(path, parent, absolute)
        this.resetData({
            ex: x,
            ey: y
        })
    }

    render(context: CanvasRenderingContext2D): void {
        context.lineTo(this.ex, this.ey)
    }

    toPathString(): string {
        return `L${this.ex},${this.ey}`
    }

    getLinePosition(t: number): Point {
        return {
            x: this.sx * (1 - t) + this.ex * t,
            y: this.sy * (1 - t) + this.ey * t
        }
    }

    getLength(): number {
        return Supports.getDistance(this.sx, this.sy, this.ex, this.ey)
    }
}

class HorizontalLineTo extends LineTo {
    constructor(path: Path, parent: { ex: number, ey: number }, x: number, absolute: boolean) {
        super(path, parent, x, absolute ? parent.ey : 0, absolute)
    }

    toPathString(): string {
        return `H${this.ex}`
    }
}

class VerticalLineTo extends LineTo {
    constructor(path: Path, parent: { ex: number, ey: number }, y: number, absolute: boolean) {
        super(path, parent, absolute ? parent.ex : 0, y, absolute)
    }

    toPathString(): string {
        return `V${this.ey}`
    }
}

class Curve extends PointBase {
    constructor(path: Path, parent: { ex: number, ey: number }, x1: number, y1: number, x2: number, y2: number, x: number, y: number, absolute: boolean = false) {
        super(path, parent, absolute)
        this.resetData({
            p1x: x1,
            p1y: y1,
            p2x: x2,
            p2y: y2,
            ex: x,
            ey: y
        })
    }

    getStep(): number {
        return 100
    }

    getPoint(t: number, s: number, p1: number, p2: number, e: number): number {
        return s * (1 - t) * (1 - t) * (1 - t) + 3 * p1 * (1 - t) * (1 - t) * t + 3 * p2 * (1 - t) * t * t + e * t * t * t
    }

    getLength(): number {
        if (Compatibility.GeometryElement) {
            return Supports.getSvgLength(`M${this.sx},${this.sy}` + this.toPathString())
        }
        var x = 0
        var y = 0
        var t = 0
        var length = 0
        var steps = this.getStep()
        var previousDotX = 0
        var previousDotY = 0
        for (let i = 0; i <= steps; i++) {
            t = i / steps
            x = this.getPoint(t, this.sx, this.p1x, this.p2x, this.ex)
            y = this.getPoint(t, this.sy, this.p1y, this.p2y, this.ey)
            if (i > 0) {
                var diffX = x - previousDotX
                var diffY = y - previousDotY
                length += Math.sqrt(diffX * diffX + diffY * diffY)
            }
            previousDotX = x
            previousDotY = y
        }
        return length
    }

    render(context: CanvasRenderingContext2D): void {
        context.bezierCurveTo(this.p1x, this.p1y, this.p2x, this.p2y, this.ex, this.ey)
    }

    toPathString(): string {
        return `C${this.p1x},${this.p1y},${this.p2x},${this.p2y},${this.ex},${this.ey}`
    }

    getLinePosition(t: number): Point {
        return {
            x: this.getPoint(t, this.sx, this.p1x, this.p2x, this.ex),
            y: this.getPoint(t, this.sy, this.p1y, this.p2y, this.ey)
        }
    }
}

class QuadraticBezierCurve extends Curve {
    constructor(path: Path, parent: { ex: number, ey: number }, p1x: number, p1y: number, ex: number, ey: number, absolute: boolean = false) {
        super(path, parent, p1x, p1y, p1x, p1y, ex, ey, absolute)
    }

    get p2x(): number { return this.p1x };
    set p2x(val: number) { this.data.p2x = val }

    get p2y(): number { return this.p1y };
    set p2y(val: number) { this.data.p2y = val }

    render(context: CanvasRenderingContext2D): void {
        context.quadraticCurveTo(this.p1x, this.p1y, this.ex, this.ey)
    }

    toPathString(): string {
        return `Q${this.p1x},${this.p1y},${this.ex},${this.ey}`
    }

    getPoint(t: number, s: number, p1: number, p2: number, e: number): number {
        return (1 - t) * (1 - t) * s + 2 * t * (1 - t) * p1 + t * t * e
    }
}

class SmoothCurve extends Curve {
    constructor(path: Path, parent: { ex: number, ey: number }, p2x: number, p2y: number, ex: number, ey: number, absolute: boolean = false) {
        super(path, parent, 0, 0, p2x, p2y, ex, ey, absolute)
    }

    get parentIsCurve(): boolean { return !!(this.parent as any).getType().toLowerCase().match(/q|c|s|t/) }

    get p1x(): number { return this.parentIsCurve ? this.parent.ex * 2 - (this.parent as any).p2x : this.p2x };
    set p1x(val: number) { this.data.p1x = val }

    get p1y(): number { return this.parentIsCurve ? this.parent.ey * 2 - (this.parent as any).p2y : this.p2y };
    set p1y(val: number) { this.data.p1y = val }

    render(context: CanvasRenderingContext2D): void {
        context.bezierCurveTo(this.p1x, this.p1y, this.p2x, this.p2y, this.ex, this.ey)
    }

    toPathString(): string {
        return `S${this.p2x},${this.p2y},${this.ex},${this.ey}`
    }
}

class SmoothQuadraticBezierCurve extends Curve {
    constructor(path: Path, parent: { ex: number, ey: number, getType(): string, p1x?: number, p1y?: number }, ex: number, ey: number, absolute: boolean = false) {
        super(path, parent, 0, 0, 0, 0, ex, ey, absolute)
        if (parent.getType().toLowerCase() !== 'q') {
            this.error = 'Smooth Quadratic BezierCurve previous point must a Quadratic Bezier Curve.'
        }
    }

    get p2x(): number { return this.p1x };
    set p2x(val: number) {}

    get p2y(): number { return this.p1y };
    set p2y(val: number) {}

    get p1x(): number { return this.parent.ex * 2 - (this.parent as any).p1x }
    set p1x(val: number) {}

    get p1y(): number { return this.parent.ey * 2 - (this.parent as any).p1y }
    set p1y(val: number) {}

    render(context: CanvasRenderingContext2D): void {
        context.quadraticCurveTo(this.p1x, this.p1y, this.ex, this.ey)
    }

    toPathString(): string {
        return `T${this.ex},${this.ey}`
    }

    getPoint(t: number, s: number, p1: number, p2: number, e: number): number {
        return (1 - t) * (1 - t) * s + 2 * t * (1 - t) * p1 + t * t * e
    }
}

class Arc extends PointBase {
    rx: number
    ry: number
    sweepFlag: number
    largeArcFlag: number
    xAxisRotation: number

    constructor(path: Path, parent: { ex: number, ey: number }, rx: number, ry: number, xAxisRotation: number, largeArcFlag: number, sweepFlag: number, x: number, y: number, absolute: boolean = false) {
        super(path, parent, absolute)
        this.rx = rx
        this.ry = ry
        this.sweepFlag = sweepFlag
        this.largeArcFlag = largeArcFlag
        this.xAxisRotation = xAxisRotation
        this.resetData({
            ex: x,
            ey: y
        })
    }

    resetData(options: Partial<PointData> & Partial<{ rx: number, ry: number, sweepFlag: number, largeArcFlag: number, xAxisRotation: number }>): void {
        this.rx = options.rx ? options.rx : this.rx
        this.ry = options.ry ? options.ry : this.ry
        this.sweepFlag = options.sweepFlag ? options.sweepFlag : this.sweepFlag
        this.largeArcFlag = options.largeArcFlag ? options.largeArcFlag : this.largeArcFlag
        this.xAxisRotation = options.xAxisRotation ? options.xAxisRotation : this.xAxisRotation
        super.resetData(options)
    }

    getStep(): number {
        return 100
    }

    render(context: CanvasRenderingContext2D): void {
        let steps = this.getStep()
        for (let i = 0; i < steps; i += 1) {
            let p = this.getLinePosition(i / steps)
            context.lineTo(p.x, p.y)
        }
    }

    toPathString(): string {
        return `A${this.rx},${this.ry},${this.xAxisRotation},${this.largeArcFlag},${this.sweepFlag},${this.ex},${this.ey}`
    }

    angleBetween(v0: Point, v1: Point): number {
        var p = v0.x * v1.x + v0.y * v1.y
        var n = Math.sqrt((Math.pow(v0.x, 2) + Math.pow(v0.y, 2)) * (Math.pow(v1.x, 2) + Math.pow(v1.y, 2)))
        var sign = v0.x * v1.y - v0.y * v1.x < 0 ? -1 : 1
        var angle = sign * Math.acos(p / n)
        return angle
    }

    getLinePosition(per: number): Point {
        var rx = Math.abs(this.rx)
        var ry = Math.abs(this.ry)
        var prx = Math.pow(rx, 2)
        var pry = Math.pow(ry, 2)
        var xAxisRotationRadians = (this.xAxisRotation % 360) * (Math.PI / 180)
        var xAxisRotationRadiansCos = Math.cos(xAxisRotationRadians)
        var xAxisRotationRadiansSin = Math.sin(xAxisRotationRadians)

        if (this.sx === this.ex && this.sy === this.ey) {
            return { x: this.sx, y: this.sy }
        }

        if (rx === 0 || ry === 0) {
            return {
                x: this.sx * (1 - per) + this.ex * per,
                y: this.sy * (1 - per) + this.ey * per
            }
        }

        var dx = (this.sx - this.ex) / 2
        var dy = (this.sy - this.ey) / 2
        var transformedPoint = {
            x: xAxisRotationRadiansCos * dx + xAxisRotationRadiansSin * dy,
            y: -xAxisRotationRadiansSin * dx + xAxisRotationRadiansCos * dy
        }

        var pTransformedPointX = Math.pow(transformedPoint.x, 2)
        var pTransformedPointY = Math.pow(transformedPoint.y, 2)
        var radiiCheck = pTransformedPointX / prx + pTransformedPointY / pry
        if (radiiCheck > 1) {
            var radiiCheckSqrt = Math.sqrt(radiiCheck)
            rx = radiiCheckSqrt * rx
            ry = radiiCheckSqrt * ry
        }

        var cSquareNumerator = prx * pry - prx * pTransformedPointY - pry * pTransformedPointX
        var cSquareRootDenom = prx * pTransformedPointY + pry * pTransformedPointX
        var cRadicand = cSquareNumerator / cSquareRootDenom
        cRadicand = cRadicand < 0 ? 0 : cRadicand
        var cCoef = (this.largeArcFlag !== this.sweepFlag ? 1 : -1) * Math.sqrt(cRadicand)
        var transformedCenter = {
            x: cCoef * ((rx * transformedPoint.y) / ry),
            y: cCoef * (-(ry * transformedPoint.x) / rx)
        }

        var center = {
            x: xAxisRotationRadiansCos * transformedCenter.x - xAxisRotationRadiansSin * transformedCenter.y + ((this.sx + this.ex) / 2),
            y: xAxisRotationRadiansSin * transformedCenter.x + xAxisRotationRadiansCos * transformedCenter.y + ((this.sy + this.ey) / 2)
        }

        var startVector = {
            x: (transformedPoint.x - transformedCenter.x) / rx,
            y: (transformedPoint.y - transformedCenter.y) / ry
        }
        var startAngle = this.angleBetween({
            x: 1,
            y: 0
        }, startVector)

        var endVector = {
            x: (-transformedPoint.x - transformedCenter.x) / rx,
            y: (-transformedPoint.y - transformedCenter.y) / ry
        }

        var sweepAngle = this.angleBetween(startVector, endVector)
        var cir = 2 * Math.PI

        if (!this.sweepFlag && sweepAngle > 0) {
            sweepAngle -= cir
        } else if (this.sweepFlag && sweepAngle < 0) {
            sweepAngle += cir
        }

        sweepAngle %= cir

        var angle = startAngle + (sweepAngle * per)
        var ellipseComponentX = rx * Math.cos(angle)
        var ellipseComponentY = ry * Math.sin(angle)

        return {
            x: xAxisRotationRadiansCos * ellipseComponentX - xAxisRotationRadiansSin * ellipseComponentY + center.x,
            y: xAxisRotationRadiansSin * ellipseComponentX + xAxisRotationRadiansCos * ellipseComponentY + center.y
        }
    }

    getDistance(p1: Point, p2: Point): number {
        return Supports.getDistance(p1.x, p1.y, p2.x, p2.y)
    }

    getLength(): number {
        if (Compatibility.GeometryElement) {
            return Supports.getSvgLength(`M${this.sx},${this.sy}` + this.toPathString())
        }
        var steps = this.getStep()
        var resultantArcLength = 0
        var prevPoint = this.getLinePosition(0)
        var nextPoint
        for (var i = 0; i < steps; i++) {
            var t = Math.min(Math.max(i * (1 / steps), 0), 1)
            nextPoint = this.getLinePosition(t)
            resultantArcLength += this.getDistance(prevPoint, nextPoint)
            prevPoint = nextPoint
        }
        nextPoint = this.getLinePosition(1)
        resultantArcLength += this.getDistance(prevPoint, nextPoint)
        return resultantArcLength
    }
}

class ClosePath extends LineTo {
    constructor(path: Path, parent: { ex: number, ey: number }, target: { ex: number, ey: number, absolute: boolean }) {
        super(path, parent, target.ex, target.ey, target.absolute)
    }

    render(context: CanvasRenderingContext2D): void {
        context.closePath()
    }

    toPathString(): string {
        return 'z'
    }
}

const Compatibility = {
    GeometryElement: (() => {
        try {
            Supports.getSvgLength('M0,0')
            return true
        } catch (error) {
            return false
        }
    })()
}

PointBase.MoveTo = MoveTo
PointBase.LineTo = LineTo
PointBase.HorizontalLineTo = HorizontalLineTo
PointBase.VerticalLineTo = VerticalLineTo
PointBase.Curve = Curve
PointBase.QuadraticBezierCurve = QuadraticBezierCurve
PointBase.SmoothCurve = SmoothCurve
PointBase.SmoothQuadraticBezierCurve = SmoothQuadraticBezierCurve
PointBase.Arc = Arc
PointBase.ClosePath = ClosePath

export default Path
