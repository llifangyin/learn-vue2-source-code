# learn-vue2-source-code
Learn the source code of vue2

## 通过rollup搭建环境
1. 安装依赖
npm install @babel/preset-env @babel/core rollup rollup-plugin-babel rollup-plugin-serve -D

2. 打包配置rollup.config.js
执行命令： rollup -c -w     (-c 去找配置文件)

## 测试
index.html 引入 打包生成的/dist/vue.js 调用new Vue使用

## 启动
npm run dev

## 初始化Vue
+ Vue对象封装 
+ Vue.prototype._init ==> initState(initProps,initData,initWatch,initMethods,initComputed)
+ Vue.prototype.$mount: 处理数据挂载DOM (先初始化数据 ==> 将模板进行编译 ==> 变成render函数 ==> 生成虚拟节点 ==> 变成真实dom ==> 放到页面)

## vue2数据劫持
+ initData里 执行obsever(data)
### 对象

1. **Object.defineProperty** 只能对象中第一个属性劫持
1. 创建Observer类，构造函数遍历对象的属性，遍历数组的对象属性。export observe （实例Obsever类）方法供调用
2. 遍历walk对象的属性
3. 递归defineReactive 进行Object.definProperty对象的get set 

### 数组
1. 函数劫持**修改__proto__** 或者 **Object.setPrototype**
2. 对象数组遍历劫持数据
3. 对象的方法push unshift splice(第三个参数) 添加的数据进行数据劫持

### data对象代理
+ initData 中使用defineProperty 对vm._data.key 进行代理； 以便使用vm.key调用和修改

## 模板编译
init初始化后，开始模板编译步骤详见生命周期
1. 判断Has el Option 有直接进行下一步，没有调用vm.$mount方法
2. 判断Has template option ?有进行render function :没有编译模板 compile el's outerHTML as template......
3. 开始编译:获取dom,创建ast语法树

+ 声明正则 匹配标签名,标签开始,标签结束,属性等
+ 解析HTML字符串,从前往往后一次查找
+ 先找到开始标签< ,然后调用parseStartTag 记录标签名,读取属性attrs,通过advace()删除掉标签,得到一个除了开始标签的新html字符串
+ 正则匹配标签结束位置,截取记录文本内容,最终删除文本内容.
+ 最终得到语法树的零件:开始标签,文本,结束标签
4. 将ast语法树对象变为render函数（主要使用正则匹配,with函数 => _c,_s,_v ，renderMixin里定义，定义到option上，供下一步变换vnode使用） 
5. render函数变成vnode(调用mountComponent里的_render方法<变成vnode> ,_update方法<变成真实dom>)
6. vnode 变成真实dom(patch里的createEl)
7. 生命周期
+ 定义mixin mergeOptions方法 合并created computed watch...得到{created:[a,b,c],data:[a,b]...} 格式的数据
##  callHook 调用声明周期函数
+ callHook(vm,'beforecreated')
+ initState 初始化数据observer对属性进行defineReactive数据劫持 => 检测变化 => 进行收集dep => dep.notify =>wacher.update更新dom
+ callHook(vm,'created')
+ vm.$mount(vm.$options.el)//渲染模板 ast语法树=> render函数 => mountComponent
+ callHook(vm,'beforeMounted')
+ new watcher(vm,updateComponent,()=>{**callHook(vm,'updated')**},true)
+ callHook(vm,'mounted')


##  dep watcher 依赖收集 (todo watcher的含义是更新一个变量还是整体dom更新？)
> watcher实例的目的是实现更新,defineReactive中数据劫持getter收集依赖,setter更新依赖
+ dep和data中的变量一一对应
+ 在视图上用几个变量,就有几个watcher
    1. 基本类型的关系   
dep 与 watcher的关系:  一对多 dep.name = [w1,w2,w3...]
    2. 实现对象的收集依赖 <br>
dep 和watcher的关系 多对多 computed 
    3. 实现数组的收集依赖

## queue 队列处理,类似防抖实现更新
+ 一个变量触发多次变更，最终执行一次更新函数 _update(_render)
##  nextTick实现原理
+ 兼容性异步处理 Promise > MutationObserver?(有待细节实现 todo) > setImmediate 
+ 防抖队列处理 (有待demo细究 todo)

## watch实现
1. initWatch方法获取option的watch配置项:兼容四种调用方式 (object array fn string)
2. createWatcher方法,获取handler回调函数,创建$watch
3. 定义Vue.prototype.$watch(vm,exprOrfn,handler,options)调用new Watcher(vm,exprOrfn,handler,{...options,user:true})
4. watcher类中updateComponent参数!=function时,获取watch的初始值处理
5. 检测数据变动时,判断如果user为true执行watch的callback(handler)回调 ;this.cb.call(this.vm,value,oldValue)

## diff算法
> 新旧虚拟dom进行逐层判断，比较更新后再更新真实DOM，实现最小量更新的方法
1.  patch函数中：根据初步判断节点是否相同，根元素的标签、属性初步判断；如果内容不同则采用指针的比对方法进行比对更新
2. 从头往后比对
3. 从后往前比对
4. 交叉比对
5. 暴力比对(创建key:index映射表，while遍历判断oldVnode和newVnode是否存在，插入节点)