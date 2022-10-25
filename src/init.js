import { initState } from "./initState";
import {compileToFunction} from './compile/index'
import { mountComponent } from "./lifecycle";
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

    // 创建$mounted
    Vue.prototype.$mounted = function(el){
        // console.log(el);
        // el template render
        let vm = this
        let options = vm.$options
        el = document.querySelector(el)
        vm.$el = el // 真实dom
        // 没有render函数
        if(!options.render){
            let template = options.template
            // 没有template option 
            // 则 Compile el's outerHTML as template *
            if(!template && el){
                // 获取Html
                el = el.outerHTML //html字符串
                // <div id="app">hello {{msg}} </div>
                // 变成ast语法树 ,将ast语法树变成render函数
                let render = compileToFunction(el)
                // console.log(render);
                // (1) 将render函数变成vnode
                options.render = render
                // (2) 将vnode变成真实DOM放到页面中
            }
            // 挂在组件
            // 1.vm._render将render函数变成虚拟dom
            // 2. vm._update 将vnode变成真实dom
            mountComponent(vm,el)
        }
    }
}
