import { Vues } from "./mixin"
import { foreach } from "./utils"
import {ModulesCollections} from './modules'
let root = {}

const installModule = (store,path,module,rootState)=>{
    // 计算当前的命名空间，订阅的时候每一个key前面增加一个命名空间
    // 从root开始查找 [a,b] 
    let namespaced = store._modules.getnamespaced(path)

    // 处理数据
    if(path.length>0){
        let parent = path.slice(0.-1).reduce((memo,current)=> memo[current],rootState)
        // 注意动态的添加，模块state响应式
        // Vue.set()
        Vues.set(parent,path[path.length-1],module.state)
    }
    // 收集属性
    module.forEachMutation((key,value)=>{
        store._mutations[namespaced+key] = store._mutations[namespaced+key]||[]
        store._mutations[namespaced+key].push((data)=>{
            value(module.state,data)
        })
    })
    module.forEachActions((key,value)=>{
        store._actions[namespaced+key] = store._actions[namespaced+key]||[]
        store._actions[namespaced+key].push((data)=>{
            value(module.state,data)
        })
    })
    module.forEachGetters((key,value)=>{
        store._wrapedGetters[namespaced+key]= function(){
            return   value(module.state)
        }
    })
    module.foreachChild((key,value)=>{
        installModule(store,path.concat(key),value,rootState)
    })



}   

export class Store{
    constructor(options){

        // // 模块化处理数据
        // // 1.根式获取数据,变成一个树形结构
        this._modules = new ModulesCollections(options)
        //2. 收集属性
        let store  = this
        store._actions = {}
        store._mutations = {}
        store._wrapedGetters = {}
        // 3.收集数据 处理计算属性
        let state = options.state
        let computed = {}
        store.computed = {}
        store.getters = {}
        installModule(store,[],this._modules.root,state)
        foreach(store._wrapedGetters,(key,value)=>{
            computed[key] = ()=>{
                return value(store.state)
            }
            Object.defineProperty(store.getters,key,{
                get:()=>{
                    return store._vm[key]
                }
            })
        })
        //vue实例,得到响应式数据state
        this._vm = new Vues({
            data:{
                state:options.state
            },
            computed

        })
        
    }
    get state(){
        return this._vm.data
    }
    commit=(name,data)=>{
        this.mutations[name](data)
    }
    dispatch = (name,data)=>{
        this.actions[name](data)
    }

}


// root = {
//     _raw:'用户传递的数据',
//     _children:{
//         a:{
//             // state:{age:10},
//             // mutations:{addAge(state,data){state.age+=data}}
//             _raw:'用户传递的数据',
//             _children:{
//                 // xxx
//             }
//         },
//     },
//     state:'根数据'
// }

// 浏览器刷新状态保留
// const plugin = ()=>{
//     return (store) => {
//         let loc = JSON.parse(localStorage.getItem('@vuex'))
//         if(loc){
//             store.replaceState(loc)
//         }
//         // 存放数据
//         store.subscribe((type,state) => {
//             localStorage.setItem('@vuex',JSON.stringify(state))
//         })
//     }
// }
// new Vues.store({
//     plugin:[plugin]
// })

// constructor里注释的简单代码 无module

// // getters 具有vue中的计算属性相当于computed,{属性:方法},使用{对象:值}
// // Object.defineProperty
// let getters = options.getters
// let  computed = {}
// this.getters = {}
// foreach(this.getters,(key,value)=>{
//     computed[key] = ()=>{
//         return value(this.state)
//     }
//     Object.defineProperty(this.getters,key,{
//         get:()=>{
//             // return value(this.state)
//             return this._vm[key]
//         }
//     })

// })
// // Object.keys(getters).forEach(key=>{
// //     Object.defineProperty(this.getters,key,{
// //         get:()=>{
// //             return getters[key](this.state)
// //         }
// //     })
// // })

// let mutations = options.mutations
// this.mutations = {}
// foreach(mutations,(key,value)=>{
//     this.mutations[key] = (data)=>{
//         value(this.state,data)
//     }
// })

// let actions = options.actions
// this.actions = {}
// foreach(actions,(key,value) => {
//     this.actions[key] = (data)=>{
//         value(this,data)
//     }
// })

// 单例模式
// this.state = options.state 