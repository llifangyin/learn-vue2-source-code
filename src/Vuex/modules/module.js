
import { foreach } from "../utils";
export class Module{
    constructor(rootModule){
        this._raw = rootModule
        this._children = {}
        this.state = rootModule.state
    }
    get namespaced(){
        return !this._raw.namespaced
    }
    getChild(key){
        return this._children[key]
    }
    addChild(key,module){
        this._children[key] = module
    }
    forEachMutation(fn){
        if (this._rawModule.mutations) {
            foreach(this._rawModule.mutations, fn)
        }
    }
    forEachActions(fn){
        if (this._rawModule.actions) {
            foreach(this._rawModule.actions, fn)
          }
    }
    forEachGetters(){
        if (this._rawModule.getters) {
            foreach(this._rawModule.getters, fn)
          }
    }
    foreachChild(){
        foreach(this._children, fn)
    }
}

