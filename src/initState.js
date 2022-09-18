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

    observer(data)
}

function initProps(){}
function initWatch(){}
function initMethods(){}
function initComputed(){}