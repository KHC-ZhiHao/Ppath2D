const expect = require('chai').expect
const { createCanvas } = require('canvas')
const Ppath2D = require('../src/Main')
const ModuleBase = require('../src/ModuleBase')

describe('#Base', () => {
    it('normal', function() {
        let base = new ModuleBase('test')
        new ModuleBase()
        expect(function() { base.systemError('test', 'test', 'test') }).to.throw(Error)
        expect(function() { base.systemError('test', 'test') }).to.throw(Error)
    })
})

describe('#Ppath2D', () => {
    it('normal', function() {
        let line = new Ppath2D()
        let canvas = createCanvas(200, 200)
        let context = canvas.getContext('2d')
        line.moveTo(10, 10).lineTo(200, 200)
        line.render(context)
        context.stroke()
        expect(canvas.toDataURL() === require('./base64/normal')).to.equal(true)
    })
    it('cache', function() {
        let line = new Ppath2D()
        line.moveTo(10, 10).lineTo(200, 200)
        line.setCache(true)
    })
    it('Draw a line for d', function() {
        let line = new Ppath2D('m10,10 l200,200')
        let canvas = createCanvas(200, 200)
        let context = canvas.getContext('2d')
        line.render(context)
        context.stroke()
        expect(canvas.toDataURL() === require('./base64/draw-a-line-for-d')).to.equal(true)
    })
    it('Ppath2D to d string', function() {
        let line = new Ppath2D()
        line.moveTo(10, 10).lineTo(200, 200)
        expect(line.toPathString()).to.equal('M10,10L210,210')
    })
    it('Add Path', function() {
        let line = new Ppath2D('m10,10 l200,200')
        line.addPath(new Ppath2D('m0,0 l200,200'))
        let canvas = createCanvas(200, 200)
        let context = canvas.getContext('2d')
        line.render(context)
        context.stroke()
        expect(canvas.toDataURL() === require('./base64/add-path')).to.equal(true)
    })
    it('polygon', function() {
        let line = new Ppath2D(`
        27.729,43.169 11.256,51.829 14.402,33.486 1.075,20.495 19.492,17.819 27.729,1.13 
        35.966,17.819 54.383,20.495 41.056,33.486 44.202,51.829
        `, 'polygon')
        let canvas = createCanvas(200, 200)
        let context = canvas.getContext('2d')
        line.render(context)
        context.stroke()
        expect(canvas.toDataURL() === require('./base64/polygon')).to.equal(true)
    })
    it('polyline', function() {
        let line = new Ppath2D(`0.5,0.5 211.5,0.5 0.5,81.5 0.5,227.5`, 'polyline')
        let canvas = createCanvas(200, 200)
        let context = canvas.getContext('2d')
        line.render(context)
        context.stroke()
        expect(canvas.toDataURL() === require('./base64/polyline')).to.equal(true)
    })
    it('position', function() {
        let p = new Ppath2D('m10,10 l200,200')
        let position = p.getLinePosition(0.5)
        expect(position.x).to.equal(110)
        expect(position.y).to.equal(110)
    })
    it('last position', function() {
        let p = new Ppath2D('m10,10 l200,200')
        let position = p.getLastPosition()
        expect(position.x).to.equal(210)
        expect(position.y).to.equal(210)
    })
    it('direction', function() {
        let p = new Ppath2D('m10,10 l200,200')
        let direction = p.getDirection(0.5)
        expect(direction).to.equal(-225)
    })
    it('path', function() {
        let line = new Ppath2D(`M20,20L100,100h20v30c20,40,20,40,20,87s60,10,20,87q30,77,21,6t70,90a100,20,0,0,1,50,30H20z`)
        let canvas = createCanvas(200, 200)
        let context = canvas.getContext('2d')
        line.render(context)
        expect(canvas.toDataURL() === require('./base64/path')).to.equal(true)
    })
})
