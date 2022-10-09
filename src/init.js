import { initState } from "./initState";
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
        console.log(el);
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

                console.log(el);
            }
        }
    }
}

// ast语法树 {} 操作节点 css js
//  vnode {}操作节点
// <div id="app">hello {{msg}} </div>
/* 
{
    tag:"div",
    attrs:[{id:"app"}],
    children:[{
        tag:null,
        text:'hello{{msg}}'
    }]
}

*/
