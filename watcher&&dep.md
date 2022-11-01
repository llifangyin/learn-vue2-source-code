# watcher与dep的关系程序运行分析

## 初始化执行 _init => initState() + vm.$mounted

###  initState => initData + initWatch + initComputed

1. initData 中执行observer(),进行响应式处理
+ 创建Observer类 => Observer类中对data进行遍历defineReactive,修改get和set函数 
+ defineReactive函数中创建私有变量dep(new Dep),每一个get和set对应一个dep
+ get中判断Dep类的静态属性target有值，当前watcher的deps添加当前dep，当前dep的subs添加当前watcher；无值返回value；
+ set中添加dep.notify函数,执行dep的subs中的watcher循环update(执行queueWatcher=>flushWatcher=>延迟队列queue中watcher.run=>执行再次更新)；

2. initWatch
+ 截取watch的key属性和监听需要处理的handler函数
+ 对每一个key创建一个watcher,watcher函数中如果有user则获取到值后再次执行handler函数，实现监听功能
``` js
//            vm key handler
new Watcher(vm,exprOrfn,handler,{...options,user:true}
```

3. initComputed
+ 获取到所有computed属性的key,handler
+ 创建vm._computedWatcher,遍历赋值key：new Watcher
```js
for(let key in computed){
    // getters 为computed的handler计算函数
    // lazy：true在watcher中区分时computed的属性，执行函数为计算函数
    // watcher中用dirty取初始化lazy，默认为true，表示第一次或者需要再次执行handler计算函数,为false读取缓存的值，即watcher的value
    _computedWatcher[key] = new Watcher(vm,getters,()=>{},{lazy:true})
}
```
+ 遍历computed,进行defineComputed，对每一个key进行劫持修改get函数
+ get的值为_computedWatcher对应key的watcher.value
+ 如果dirty为true（默认值，或修改值后赋为true），执行evaluate方法即computed的handler方法，执行完dirty = false
+ 判断如果Dep.target，收集渲染watcher

### vm.$mounted 挂载dom 

1. 拿到vm.el的outerHTML
2. 转换为ast语法树
3. 转为render函数(_s 解析变量 _v解析文本，_c解析标签)，通过with函数实现解析_s函数this.变量的值。
4. 执行mountedComponent函数
5. 执行各个运行的钩子函数（beforeMounted，updated,mounted)
6. 创建watcher实例 (lifecyle.js)
```js
    // _render拿到的是虚拟dom解构数据
    let updateComponent = ()=>{
        vm._update(vm._render())
    }
    new watcher(vm,updateComponent,()=>{
        callHook(vm,'updated') //订阅
    },true)
```
7. watcher中执行get方法 
```js
    pushTarget(this) 
    const value = this.getters.call(this.vm,this)
    popTarget() 

```
8. pushTarget:先给Dep添加当前watcher至target
9. 执行getters即_update方法：通过with函数实现解析_s函数this.变量的值，**此时会调用该变量的obsercer中定义的get方法,Dep.target有值，进行watcher dep互相收集**,最后移除Dep的target

9. 运行patch函数,通过diff算法实现最小量更新渲染真实DOM


