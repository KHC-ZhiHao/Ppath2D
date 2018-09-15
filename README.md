# Ppath2D

[![NPM Version][npm-image]][npm-url]

Ppath2D是一個javascript canvas path render函式庫。

P代表position，本庫不僅能夠在cavnas 2d繪製路徑，更能取得路徑的定位與方向，發掘更多有趣的應用與效果。

>此module並未使用Path2D渲染，而是使用更底層的計算方法繪製圖形，不僅是為了降低瀏覽器支援問題，更希望能夠使用在繪圖以外的應用。

## 安裝

webpack

```bash
$ npm i ppath2d
```

html

```html
<script src="https://cdn.rawgit.com/KHC-ZhiHao/Ppath2D/2175b7a6/dist/index.js"></script>
```

## 快速上手

快速的在畫布上繪製一條斜線

html:
```html
<canvas id="demo" width="800" height="600"></canvas>
<script src="./dist/index.js"></script>
```

webpack
```js
import Ppath from 'ppath2d'
let line = new Ppath2D();
```

javascript
```js
let canvas = document.getElementById("demo");
let context = canvas.getContext('2d');
let line = new Ppath2D();
line.moveTo(10,10).lineTo(200,200);
line.render(context);
context.stroke();
```

### 一樣的直線，使用SVG d語法

javascript
```js
let line = new Ppath2D('m10,10 l200,200');
line.render(context);
context.stroke();
```

Ppath2D的路徑可以轉換成d語法

```js
let line = new Ppath2D();
line.moveTo(10,10).lineTo(200,200);
line.toPathString() // "m10,10 l200,200"
```

### 若要解讀多變形，將第二個參數傳入"polygon"

javascript
```js
let line = new Ppath2D(`
    27.729,43.169 11.256,51.829 14.402,33.486 1.075,20.495 19.492,17.819 27.729,1.13 
    35.966,17.819 54.383,20.495 41.056,33.486 44.202,51.829
`, "polygon");
line.render(context);
context.fill();
```

### 獲取定位

傳入一為 **0~1** 的 t 值，及代表起頭與尾巴的位置

```js
let p = new Ppath2D('m10,10 l200,200');
let position = p.getLinePosition(0.5);
//position.x === position.y === 110
```

### 獲取方向

傳入一為 **0~1** 的 t 值，回傳其線路繪製目前的角度

```js
let p = new Ppath2D('m10,10 l200,200');
let direction = p.getDirection(0.5); 
// direction === -225
```

## 描繪函數

你可以藉由下列的描繪函數建立你的路徑

* moveTo(x,y,absolute)
* lineTo(x,y,absolute)
* horizontalLineTo(x,absolute)
* verticalLineTo(y,absolute)
* curve(x1,y1,x2,y2,absolute)
* quadraticBezierCurve(x1,y1,x,y,absolute)
* smoothCurve(x2,y2,x,y,absolute)
* smoothQuadraticBezierCurve(x,y,absolute)
* arc(rx,ry,rotation,large,sweep,x,y,absolute)
* closePath()

## 建議

#### 搭配canvas函式庫
雖然可以直接藉由canvas繪製複雜的線條，但如果要實現SVG animateMotion的效果，落實在具有sprite概念上的函式庫會容易許多。

#### 用繪圖軟體產生d語法來取代描繪函數

使用描繪函數建立路徑是非常不切實際的，善用一個向量圖形軟體來產生d語法，來避免折損自己的右腦才是明智之舉。

## 感謝

[這篇文章幫助我省下大量的撞牆時間，超讚](https://ericeastwood.com/blog/25/curves-and-arcs-quadratic-cubic-elliptical-svg-implementations)

[npm-image]: https://img.shields.io/npm/v/ppath.svg
[npm-url]: https://npmjs.org/package/ppath
