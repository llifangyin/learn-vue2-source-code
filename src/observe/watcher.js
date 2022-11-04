import { nextTick } from "../utils/nextTick"
import { popTarget, pushTarget } from "./dep"
import Dep from './dep'
// 1 同过这个类 watcher实现更新
let id = 0
class watcher{
    constructor(vm,updateComponent,cb,options){
        // callback 标识
        this.vm = vm
        this.exprOrfn = updateComponent
        this.cb = cb
        this.options = options
        this.id = id++
        this.user = !!options.user //!! 保证为布尔值
        this.lazy = options.lazy // 如果为true,是computed属性
        this.dirty = this.lazy // 取值时，表示用户是否执行
        this.deps = [] //watcher存放dep 
        this.depsId = new Set() // 存放不重复的dep id
        // 判断
        if(typeof updateComponent === 'function'){
            //初始化$moutned会执行一次渲染：
            // initMixin => _init => $mounted => (lifecyle)mountComponent => new Watcher
            this.getters = updateComponent //更新视图
        }else{
            //watch监听的属性名 key
            // 字符串变成函数
            this.getters =  function(_vm){
                // console.log('$watch的watcher.get方法$,取当前watcher的值赋给watcher.value');
                // console.log('取值过程中，调用的vm.值，触发observe的getter事件，把当前的watch watcher收集到各个属性的dep中');
                // console.log('当set一个值时，会触发当前watch watcher的方法，判断user =true 执行回调函数cb,实现监听');
                // a.b.c 深层监听
                // console.log(_vm,111);
                let path = _vm.exprOrfn.split('.')
                let obj = vm
                for(let i =0 ;i<path.length;i++){
                    obj = obj[path[i]]
                }
                return obj //vm.a.b.c
            }
        }
        // console.log('=== watcher-init',this);
        // 初始化 dom挂载mountComponent中会执行一次

        // 初次渲染  保存初始值 (computed模式初始不加载)
        this.value = this.lazy ? void 0: this.get() //保存watcher初始值
    }   
    addDep(dep){
        // 去重
        let id = dep.id
        //depsId set解构使用has方法判断是否存在
        if(!this.depsId.has(id)){
            this.deps.push(dep)
            this.depsId.add(id)//set解构 用add方法添加
            dep.addSub(this)
        }

    } 
    get(){

        // console.log('$render&&computed$-watcher.get 方法执行');
        // 初始化 dom挂载mountComponent中会执行一次
        pushTarget(this) // 给Dep添加watcher => Dep.target = watcher 
        // console.log(this.getters,222);
        // console.log('Dep.target的值',Dep.target);
        // console.log('执行render方法或computed方法');
        const value = this.getters.call(this.vm,this)
        // console.log('render 完毕 pop Dep.target');
        // 情况1 => 初始化渲染页面
         //渲染页面 vm._update(vm._render) _s(msg) 拿到with函数vm.msg
        // 渲染过程中会调用一次observe中的getter,执行  该初始化渲染的watcher的deps push了new的dep
        //  new的dep的subs push了 这个初次渲染的watcher实例

        // 情况2 => computed的watcher，初始化watcher,lazy=true不调用get,第一次取computed值时，执行watcher.evaluate方法
        //  => 从而执行watcher.get方法，执行该方法时：先执行pushTarget方法，给Dep.target添加computed的watcher,然后
        // 调用计算方法，当取vm.变量值时=>（触发observe中的get方法，发现有Dep.target(computed的wather),defineReactive私有变量的
        // dep和计算computed的watcher互相收集依赖，当触发变量的set时,触发dep.notify遍历deps执行watcher.update,计算watcher也得到更新)
        // update方法执行queueWatcher => flushWatcher => 遍历watcher.run  => watcher.get,
        // computed的watcher= lazy为true不执行queueWatcher方法,dirity赋值为true;
        // 执行渲染watcher,执行get方法,Dep.target值取渲染watcher,然后取vm.遍历:(1).普通变量，取observe.getter方法,新的渲染watcher和dep互相收集
    //      (2). computed变量，取值触发 computed中的createComputedGetter,
                // dirty为true 执行计算方法evaluate,执行计算watcher的get中的computed计算函数，得到最新值；
                // 执行computed的watcher.depend(),执行：deps[i].depend() => Dep.target.addDep(this) 
    //      => watcher.addDep => dep.addSub => dep中this.subs.push(watcher),互相收集;

        popTarget() //取消watcher  Dep.target = stack[stack.length-1] //默认情况length-1 结果为null
        // console.log(Dep.target);
        return value //初始值
    }
    // 更新数据
    update(){
        // 不要数据更新后每次调用
        // 缓存
        // this.get()
        
        //lazy为ture 为computed
        if(this.lazy){
            this.dirty = true 
        }else{
            queueWatcher(this)
        }
    }
    run(){
        // 更新取值 old new
        let value = this.get()
        let oldValue = this.value
        this.value = oldValue
        if(this.user){
            // 执行handler 用户的watcher的cb
            this.cb.call(this.vm,value,oldValue)
        }
    }
    // computed 执行计算方法
    evaluate(){
        this.value = this.get()
        this.dirty = false 
    }
    // 相互收集
    depend(){
        // 收集渲染watcher,存放到dep中，dep再会存放watcher
        // 最终可以通过watcher找到所有的dep,让所有的dep都记住渲染的watcher
        let i = this.deps.length
        while(i--){
            this.deps[i].depend()
        }
    }
}
let queue = []//将需要批量更新的watcher 存放队列中
let has = {}
let pending = false
// 队列处理
function flushWatcher(){
    // console.log(queue,'queue-真正执行update队列');
     queue.forEach(watcher=>{
        watcher.run() //防抖执行回调更新函数
        // watcher.cb() // updated 声明周期函数 简易执行回调
    })
    queue =[]
    has = {}
    pending = true
}
function queueWatcher(watcher){
    let id = watcher.id // 没一个组件都是同一个watcher
    // console.log(666); //3次
    if(has[id] == null){ //去重
        queue.push(watcher)
        has[id] = true
        //防抖: 触发多次 只执行一次
        if(!pending){
            //异步 等待同步代码执行完毕 执行
            // setTimeout(() => {
           
            // }, 0);
            // nextTick 相当于定时器，
            nextTick(flushWatcher)
            pending = true
        }
    }
}
export default watcher
// vue更新策略:以组件为单位,给每一组件添加一个watcher,属性变化后,调用这个watcher

// 收集依赖
// vue  dep watcher data:{name,msg}
// dep  : dep和data中的属性一一对应
// watcher : 在视图上用几个,就有几个watcher
// 一. 基本类型的关系
// dep 与 watcher的关系:  一对多 dep.name = [w1,w2,w3...]


//二. 实现对象的收集依赖
// dep 和watcher的关系 多对多 computed 
// 三 数组更新
// 1. 给所有的对象增加一个dep []
// 2. 获取数组的值,会调用get方法,希望让当前的数组记住这个渲染的watcher
//   (1) 需要获取当前dep
//   (2) 当前面对数组取值的时候,就让数组的dep记住这个watcher
// 3. 我们更新数组的时候,调用push,等等方法时,找到我们这个watcher

