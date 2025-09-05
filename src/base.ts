interface IModuleBase {
    name: string
}

class ModuleBase {
    protected moduleBase: IModuleBase

    constructor(name?: string) {
        this.moduleBase = {
            name: name || 'No module base name.'
        }
    }

    systemError(functionName: string, message: string, object: any = 'no_message'): never {
        if (object !== 'no_message') {
            console.log('%c error object is : ', 'color:#FFF; background:red')
            console.log(object)
        }
        throw new Error(`(☉д⊙)!! ${this.moduleBase.name} => ${functionName} -> ${message}`)
    }
}

export default ModuleBase
