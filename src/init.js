import { initState } from "./initState";
import {compileToFunction} from './compile/index'
import { callHook, mountComponent } from "./lifecycle";
import { mergeOptions } from "./utils/index";
export function initMixin(Vue){

    Vue.prototype._init = function(options){
        let vm = this
        // console.log(Vue.options,this.contructor,1,options);
        // vm.$options = mergeOptions(Vue.options,options) 
        // console.log(this.constructor.options,options,'mergeOptions--init');
        vm.$options = mergeOptions(this.constructor.options,options) 
        // console.log(vm.$options,'$options');
        callHook(vm,'beforecreated')
        // init 状态
        initState(vm)
        callHook(vm,'created')
        
        //渲染模板 el
        // console.log(vm.$option.el,11111);
        if(vm.$options.el){
            vm.$mount(vm.$options.el)
        }
    }

    // 创建$mount 拿到el的outhtml=>ast语法树=>render函数=>mountCompoenet(update(render()))=>执行render函数得到虚拟dom，
    // 执行update方法，将vm.$el替换为新dom，$el>createEl(vnode)
    
    Vue.prototype.$mount = function(el){
        // console.log(el,'$mount => el');
        // el template render
        let vm = this
        let options = vm.$options
        el = document.querySelector(el)
        vm.$el = el // 真实dom
        // 没有render函数
        if(!options.render){
            // console.log(options,el,111111);
            let template = options.template
            // 没有template option 
            // 则 Compile el's outerHTML as template *
            if(!template && el){
                // 获取Html
                el = el.outerHTML //html字符串
            }else{
                el = template
            }
            // console.log(el,'render.el');
            // <div id="app">hello {{msg}} </div>
            // 变成ast语法树 ,将ast语法树变成render函数
            const render = compileToFunction(el)
            // console.log(render,'render函数');
            // (1) 将render函数变成vnode
            options.render = render
            // (2) 将vnode变成真实DOM放到页面中
        }
        // 挂载组件
        // 1.vm._render将render函数变成虚拟dom
        // 2. vm._update 将vnode变成真实dom
        // console.log(vm,el,222);
        mountComponent(vm,el)
    }
}
