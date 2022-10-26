import { popTarget, pushTarget } from "./dep"

// 1 同过这个类 watcher实现更新
let id = 0
class watcher{
    constructor(vm,updateComponent,cb,options){
        // callback 标识
        this.vm = vm
        this.exprOrfn = updateComponent
        this.cb =cb
        this.options = options
        this.id = id++
        this.deps = [] //watcher存放dep 
        this.depsId = new Set() // 存放不重复的dep id
        // 判断
        if(typeof updateComponent === 'function'){
            this.getters = updateComponent //更新视图
        }
        // 初次渲染
        this.get()
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
        this.getters() //渲染页面 vm._update(vm._render) _s(msg) 拿到vm.msg
        popTarget() //取消watcher
    }
    update(){
        this.getters()
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