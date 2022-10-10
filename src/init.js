import { initState } from "./initState";
import {compileToFunction} from './compile/index'
export function initMixin(Vue){

    Vue.prototype._init = function(options){
        let vm = this
        vm.$options = options
        // init 状态
        initState(vm)

        //渲染模板 el
        if(vm.$options.el){
            vm.$mounted(vm.$options.el)
        }
    }

    // 创建$moutned
    Vue.prototype.$mounted = function(el){
        // console.log(el);
        // el template render
        let vm = this
        let options = vm.$options
        el = document.querySelector(el)
        // 没有render函数
        if(!options.render){
            let template = options.template
            // 没有template option 
            // 则 Compile el's outerHTML as template *
            if(!template && el){
                // 获取Html
                el = el.outerHTML //html字符串
                // <div id="app">hello {{msg}} </div>
                // 变成ast语法树
                let ast = compileToFunction(el)

                // render

                // vnode
                // console.log(el);
            }
        }
    }
}
