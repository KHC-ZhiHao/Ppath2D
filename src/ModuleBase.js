class ModuleBase {
    constructor(name) {
        this.moduleBase = {
            name: name || 'No module base name.'
        }
    }

    systemError(functionName, message, object = 'no_message') {
        if (object !== 'no_message') {
            console.log(`%c error object is : `, 'color:#FFF; background:red')
            console.log(object)
        }
        throw new Error(`(☉д⊙)!! ${this.moduleBase.name} => ${functionName} -> ${message}`)
    }
}

module.exports = ModuleBase
