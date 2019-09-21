<br>
<p align="center"><img src="./logo.png"></p>
<br>
<p align="center">
    <a href="https://www.npmjs.com/package/ppath2d"><img src="https://img.shields.io/npm/v/ppath2d.svg"></a>
    <a href="https://travis-ci.org/KHC-ZhiHao/Ppath2D">
    <img src="https://travis-ci.org/KHC-ZhiHao/Ppath2D.svg?branch=master" alt="travis-ci"  style="max-width:100%;">
    </a>
    <a href="https://coveralls.io/github/KHC-ZhiHao/Ppath2D?branch=master">
        <img src="https://coveralls.io/repos/github/KHC-ZhiHao/Ppath2D/badge.svg?branch=master" alt="Coverage Status"  style="max-width:100%;">
    </a>
    <a href="https://standardjs.com/">
        <img src="https://img.shields.io/badge/code_style-standard-brightgreen.svg" alt="Standard Code Style"  style="max-width:100%;">
    </a>
    <a href="https://github.com/KHC-ZhiHao/Packhouse"><img src="https://img.shields.io/github/stars/KHC-ZhiHao/Packhouse.svg?style=social"></a>
    <br>
</p>

<br>

## 摘要

Ppath2D是一個純數學的javascript路徑模組，P代表position，代表不僅能夠在cavnas 2d繪製路徑，更能取得路徑的定位與方向。

[使用路徑模擬路燈底下的飛蟻](https://khc-zhihao.github.io/Ppath2D/demo/index.html)

[線上模擬工具](https://khc-zhihao.github.io/Ppath2D/demo/try.html)

---

### 安裝

#### webpack or nodejs

```bash
$ npm i ppath2d
```

#### html

```html
<script src="https://rawcdn.githack.com/KHC-ZhiHao/Ppath2D/master/dist/index.js"></script>
```

---

### 瀏覽器支援

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>IE / Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari-ios/safari-ios_48x48.png" alt="iOS Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>iOS Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/samsung-internet/samsung-internet_48x48.png" alt="Samsung" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Samsung | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png" alt="Opera" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Opera |
| --------- | --------- | --------- | --------- | --------- | --------- | --------- |
| IE11 and up| Support| Support| Support| Support| Support| Support

---

### 快速上手

#### 快速的在畫布上繪製一條斜線

html

```html
<canvas id="demo" width="800" height="600"></canvas>
<script src="./dist/index.js"></script>
```

webpack

```js
import Ppath2D from 'ppath2d'
let line = new Ppath2D()
```

javascript

```js
let canvas = document.getElementById('demo')
let context = canvas.getContext('2d')
let line = new Ppath2D()
line.moveTo(10,10).lineTo(200,200)
line.render(context)
context.stroke()
```

#### 一樣的直線，使用SVG d語法

```js
let line = new Ppath2D('m10,10 l200,200')
line.render(context)
context.stroke()
```

Ppath2D的路徑可以轉換成d語法

```js
let line = new Ppath2D()
line.moveTo(10,10).lineTo(200,200)
line.toPathString() // 'M10,10L210,210'
```

#### 加入路徑

可於尾端加入一條 *Ppath2D* 的路徑

```js
let line = new Ppath2D('m10,10 l200,200')
    line.addPath(new Ppath2D('m0,0 l200,200'))
```

#### 若要解讀多邊形，將第二個參數傳入"polygon"

```js
let line = new Ppath2D(`
    27.729,43.169 11.256,51.829 14.402,33.486 1.075,20.495 19.492,17.819 27.729,1.13 
    35.966,17.819 54.383,20.495 41.056,33.486 44.202,51.829
`, 'polygon')
line.render(context)
context.fill()
```

#### 若要解讀多折線，將第二個參數傳入"polyline"

```js
let line = new Ppath2D(`0.5,0.5 211.5,0.5 0.5,81.5 0.5,227.5`, 'polyline')
line.render(context)
context.stroke()
```

#### 獲取定位

```js
let p = new Ppath2D('m10,10 l200,200')
let position = p.getLinePosition(0.5)
//getLinePosition(t) t is begin to finish (0~1)
//position.x === position.y === 110
```

##### 獲取終點

```js
let p = new Ppath2D('m10,10 l200,200')
let position = p.getLastPosition()
//position.x === position.y === 210
```

#### 獲取方向

```js
let p = new Ppath2D('m10,10 l200,200')
let direction = p.getDirection(0.5)
//getDirection(t) t is begin to finish (0~1)
//direction === -225
```

---

### 描繪函數

你可以藉由下列的描繪函數建立你的路徑

* moveTo(x,y,absolute)
* lineTo(x,y,absolute)
* horizontalLineTo(x,absolute)
* verticalLineTo(y,absolute)
* curve(x1,y1,x2,y2,x,y,absolute)
* quadraticBezierCurve(x1,y1,x,y,absolute)
* smoothCurve(x2,y2,x,y,absolute)
* smoothQuadraticBezierCurve(x,y,absolute)
* arc(rx,ry,rotation,large,sweep,x,y,absolute)
* closePath()

---

### 快取模式

如果某些路徑需要大量的運算資源，這是空間換取時間的方法。

```js
let line = new Ppath2D()
line.moveTo(10,10).lineTo(200,200)
line.setCache(true)
```

---

## 關於Nodejs

因為是純數學，所以nodejs也可以運行Ppath2D，可以藉由node-canvas畫出路徑：

```js
let { createCanvas } = require('canvas')
let fs = require('fs')
let Ppath2D = require('./src/Path.js')
let canvas = createCanvas(200, 200)
let context = canvas.getContext('2d')
let line = new Ppath2D('m0,0 l200,200')
line.render(context)
context.stroke()
let buffer = canvas.toBuffer()
fs.writeFileSync('./line.png', buffer)
```

---

### 參考

[Mathematical formula](https://ericeastwood.com/blog/25/curves-and-arcs-quadratic-cubic-elliptical-svg-implementations)

[npm-image]: https://img.shields.io/npm/v/ppath2d.svg
[npm-url]: https://npmjs.org/package/ppath2d
