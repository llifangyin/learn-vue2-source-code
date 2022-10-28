import { observer } from "./observe/index"
import { nextTick } from "./utils/nextTick"
import Watcher from "./observe/watcher"

export function initState(vm){
    let ops = vm.$options
    if(ops.props){
        initProps(vm)
    }   
    if(ops.data){
        initData(vm)
    }
    // 先初始化data,再初始化watch
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

// 一. watch4种使用方式
// 1. 属性方法
// 2. 属性数组
// 3.属性：对象
// 4.属性：字符串
// watch:{
//     'a'(newVal,oldVal)=>{
//         console.log(newVal);
//     },
//     'b':[
        // (newVal,oldVal)=>{
        //     console.log(newVal);
        // },
//         (newVal,oldVal)=>{
//             console.log(newVal);
//         }
//     ],
        // c:{
            // handler(){
            //     console.log('xxx');
            // }
        // },
        // d:'aa'
// },
// methods: {
//     aa(){console.log('ccc')}
// },

// 二.vue中的watch格式化
// 三 watch的最终实现方式,$watch

function initWatch(vm){
// 1.获取watch
    let watch = vm.$options.watch
    // console.log('watch:',watch);
    // 2. 遍历
    for(let key in watch){
        let handler = watch[key];// 数组,对象,字符,函数
        if(Array.isArray(handler)){
            // 处理数组形式
            handler.forEach(item=>{
                createWatcher(vm,key,item)
            })
        }else{//对象 字符 函数
            // 创建一个方法来处理
            createWatcher(vm,key,handler)
            
        }
    }

}
// vm.$watch(()=>{return 'a'})//返回的是watcher的属性
function createWatcher(vm,exprOrfn,handler,options){
    // 处理handler
    if(typeof handler == 'object'){
        // d:{
        //     handler(val){
        //         console.log('d',val);
        //     }
        // }
        options = handler //用户的配置项 
        handler = handler.handler
    }
    if(typeof handler =='string'){
        // e:'fun1'
        handler = vm[handler] //将实例上的methods的fun1作为handler
    }

    // 其他是函数
    // watch最终处理 $watch这个方法
    return vm.$watch(vm,exprOrfn,handler,options)

}

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

    // watch监听属性的实现
    vm.prototype.$watch = function(vm,exprOrfn,handler,options={}){
        // 实现watcher的方法就是new  watcher

        // exprOrfn 表达式或方法  user:用户的属性,watcher中监测到watch变化执行回调标识
        let watcher =  new Watcher(vm,exprOrfn,handler,{...options,user:true})
        
        // immediate立即执行
        if(options.immediate){
            handler.call(vm)
        }

    }
}