import { Module } from "./module";
import { foreach } from "../utils";

class ModulesCollections{
    constructor(options) {
        // 1. 拿到root树形结构
        this.root = null
        // 分析children
        this.register([],options)
    }
    // 收集namespaced
    getnamespaced(path){
        let current = this.root
        // 累加
        return path.reduce((namespace,key)=>{
            current.getChild(key)
            // 拼接
            return namespace + (current.namespaced?key+'/':'')
        },'')
    }
    register(path,rootModule){
        // 2.定义好结构
        // let module = {
        //     _raw:rootModule,
        //     _children:{},
        //     state:rootModule.state
        // }
        let module = new Module(rootModule)
        // 你没有父亲
        if(path.length==0){
            this.root = module
        }else{
            // 有儿子
            const parent = this.get(path.slice(0, -1))
            parent.addChild(path[path.length - 1], newModule)
            // let parent = path.slice(0,-1).reduce((root,current)=>root.getChild(current),this) ??
            // parent.addChild(path[path.length-1],module)
        }

    }
}