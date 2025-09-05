import { describe, it, expect } from 'vitest'
import { createCanvas } from 'canvas'
import Ppath2D from '../src/index'
import ModuleBase from '../src/base'
import normal from './base64/normal'
import drawALineForD from './base64/draw-a-line-for-d'
import addPath from './base64/add-path'
import polygon from './base64/polygon'
import polyline from './base64/polyline'
import path from './base64/path'
import pathOfD from './base64/path-of-d'

describe('#Base', () => {
    it('normal', () => {
        let base = new ModuleBase('test')
        new ModuleBase()
        expect(() => { base.systemError('test', 'test', 'test') }).toThrow()
        expect(() => { base.systemError('test', 'test') }).toThrow()
    })
})

describe('#Ppath2D', () => {
    it('normal', () => {
        let line = new Ppath2D()
        let canvas = createCanvas(200, 200)
        let context = canvas.getContext('2d')
        line.moveTo(10, 10).lineTo(200, 200)
        line.render(context as any)
        context.stroke()
        expect(canvas.toDataURL()).toBe(normal)
    })
    it('cache', () => {
        let line = new Ppath2D()
        line.moveTo(10, 10).lineTo(200, 200)
        line.setCache(true)
    })
    it('Draw a line for d', () => {
        let line = new Ppath2D('m10,10 l200,200')
        let canvas = createCanvas(200, 200)
        let context = canvas.getContext('2d')
        line.render(context as any)
        context.stroke()
        expect(canvas.toDataURL()).toBe(drawALineForD)
    })
    it('Ppath2D to d string', () => {
        let line = new Ppath2D()
        line.moveTo(10, 10).lineTo(200, 200)
        expect(line.toPathString()).toBe('M10,10L210,210')
    })
    it('Add path', () => {
        let line = new Ppath2D('m10,10 l200,200')
        line.addPath(new Ppath2D('m0,0 l200,200'))
        let canvas = createCanvas(200, 200)
        let context = canvas.getContext('2d')
        line.render(context as any)
        context.stroke()
        expect(canvas.toDataURL()).toBe(addPath)
    })
    it('Add path error', () => {
        let line = new Ppath2D('m10,10 l200,200')
        expect(() => { line.addPath('OuO' as any) }).toThrow()
    })
    it('polygon', () => {
        let line = new Ppath2D(`
        27.729,43.169 11.256,51.829 14.402,33.486 1.075,20.495 19.492,17.819 27.729,1.13 
        35.966,17.819 54.383,20.495 41.056,33.486 44.202,51.829
        `, 'polygon')
        let canvas = createCanvas(200, 200)
        let context = canvas.getContext('2d')
        line.render(context as any)
        context.stroke()
        expect(canvas.toDataURL()).toBe(polygon)
    })
    it('polyline', () => {
        let line = new Ppath2D(`0.5,0.5 211.5,0.5 0.5,81.5 0.5,227.5`, 'polyline')
        let canvas = createCanvas(200, 200)
        let context = canvas.getContext('2d')
        line.render(context as any)
        context.stroke()
        expect(canvas.toDataURL()).toBe(polyline)
    })
    it('position', () => {
        let p = new Ppath2D('m10,10 l200,200')
        let position = p.getLinePosition(0.5)
        expect(position.x).toBe(110)
        expect(position.y).toBe(110)
    })
    it('last position', () => {
        let p = new Ppath2D('m10,10 l200,200')
        let position = p.getLastPosition()
        expect(position.x).toBe(210)
        expect(position.y).toBe(210)
    })
    it('direction', () => {
        let p = new Ppath2D('m10,10 l200,200')
        let direction = p.getDirection(0.5)
        expect(direction).toBe(-225)
    })
    it('path', () => {
        let line = new Ppath2D()
        line.moveTo(20, 20, true)
            .lineTo(100, 100, true)
            .horizontalLineTo(20)
            .verticalLineTo(30)
            .curve(20, 40, 20, 40, 20, 87)
            .smoothCurve(60, 10, 20, 87)
            .quadraticBezierCurve(30, 77, 21, 6)
            .smoothQuadraticBezierCurve(10, 20)
            .arc(100, 20, 0, 0, 1, 50, 30)
            .horizontalLineTo(20, true)
            .closePath()
        let canvas = createCanvas(1000, 1000)
        let context = canvas.getContext('2d')
        line.render(context as any)
        context.stroke()
        expect(canvas.toDataURL()).toBe(path)
    })
    it('path of d', () => {
        let line = new Ppath2D(`M20,20L100,100h20v30c20,40,20,40,20,87s60,10,20,87q30,77,21,6t70,90a100,20,0,0,1,50,30H20z`)
        let canvas = createCanvas(1000, 1000)
        let context = canvas.getContext('2d')
        line.render(context as any)
        context.stroke()
        expect(canvas.toDataURL()).toBe(pathOfD)
    })
})
