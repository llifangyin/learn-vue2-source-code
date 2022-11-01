import { compileToFunction } from "./compile/index";
import { initGlobApi } from "./global-api/index";
import { initMixin } from "./init";
import { initState, stateMixin } from "./initState";
import { lifecycleMixin } from "./lifecycle";
import { renderMixin } from "./vnode/index.js"
function Vue(options){
     this._init(options)
}

// 给vue.prototype添加_init(initState(),$mounted)方法 ,$mounted方法 把挂载el内的html转为render字符串，转为虚拟dom，渲染成真实dom
// initState方法在initState中定义执行initProps,initData,initWatch,initMethods,initComputed等初始化函数
initMixin(Vue) 

lifecycleMixin(Vue) //给vue.prototype添加_update方法 创建虚拟dom
renderMixin(Vue) //给Vue.prototype添加_c,_v,_s,render函数用来创建虚拟dom
stateMixin(Vue) // 给Vue.prototype添加$nextTick  $watch方法 

// 全局方法 Vuemixin vue.component extend...
initGlobApi(Vue) //Mixin (mergeOptions)



export default Vue