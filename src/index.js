import { initGlobApi } from "./global-api/index";
import { initMixin } from "./init";
import { lifecycleMixin } from "./lifecycle";
import { renderMixin } from "./vnode/index.js"
function Vue(options){
     this._init(options)
    


}

initMixin(Vue) // 添加数据初始化
lifecycleMixin(Vue) //添加声明周期
renderMixin(Vue) //render函数 创建虚拟dom

// 全局方法 Vuemixin vue.component extend...
initGlobApi(Vue)


export default Vue