import { observer } from "./observe/index"
import { nextTick } from "./utils/nextTick"


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

export function stateMixin(vm){
    // 队列  vue自己的nexttick
    //  1 vue 自己的nexttick 2 用户调用的
    vm.prototype.$nextTick = function(cb){
        // 数据更新之后获取到最新的dom
        // console.log(cb);
        nextTick(cb)
    }
}