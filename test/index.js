const expect = require('chai').expect
const { createCanvas } = require('canvas')
const Ppath2D = require('../src/Path')

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
    // it('cache', function() {
    //     let line = new Ppath2D()
    //     line.moveTo(10, 10).lineTo(200, 200)
    //     line.setCache(true)
    // })
    // it('Draw a line for d', function() {
    //     let line = new Ppath2D('m10,10 l200,200')
    //     let canvas = createCanvas(200, 200)
    //     let context = canvas.getContext('2d')
    //     line.render(context)
    //     context.stroke()
    // })
    // it('Draw a line for d', function() {
    //     let line = new Ppath2D('m10,10 l200,200')
    //     let canvas = createCanvas(200, 200)
    //     let context = canvas.getContext('2d')
    //     line.render(context)
    //     context.stroke()
    // })
})
