# watcher与dep的关系程序运行分析

## 初始化执行 _init => initState() + vm.$mounted

###  initState => initData + initWatch + initComputed

1. initData 中执行observer(),进行响应式处理
+ 创建Observer类 => Observer类中对data进行遍历defineReactive,修改get和set函数 
+ defineReactive函数中创建私有变量dep(new Dep),每一个get和set对应一个dep
+ get中判断Dep类的静态属性target有值，当前watcher的deps添加当前dep，当前dep的subs添加当前watcher；并返回value；
+ set中赋值后执行dep.notify函数,执行dep的subs中的watcher循环update(执行queueWatcher=>flushWatcher=>延迟队列queue中watcher.run=>执行再次更新)；

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
    _computedWatcher[key] = 
    new Watcher(vm,getters||handler,()=>{},{lazy:true})
```
+ 遍历computed,进行defineComputed，对每一个key进行劫持修改get函数
+ get的值为_computedWatcher对应key的watcher.value
+ 如果dirty为true（默认值，或修改值后赋为true），执行watcher.evaluate方法即computed的handler方法，执行完dirty = false
+ 判断如果Dep.target有，收集渲染watcher


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
9. 执行getters即_update方法：通过with函数实现解析_s函数this.变量的值，**此时会调用该变量的obsercer中定义的get方法,Dep.target有值，执行dep.depend()，进行watcher dep互相收集**,最后移除Dep的target
```js
//  watcher为当前渲染watcher,dep为每一个definReactive中的私有变量 dep = new Dep()
    dep.depend() =>  Dep.target.addDep(this)  =>  watcher.addDep(dep) =>
    watcher.addDep(dep)=>{
        // 在watcher中deps添加dep
        this.deps.push(dep)
        this.depsId.add(id)
        //dep中subs也添加当前watcher
        dep.addSub(this(watcher)) 
    }
```

9. 运行patch函数,通过diff算法实现最小量更新渲染真实DOM



## 总结

### new watcher的地方有三处
1. lifecycle中：**mountComponent方法挂载dom。此watcher为一个渲染watcher,自动执行的get函数为渲染dom函数，回调函数为upadted钩子函数**
```js
    new watcher(vm,updateComponent,()=>{callHook(vm,'updated') },true)
```

2.  initState中，initWatch方法，对每一个key创建一个watcher,watcher函数中如果有user则获取到值后再次执行handler函数，实现监听功能
``` js
//            vm key handler
new Watcher(vm,exprOrfn,handler,{...options,user:true}
```
new watcher 默认执行get函数，读取一次vm.data的值，调用observe的get,进行依赖收集，defineReactive函数中的私有变量dep再次收集watch监听的watcher。set该变量时，dep.notify会挨个通知执行subs中的watcher

3. initState中，**执行initComputed方法，此watcher是一个计算watcher,get函数为computed配置项里的计算函数。**无回调函数，options参数lazy=true，在watcher中区分是computed的watcher，初始化watcher不执行get函数。读取computed属性时，触发defineProperty劫持的getter方法，最终取值为watcher.value。其中如果第一次取值dirty为ture,计算watcher.evaluate,缓存value。以后取值读取缓存value,dirty赋为false,除非调用该watcher的update方法，dirty为true，再次调用才会重新计算evaluate
```js
 new Watcher(vm,getters||handler,()=>{},{lazy:true})
```
Q:watcher的get方法中：判断if(Dep.target)再进行watcher.depend()互相收集依赖,Dep.target不是每次赋值完就pop吗？



### new Dep
在给每个data进行响应式处理时，defineReactive函数里定义私有变量，dep=Dep(),没一个变量都可以找到一个对应的dep

Q: 一个变量对应一个dep,对应一个渲染watcher，可以有多个computed watcher,一个watch watcher, 对不对？
