import { nextTick } from "../utils/nextTick"
import { popTarget, pushTarget } from "./dep"

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
            this.getters = updateComponent //更新视图
        }else{
            //watch监听的属性名 key
            // 字符串变成函数
            this.getters =  function(){
                // a.b.c 深层监听
                let path = this.exprOrfn.split('.')
                let obj = vm
                for(let i =0 ;i<path.length;i++){
                    obj = obj[path[i]]
                }
                return obj //vm.a.b.c
            }
        }
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
    // 初次渲染
    get(){
        pushTarget(this) // 给dep添加watcher
        const value = this.getters.call(this.vm) //渲染页面 vm._update(vm._render) _s(msg) 拿到vm.msg
        popTarget() //取消watcher
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

