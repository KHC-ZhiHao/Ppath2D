class ModuleBase {

    constructor( name ){
        this.moduleBase = {
            name : name || "No module base name.",
        }
    }

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

    systemError( functionName, message, object ){
        if( object ){
            console.log( `%c error object is : `, 'color:#FFF; background:red' );
            console.log( object );
        }
        throw new Error( `(☉д⊙)!! ${this.moduleBase.name} => ${functionName} -> ${message}` );
    }

}