import { initMixin } from "./init";
import { lifecycleMixin } from "./lifecycle";
import { renderMixin } from "./vnode/index.js"
function Vue(options){
     this._init(options)
    


}

initMixin(Vue)
lifecycleMixin(Vue) //添加声明周期
renderMixin(Vue)
export default Vue