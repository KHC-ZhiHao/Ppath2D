
(function( root, factory ){

    let moduleName = "Ppath2D";

    if( typeof module !== 'undefined' && typeof exports === 'object' ) {
        module.exports = factory();
    }
    else if ( typeof define === 'function' && (define.amd || define.cmd) ) {
        define(function() { return factory; });
    } 
    else {
        root[moduleName] = factory();
    }
    
})( this || (typeof window !== 'undefined' ? window : global), function(){

    class ModuleBase {

        constructor( name ){
            this.moduleBase = {
                name : name || "No module base name.",
            }
        }
    
        /**
         * @function each(array|object,callback)
         * @desc 跑一個迴圈
         */
    
        each( target, callback ){
            if( typeof target === "object" ){
                if( Array.isArray(target) ){
                    var len = target.length;
                    for( let i = 0 ; i < len ; i++){
                        var br = callback( target[i], i );
                        if( br === "_break" ){ break; }
                        if( br === "_continue" ){ continue; }
                    }
                }else{
                    for( let key in target ){
                        var br = callback( target[key], key );
                        if( br === "_break" ){ break; }
                        if( br === "_continue" ){ continue; }
                    }
                }
            }else{
                this.systemError("each", "Not a object or array.", target);
            }
        }
    
        /**
        * @function systemError(functionName,maessage,object)
        * @desc 於console呼叫錯誤，中斷程序並顯示錯誤的物件
        */
        
        systemError( functionName, message, object ){
            if( object ){
                console.log( `%c error object is : `, 'color:#FFF; background:red' );
                console.log( object );
            }
            throw new Error( `(☉д⊙)!! ${this.moduleBase.name} => ${functionName} -> ${message}` );
        }
    
    }

    class Path extends ModuleBase {

        constructor(data, mode){
            super("Path");
            this.points = [];
            this.length = 0;
            if(data){
                let type = typeof data;
                if( type === "string" ){
                    this.compile( data.trim(), mode );
                }
            }
        }
    
        compile( data, mode = "path" ){
            let list = {
                a : "arc",
                m : "moveTo",
                l : "lineTo",
                h : "horizontalLineTo",
                v : "verticalLineTo",
                c : "curve",
                q : "quadraticBezierCurve",
                s : "smoothCurve",
                t : "smoothQuadraticBezierCurve",
                z : "closePath",
            }
            if( mode === 'path' ){
                let keys = Object.keys(list);
                let index = -1;
                let params = [""];
                for( let i = 0 ; i < data.length ; i++ ){
                    if( /[a-zA-z]/.test(data[i]) ){
                        index += 1;
                        params[index] = "";
                    }
                    if( data[i] === "-" ){
                        params[index] += " ";
                    }
                    params[index] += data[i];
                }
                this.each( params, (param)=>{
                    let pt = param.trim();
                    let key = pt.slice(0,1);
                    let data = pt.slice(1).split(/,|\s/).filter((t)=>{return t !== ""}).map((d)=>{
                        return Number(d);
                    });
                    if( keys.indexOf(key.toLowerCase()) !== -1 ){
                        if( /[a-z]/.test(key) ){
                            this[list[key.toLowerCase()]](...data, false);
                        }else{
                            this[list[key.toLowerCase()]](...data, true);
                        }
                    }else{
                        this.systemError("compile", "Key name not found", key);
                    }
                })
            }else if( mode === "polygon" ){
                let params = "";
                for( let i = 0 ; i < data.length ; i++ ){
                    if( data[i] === "-" ){ params += " "; }
                    params += data[i];
                }
                var data = params.split(/,|\s/).filter((t)=>{return t !== ""}).map((d)=>{
                    return Number(d);
                });
                this.moveTo( data[0], data[1], true );
                for( let i = 2 ; i < data.length ; i+=2 ){
                    this.lineTo( data[i], data[i+1], true );
                }
                this.closePath();
            }
        }
    
        eachPoint(callback){
            let len = this.points.length;
            for( let i = 0 ; i < len ; i++ ){
                callback(this.points[i]);
            }
        }
    
        addPoint(point){
            if( point.error ){ this.systemError( "addPoint", point.error, point ); }
            this.points.push(point);
            this.length += point.length;
        }
    
        addPath(path){
            this.compile(path.toString());
        }
    
        refresh(){
            this.length = 0;
            this.eachPoint((point)=>{
                point.refresh();
                this.length += point.length;
            });
        }
    
        render(context){
            context.beginPath();
            this.eachPoint((point)=>{
                point.render(context);
            });
        }
    
        toPathString(){
            let string = "";
            this.eachPoint((point)=>{
                string += point.toPathString();
            });
        }
    
        getLastPoint(){
            return this.points.length === 0 ? this : this.points.slice(-1)[0];
        }
    
        getLastPosition(){
            let p = this.points.length !== 0 ? this.points.slice(-1)[0].getLastPosition() : null;
            return p ? p : { x : 0, y : 0 };
        }
    
        getLinePosition(t){
            let target = null;
            let dis = this.length * t;
            let len = this.points.length;
            for( let i = 0 ; i < len ; i++ ){
                if( dis <= this.points[i].length ){
                    if( this.points[i] ){
                        target = this.points[i];
                        break;
                    }
                }else{
                    dis -= this.points[i].length;
                }
            }
            if( target ){
                return target.getLinePosition( dis / target.length );
            }else{
                return this.getLastPosition();
            }
        }
    
        getDirection(t){
            let to = t + 0.01;
            let p1 = this.getLinePosition(t);
            let p2 = this.getLinePosition(to);
            return Path.Math.getAngle( p1.x, p1.y, p2.x, p2.y ) - 270;
        }
    
        moveTo( x, y, abs = false ){
            this.addPoint( new Path.PointBase.MoveTo( this, x, y, abs ) );
            return this;
        }
    
        lineTo( x, y, abs = false ){
            this.addPoint( new Path.PointBase.LineTo( this, this.getLastPoint(), x, y, abs ) );
            return this;
        }
    
        curve( x1, y1, x2, y2, x, y, abs = false ){
            this.addPoint( new Path.PointBase.Curve( this, this.getLastPoint(), x1, y1, x2, y2, x ,y, abs ) );
            return this;
        }
    
        quadraticBezierCurve( x1, y1, x, y, abs = false ){
            this.addPoint( new Path.PointBase.QuadraticBezierCurve( this, this.getLastPoint(), x1, y1, x , y, abs ) );
            return this;
        }
    
        smoothCurve( x2, y2, x, y, abs = false ){
            this.addPoint( new Path.PointBase.SmoothCurve( this, this.getLastPoint(), x2, y2, x , y, abs ) );
            return this;
        }
    
        smoothQuadraticBezierCurve( x, y, abs = false ){
            this.addPoint(new Path.PointBase.SmoothQuadraticBezierCurve( this, this.getLastPoint(), x, y, abs ));
            return this;
        }
    
        horizontalLineTo( x, abs = false ){
            this.addPoint(new Path.PointBase.HorizontalLineTo( this, this.getLastPoint(), x, abs ));
            return this;
        }
    
        verticalLineTo( y, abs = false ){
            this.addPoint(new Path.PointBase.VerticalLineTo( this, this.getLastPoint(), y, abs ));
            return this;
        }
    
        arc( rx, ry, rotation, large, sweep, x, y, abs = false ){
            this.addPoint(new Path.PointBase.Arc( this, this.getLastPoint(), rx, ry, rotation, large, sweep, x, y, abs ));
            return this;
        }
    
        closePath(){
            this.addPoint(new Path.PointBase.ClosePath(this, this.getLastPoint()));
            return this;
        }
    
    }
    
    Path.Math = class {
    
        static getDistance( x, y, ax, ay ){
            return Math.sqrt(Math.pow(( ax - x ), 2) + Math.pow(( ay - y ), 2))
        }
    
        static getAngle( x, y, ax, ay ){
            if( x == ax && y == ay ){ return 0; }
            var angle = Math.atan2(( ay - y ), ( ax - x )) * 180 / Math.PI;
            return angle > 0 ? angle : 360 + angle;
        }
    
    }
    
    Path.PointBase = class {
    
        constructor( path, parent, absolute = false ){
            this.error = null;
            this.absolute = !!absolute;
            this.initData();
            this.resetReference( path, parent );
            this.refresh();
        }
    
        get sx(){ return this.parent.ex }
        get sy(){ return this.parent.ey }
    
        get ex(){ return this.absolute ? this.data.ex : this.data.ex + this.sx; }
        set ex(val){ this.data.ex = val; }
    
        get ey(){ return this.absolute ? this.data.ey : this.data.ey + this.sy; }
        set ey(val){ this.data.ey = val; }
    
        get p1x(){ return this.absolute ? this.data.p1x : this.data.p1x + this.sx; }
        set p1x(val){ this.data.p1x = val; }
    
        get p1y(){ return this.absolute ? this.data.p1y : this.data.p1y + this.sy; }
        set p1y(val){ this.data.p1y = val; }
    
        get p2x(){ return this.absolute ? this.data.p2x : this.data.p2x + this.sx; }
        set p2x(val){ this.data.p2x = val; }
    
        get p2y(){ return this.absolute ? this.data.p2y : this.data.p2y + this.sy; }
        set p2y(val){ this.data.p2y = val; }
    
        resetReference( path, parent ){
            this.path = path;
            this.parent = parent ? parent : this.parent;
        }
    
        initData(){
            this.length = 0;
            this.data = {
                p1x : 0,
                p1y : 0,
                p2x : 0,
                p2y : 0,
                ex : 0,
                ey : 0,
            };
        }
    
        reset( options ){
            for( let key in options ){
                if( this.data[key] != null ){
                    this[key] = options[key];
                }
            }
            this.refresh();
        }
    
        refresh(){
            this.length = this.getLength();
        }
    
        getLength(){
            return 0;
        }
    
        getLastPosition(){
            return { x : this.ex, y : this.ey }
        }
    
        getType(){
            return this.toPathString().trim()[0];
        }
    
    }
    
    Path.PointBase.MoveTo = class extends Path.PointBase {
    
        constructor( path, x, y, absolute ){
            super( path, { ex : 0, ey : 0 }, absolute );
            this.reset({
                ex : x,
                ey : y,
            });
        }
    
        render(context){
            context.moveTo( this.ex, this.ey );
        }
    
        toPathString(){
            return `${this.absolute ? "M" : "m"}${this.ex},${this.ey}`;
        }
        
        getLinePosition(t){
            return { 
                x : this.ex,
                y : this.ey,
            }
        }
    
    }
    
    
    Path.PointBase.LineTo = class extends Path.PointBase {
    
        constructor( path, parent, x, y, absolute ){
            super( path, parent, absolute );
            this.reset({
                ex : x,
                ey : y,
            });
        }
    
        render(context){
            context.lineTo( this.ex, this.ey );
        }
    
        toPathString(){
            return `${this.absolute ? "L" : "l"}${this.ex},${this.ey}`;
        }
        
        getLinePosition(t){
            return { 
                x : this.sx * (1 - t) + this.ex * t,
                y : this.sy * (1 - t) + this.ey * t,
            }
        }
    
        getLength(){
            return Path.Math.getDistance( this.sx, this.sy, this.ex, this.ey );
        }
    
    }
    
    Path.PointBase.HorizontalLineTo = class extends Path.PointBase.LineTo {
    
        constructor( path, parent, x, absolute ){
            super( path, parent, x, 0, absolute );
        }
    
        toPathString(){
            return `${this.absolute ? "H" : "h"}${this.ex}`;
        }
    
    }
    
    Path.PointBase.VerticalLineTo = class extends Path.PointBase.LineTo {
    
        constructor( path, parent, y, absolute ){
            super( path, parent, 0, y, absolute );
        }
    
        toPathString(){
            return `${this.absolute ? "V" : "v"}${this.ey}`;
        }
    
    }
    
    Path.PointBase.Curve = class extends Path.PointBase {
    
        constructor( path, parent, x1, y1, x2, y2, x, y, absolute = false ){
            super( path, parent, absolute );
            this.reset({
                p1x : x1,
                p1y : y1,
                p2x : x2,
                p2y : y2,
                ex : x,
                ey : y,
            });
        }
    
        getStep(){
            return 100;
        }
    
        getPoint( t, s, p1, p2, e ){
            return s * (1 - t) * (1 - t) * (1 - t) + 3 * p1 * (1 - t) * (1 - t) * t + 3 * p2 * (1 - t) * t * t + e * t * t * t;
        }
    
        getLength(){
            var x = 0;
            var y = 0;
            var t = 0;
            var length = 0;
            var steps = this.getStep();
            var previousDotX = 0;
            var previousDotY = 0;
            for ( let i = 0; i <= steps ; i++ ) {
                t = i / steps;
                x = this.getPoint( t, this.sx, this.p1x, this.p2x, this.ex);
                y = this.getPoint( t, this.sy, this.p1y, this.p2y, this.ey);
                if( i > 0 ) {
                    var diffX = x - previousDotX;
                    var diffY = y - previousDotY;
                    length += Math.sqrt( diffX * diffX + diffY * diffY );
                }
                previousDotX = x;
                previousDotY = y;
            }
            return length;
        }
    
        render(context){
            context.bezierCurveTo( this.p1x, this.p1y, this.p2x, this.p2y, this.ex, this.ey );
        }
    
        toPathString(){
            return `${this.absolute ? "C" : "c"}${this.p1x},${this.p1y},${this.p2x},${this.p2y},${this.ex},${this.ey}`;
        }
    
        getLinePosition(t){
            return { 
                x : this.getPoint( t, this.sx, this.p1x, this.p2x, this.ex),
                y : this.getPoint( t, this.sy, this.p1y, this.p2y, this.ey)
            }
        }
    
    }
    
    Path.PointBase.QuadraticBezierCurve = class extends Path.PointBase.Curve {
        
        constructor( path, parent, p1x, p1y, ex, ey, absolute = false ){
            super( path, parent, p1x, p1y, p1x, p1y, ex, ey, absolute );
        }
    
        get p2x(){ return this.p1x };
        set p2x(val){ this.data.p2x = val; }
    
        get p2y(){ return this.p1y };
        set p2y(val){ this.data.p2y = val; }
    
        render(context){
            context.quadraticCurveTo( this.p1x, this.p1y, this.ex, this.ey );
        }
    
        toPathString(){
            return `${this.absolute ? "Q" : "q"}${this.p1x},${this.p1y},${this.ex},${this.ey}`;
        }
    
        getPoint( t, s, p1, p2, e ){
            return (1 - t) * (1 - t) * s + 2 * t * (1 - t) * p1 + t * t * e;
        }
    
    }
    
    Path.PointBase.SmoothCurve = class extends Path.PointBase.Curve {
        
        constructor( path, parent, p2x, p2y, ex, ey, absolute = false ){
            super( path, parent, 0, 0, p2x, p2y, ex, ey, absolute );
        }
    
        get parentIsCurve(){ return !!this.parent.getType().toLowerCase().match(/q|c|s|t/) }
    
        get p1x(){ return this.parentIsCurve ? this.parent.ex * 2 - this.parent.p2x : this.p2x };
        set p1x(val){ this.data.p1x = val; }
        
        get p1y(){ return this.parentIsCurve ? this.parent.ey * 2 - this.parent.p2y : this.p2y };
        set p1y(val){ this.data.p1y = val; }
    
        render(context){
            context.bezierCurveTo( this.p1x, this.p1y, this.p2x, this.p2y, this.ex, this.ey );
        }
    
        toPathString(){
            return `${this.absolute ? "S" : "s"}${this.p2x},${this.p2y},${this.ex},${this.ey}`;
        }
    
    }
    
    Path.PointBase.SmoothQuadraticBezierCurve = class extends Path.PointBase.Curve {
        
        constructor( path, parent, ex, ey, absolute = false ){
            super( path, parent, 0, 0, 0, 0, ex, ey, absolute );
            if( parent.getType().toLowerCase() !== "q" ){
                this.error = "Smooth Quadratic BezierCurve previous point must a Quadratic Bezier Curve.";
            }
        }
    
        get p2x(){ return this.p1x };
        set p2x(val){}
    
        get p2y(){ return this.p1y };
        set p2y(val){}
    
        get p1x(){ return this.parent.ex * 2 - this.parent.p1x }
        set p1x(val){}
    
        get p1y(){ return this.parent.ey * 2 - this.parent.p1y }
        set p1y(val){}
    
        render(context){
            context.quadraticCurveTo( this.p1x, this.p1y, this.ex, this.ey );
        }
    
        toPathString(){
            return `${this.absolute ? "T" : "t"}${this.ex},${this.ey}`;
        }
    
        getPoint( t, s, p1, p2, e ){
            return (1 - t) * (1 - t) * s + 2 * t * (1 - t) * p1 + t * t * e;
        }
    
    }
    
    //Thanks!
    //https://ericeastwood.com/blog/25/curves-and-arcs-quadratic-cubic-elliptical-svg-implementations
    Path.PointBase.Arc = class extends Path.PointBase{
    
        constructor( path, parent, rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y, absolute = false ){
            super( path, parent, absolute );
            this.rx = rx;
            this.ry = ry;
            this.sweepFlag = sweepFlag;
            this.largeArcFlag = largeArcFlag;
            this.xAxisRotation = xAxisRotation;
            this.reset({
                ex : x,
                ey : y,
            });
        }
    
        reset(options){
            this.rx = options.rx ? options.rx : this.rx;
            this.ry = options.ry ? options.ry : this.ry;
            this.sweepFlag = options.sweepFlag ? options.sweepFlag : this.sweepFlag;
            this.largeArcFlag = options.largeArcFlag ? options.largeArcFlag : this.largeArcFlag;
            this.xAxisRotation = options.xAxisRotation ? options.xAxisRotation : this.xAxisRotation;
            super.reset(options);
        }
    
        getStep(){
            return 100;
        }
    
        render(context){
            let steps = this.getStep();
            for( let i = 0 ; i < steps; i += 1 ){
                let p = this.getLinePosition( i / steps );
                context.lineTo( p.x, p.y );
            }
        }
    
        toPathString(){
            return `${this.absolute ? "A" : "a"}${this.rx},${this.ry},${this.xAxisRotation},${this.largeArcFlag},${this.sweepFlag},${this.ex},${this.ey}`;
        }
    
        angleBetween(v0, v1) {
            var p = v0.x * v1.x + v0.y * v1.y;
            var n = Math.sqrt((Math.pow( v0.x, 2 ) + Math.pow( v0.y, 2 )) * ( Math.pow( v1.x, 2 ) + Math.pow( v1.y, 2 )));
            var sign = v0.x * v1.y - v0.y * v1.x < 0 ? -1 : 1;
            var angle = sign * Math.acos( p / n );
            return angle;
        }
        
        getLinePosition(per){
    
            var rx = Math.abs(this.rx);
            var ry = Math.abs(this.ry);
            var prx = Math.pow(rx, 2);
            var pry = Math.pow(ry, 2);
            var xAxisRotationRadians = ( this.xAxisRotation % 360 ) * (Math.PI / 180);
            var xAxisRotationRadiansCos = Math.cos(xAxisRotationRadians);
            var xAxisRotationRadiansSin = Math.sin(xAxisRotationRadians);
    
            if( this.sx === this.ex && this.sy === this.ey ) {
                return { x : this.sx, y : this.sy, };
            }
    
            if( rx === 0 || ry === 0 ) {
                return { 
                    x : this.sx * (1 - per) + this.ex * per,
                    y : this.sy * (1 - per) + this.ey * per,
                };
            }
    
            var dx = ( this.sx - this.ex ) / 2;
            var dy = ( this.sy - this.ey ) / 2;
            var transformedPoint = {
                x : xAxisRotationRadiansCos * dx + xAxisRotationRadiansSin * dy,
                y : -xAxisRotationRadiansSin * dx + xAxisRotationRadiansCos * dy
            };
    
            var pTransformedPointX = Math.pow(transformedPoint.x, 2);
            var pTransformedPointY = Math.pow(transformedPoint.y, 2);
            var radiiCheck = pTransformedPointX / prx + pTransformedPointY / pry;
            if( radiiCheck > 1 ) {
                var radiiCheckSqrt = Math.sqrt(radiiCheck);
                rx = radiiCheckSqrt * rx;
                ry = radiiCheckSqrt * ry;
            }
    
            var cSquareNumerator = prx * pry - prx * pTransformedPointY - pry * pTransformedPointX;
            var cSquareRootDenom = prx * pTransformedPointY + pry * pTransformedPointX;
            var cRadicand = cSquareNumerator/cSquareRootDenom;
                cRadicand = cRadicand < 0 ? 0 : cRadicand;
            var cCoef = ( this.largeArcFlag !== this.sweepFlag ? 1 : -1) * Math.sqrt( cRadicand );
            var transformedCenter = {
                x: cCoef * ( ( rx * transformedPoint.y) / ry ),
                y: cCoef * ( -(ry * transformedPoint.x) / rx )
            };
    
            var center = {
                x: xAxisRotationRadiansCos * transformedCenter.x - xAxisRotationRadiansSin * transformedCenter.y + ((this.sx + this.ex) / 2),
                y: xAxisRotationRadiansSin * transformedCenter.x + xAxisRotationRadiansCos * transformedCenter.y + ((this.sy + this.ey) / 2)
            };
    
            var startVector = {
                x: ( transformedPoint.x - transformedCenter.x) / rx,
                y: ( transformedPoint.y - transformedCenter.y) / ry
            };
            var startAngle = this.angleBetween({
                x: 1,
                y: 0
            }, startVector);
            
            var endVector = {
                x: (-transformedPoint.x - transformedCenter.x) / rx,
                y: (-transformedPoint.y - transformedCenter.y) / ry
            };
    
            var sweepAngle = this.angleBetween( startVector, endVector );
            var cir = 2 * Math.PI;
            
            if( !this.sweepFlag && sweepAngle > 0 ) {
                sweepAngle -= cir;
            }
            else if(this.sweepFlag && sweepAngle < 0) {
                sweepAngle += cir;
            }
    
            sweepAngle %= cir;
            
            var angle = startAngle + ( sweepAngle * per );
            var ellipseComponentX = rx * Math.cos(angle);
            var ellipseComponentY = ry * Math.sin(angle);
    
            return {
                x: xAxisRotationRadiansCos * ellipseComponentX - xAxisRotationRadiansSin * ellipseComponentY + center.x,
                y: xAxisRotationRadiansSin * ellipseComponentX + xAxisRotationRadiansCos * ellipseComponentY + center.y
            };
    
        }
    
        getDistance( p1, p2 ){
            return Path.Math.getDistance( p1.x, p1.y, p2.x, p2.y );
        }
    
        getLength(){
            var steps = this.getStep();
            var resultantArcLength = 0;
            var prevPoint = this.getLinePosition(0);
            var nextPoint;
            for(var i = 0; i < steps; i++) {
                var t = Math.min( Math.max( i * ( 1 / steps ), 0 ), 1 );
                nextPoint = this.getLinePosition(t);
                resultantArcLength += this.getDistance( prevPoint, nextPoint );
                prevPoint = nextPoint;
            }
            nextPoint = this.getLinePosition(1);
            resultantArcLength += this.getDistance(prevPoint, nextPoint);
            return resultantArcLength;
        }
    
    }
    
    Path.PointBase.ClosePath = class extends Path.PointBase.LineTo {
    
        constructor( path, parent ){
            super( path, parent, 0, 0 );
        }
    
        get ex(){ return this.path.points[0].ex }
        set ex(val){}
    
        get ey(){ return this.path.points[0].ey }
        set ey(val){}
    
        render(context){
            context.closePath();
        }
    
        toPathString(){
            return "z";
        }
    
    }

    return Path;

})