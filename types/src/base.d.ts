interface IModuleBase {
    name: string;
}
declare class ModuleBase {
    protected moduleBase: IModuleBase;
    constructor(name?: string);
    systemError(functionName: string, message: string, object?: any): never;
}
export default ModuleBase;
