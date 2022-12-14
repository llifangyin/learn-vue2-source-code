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


## component简易实现(无变量的情况)
例 全局配置
```js
Vue.component('my-button',{
    template:'<button>我的按钮</button>'
})
```
### 方法定义
1. Vue.extend(option) 创建Vue的子类,合并传过来的options和Vue本身的options配置项
2. Vue.component(id,componentDef) 将component的全局配置项添加到vue.options.components上，key为name,value为extend后的子类

### 执行过程

1. _init => initState => $mount(el)
2. $mount中拿到挂载元素的outHTML => render函数
3. 执行mountComponent=> vm._update(vm._render())该过程中
4. vm._render()创建虚拟dom,创建标签时，_c() => createElement 判断如果是非保留html标签isReserved(tag), return createComponent
5. 此时的vnode =
```js
// 外层div#app
// children为下面  
vnode = {
    vm:'vm',
    tag:'vue-component-my-button',
    data:{
        hook:{
            init:function(vnode){
                let child = vnode.componentInstance = new vnode.componentOptions.Ctor({})
                child.$mount() // $el
            }
        }
    },
    key:undefined,
    children:undefined,
    text:undefined,
    componentOptions:{Ctor,children} //Ctor:vue子类,init时会new;children为my-button的值:我的按钮
}
 ```
6. _update() =>  vm.$el = patch(vm.$el,vnode);//vm.$el ("#app")

7. createEl中vnode => 转换真实dom,删除旧dom，插入新dom
8. 转过过程中，如果是组件，通过createComponent方法获取到 vnode.componentInstance.$el 真实dom，添加到其父容器中
9. createComponent中执行vnode.hook.init方法 => $mount => el= options.template,拿到组件的outHTML，获取到虚拟dom,再次进行
mountComponent,patch方法通过判断oldVnode执行createEl返回真实dom，复制到vm.$el上。最终实现子组件的dom渲染。

## Vuex

### Vuex使用
+ 是一个插件,通过vue.use方法使用。
+ 使用
```js
import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)
const store = new Vuex.Store({
    //存放响应式数据 , $store.state.age
    state:{
        age:10
    },
    //相当于vue中的computed,具有缓存机制
    getters:{
        // vue视图中使用多次，只触发一次,$store.getters.changeAge
        changeAge(state){
            return state.age + 1
        }
    },
    // 同步修改数据, $store.commit('addAge,1')
    mutation:{
        addAge(state,data){
            state.age += data
        }
    },
    // 异步修改数据, $store.dispatch('addAge',20)
    actions:{
        addAge({commit,data}){
            setTimeout(()=>{
                commit('addAge',data)
            },2000)
        }
    }
})
export default store
```

###  Vue.use(a)
```js
function a(){
    // 立即执行
    install:function(vm){
        // 立即执行   vm : vue实例
    }
} 
Vue.use(a)
```
作用
1. 执行这个方法
2. 如果这个方法中，有一个install属性，属性是一个方法，会执行a.install,则会执行这个install属性的方法
3. 如果install函数有参数，第一个参数就是vue的实例

### store实现
单例模式 创建store类,store的get方法改为通过new Vue创建的实例的值
```js
 this._vm = new Vue({
    data:{
        state:options.state
    },
    computed

})
```
### computed实现
computed,{属性:方法} 使用Vue实例的computed实现,多调一层方法的区别

### mutation和actions实现
发布订阅者模式:构造函数内部,拿到配置项的mutions和actions,遍历发布执行方法

### moudles实现
1. 将用户传入的数据 变成树形结构
2. 收集属性{actions:[]}
3. state computed
4. vuex数据保存
5. 作用域，命名空间
6. 辅助函数 (mapState mapMutation mapActinos mapGetters)

## VueRouter(该demo需要在vue cli创建新项目中把router其换成本vue-router生效)


### 1. 路由模式
> 路由：可以根据路径的改变，返回不同资源。
#### hash模式:
+ 路径后面有#
+ 不需要向服务器获取新资源
#### history模式：
+ 默认模式

### 2. 使用vue-router

### 3. 实现vue-router

####  VueRouter类
1. match核心 把route转换路由组件对应映射表[{},{}] => {'/':{component}}
2. beforeHooks 收集路由守卫fn,跳转前后执行fn
2. 根据路由模式mode 去找对应的history = new HashHistory(this)
3. **HashHistory类** extend **History类** 定义router属性，getCurrentLocation方法，setUpListener方法监听route变化跳转页面
4. **History**类中定义router属性，current属性，push方法，transitonTo方法
5. transitonTo(location,cb)方法中执行：
+ 拿到当前路由router /about/a
+ 获取到当前最新路径current hash值  {path: '/about/a', matched: Array(1)}
+ 获取全局守卫队列 queue
+ 执行队列方法后runQueue(queue,iterator,cb) 执行cb即跳转页面方法 渲染组件方法

####  VueRouter.install
1. 注册全局组件routerLink routerView
2. 给所有组件绑定_routerRoot属性，Vue.protoType $route=>history.current $router=>this根实例




### 4. 全局组件
+ router-view
> 函数式组件 functional:true=>render(h,{parent,data}),通过parent获取到根实例route,递归得到recode并层层渲染reutrn h(recode.component,data),
+ router-link
> <tag onclick={handler}>{this.$slots.default}</tag>
+ Vue.mixin=>  beforeCreate 给每个组件添加router组件实例，
### 5. 初始化数据
+ 根据路由找到组件  router数据转换 [{},{}] => {'/':{component}}

## 路由守卫触发过程
+ 导航被触发
+ 在失活的组件里调用beforeRouteLeave守卫
+ 调用全局的beforeEach守卫
+ 在重用的组件里调用beforeRouteUpdatae守卫
+ 在路由配置里调用beforeEnter守卫
+ 解析异步路由组件
+ 在被激活的组件调用beforeRouteEnter
+ 调用全局的aftetEach钩子
+ 触发DOM更新
+ 调用beforeRouteEnter守卫中，传给next的回调函数，创建好的实例，会作为回调函数的的参数传入