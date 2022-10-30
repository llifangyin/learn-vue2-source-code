import { observer } from "./observe/index"
import { nextTick } from "./utils/nextTick"
import Watcher from "./observe/watcher"
import Dep from "./observe/dep"

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

/* initData------------------------------------------------------- */
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
/* initData------------------------------------------------------- */

function initProps(){}

/* initWatch------------------------------------------------------- */
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
// 三 watch的最终实现方式, watch
// 通过高阶函数，
// 四  面试： watch和computed的区别
// computed具有缓存机制，通过dirty变量是实现
// watch 回调函数

// 问题：视图中 变量没更新dom
// 因为这里有多个watcher,渲染watcher  和 computed watcher
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
/* initWatch------------------------------------------------------- */

function initMethods(){}

/* initComputed------------------------------------------------------- */
function initComputed(vm){
    let computed = vm.$options.computed
    // 1.通过watcher实现
    let watcher = vm._computerWatcher = {}
    // 2.将computed属性通过defineProperty进行处理
    for(let key in computed){
        let userDef = computed[key]
        // 获取get
        let getters = typeof userDef =='function' ?userDef : userDef.get
        // 给每一个computed属性添加一个watcher getters为computed函数或对象的get函数
        watcher[key] =  new Watcher(vm,getters,()=>{},{lazy:true})
        // defineReactive
        //lazy不调用时不计算
        defineComputed(vm,key,userDef) 
        // 该方法执行了
        //1.响应式处理key 
        //2. 重写key的getter() 
            // （1） 如果第一次取值dirty为true则执行watcher的evaluate方法计算computed的函数，并赋值给watcher.value缓存
            // （2） 满足条件Dep.target有值;收集computed属性的watcehr依赖;执行顺序为; 
                //  watcher.depend() =>
                //  deps[i].depend() => Dep.target.addDep(this) => watcher.addDep => 
                //  dep.addSub => dep中this.subs.push(watcher)
            // （3）Dep中使用stack=[]接收watcher,Dep.target赋值最后一个,如果有computed则Dep需要收集两个;

    }
    // console.log(vm);
}

let sharePropDefinition = {}
// 响应式处理computed的值
function defineComputed(target,key,userDef){
    sharePropDefinition = {
        enumable:true,
        configurable:true,
        get:()=>{},
        set:()=>{}
    }
    if(typeof userDef == 'function'){
        // sharePropDefinition.get  = userDef
        sharePropDefinition.get  = createComputedGetter(key)
    }else{
        // 对象
        // sharePropDefinition.get = userDef.get
        sharePropDefinition.get  = createComputedGetter(key)
        sharePropDefinition.set = userDef.set
    }
    //  代理 target:vue  key computed的属性
    Object.defineProperty(target,key,sharePropDefinition)

}

// 高阶函数,缓存机制
function createComputedGetter(key){//返回用户的computed方法
    // return 函数里的 this指向被调用对象的this => vm
    // 不这样写this为函数本身
    return function(){
        // dirty 为true执行用户方法
        let watcher = this._computerWatcher[key]
        if(watcher){
            if(watcher.dirty){//dirty true第一次取值，计算get;false读取缓存 watcher.value
                // 执行方法,求值 重新定义一个方法
                watcher.evaluate() //运行用户的computed方法
            }
            // 判断是否有渲染wathcer，如果有执行 ：相互存放watcher
            if(Dep.target){
                // 说明 还有渲染watcher,收集起来
                watcher.depend()  //计算watcher收集渲染watcher
            }
            // 重复使用，不重新计算
            return watcher.value    
        }
    }
}
/* initComputed------------------------------------------------------- */

/* stateMixin------------------------------------------------------- */
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
/* stateMixin------------------------------------------------------- */
