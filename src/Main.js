const Path = require('./Path')

class Main {
    constructor(data, mode) {
        this._core = new Path(data, mode)
    }

    setCache(enable) {
        this._core.setCache(enable)
    }

    addPath(path) {
        if (path instanceof Main) {
            this._core.addPath(path._core)
            return this
        } else {
            this.systemError('addPath', 'Object not a Ppath2D data.', path)
        }
    }

    render(context) {
        this._core.render(context)
    }

    toPathString() {
        return this._core.toPathString()
    }

    getLastPosition() {
        return this._core.getLastPosition()
    }

    getLinePosition(t) {
        return this._core.getLinePosition(t)
    }

    getDirection(t) {
        return this._core.getDirection(t)
    }

    moveTo(x, y, abs) {
        this._core.moveTo(x, y, abs)
        return this
    }

    lineTo(x, y, abs) {
        this._core.lineTo(x, y, abs)
        return this
    }

    curve(x1, y1, x2, y2, x, y, abs) {
        this._core.curve(x1, y1, x2, y2, x, y, abs)
        return this
    }

    quadraticBezierCurve(x1, y1, x, y, abs) {
        this._core.quadraticBezierCurve(x1, y1, x, y, abs)
        return this
    }

    smoothCurve(x2, y2, x, y, abs) {
        this._core.smoothCurve(x2, y2, x, y, abs)
        return this
    }

    smoothQuadraticBezierCurve(x, y, abs) {
        this._core.smoothQuadraticBezierCurve(x, y, abs)
        return this
    }

    horizontalLineTo(x, abs) {
        this._core.horizontalLineTo(x, abs)
        return this
    }

    verticalLineTo(y, abs) {
        this._core.verticalLineTo(y, abs)
        return this
    }

    arc(rx, ry, rotation, large, sweep, x, y, abs) {
        this._core.arc(rx, ry, rotation, large, sweep, x, y, abs)
        return this
    }

    closePath() {
        this._core.closePath()
        return this
    }
}

module.exports = Main
