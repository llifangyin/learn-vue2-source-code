import { observer } from "./observe/index"


export function initState(vm){
    let ops = vm.$options
    if(ops.props){
        initProps(vm)
    }   
    if(ops.data){
        initData(vm)
    }
    if(ops.watch){
        initWatch(vm)
    }
    if(ops.methods){
        initMethods(vm)
    }
    if(ops.computed){
        initComputed(vm)
    }
}
// 初始化data
function initData(vm){
    let data = vm.$options.data
    // data()  this默认window 
    data = vm._data = typeof data == 'function'?data.call(vm):data 

    //将对象上的所有属性，代理到实例上{a:1,b:@}  defineProperty
    for(let key  in data){
        Proxy(vm,'_data',key)    
    }

    observer(data)
}
function Proxy(vm,source,key){
    Object.defineProperty(vm,key,{
        get(){
            return vm[source][key]
        },
        set(val){
            vm[source][key] = val
        }
    })
}
function initProps(){}
function initWatch(){}
function initMethods(){}
function initComputed(){}