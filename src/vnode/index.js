export function renderMixin(Vue){
    // 节点 创建标签
    Vue.prototype._c = function(){
        return createElement(...arguments)
    }
    // 文本
    Vue.prototype._v = function(text){
        return createText(text)
    }
    // 变量 _s(msg)
    Vue.prototype._s = function(val){
        return val == null?"":(typeof val == "Object")?JSON.stringify(val):val
    }
    Vue.prototype._render = function(){
        let vm = this
        let render = vm.$options.render //init.js 中定义options的render属性为render函数
        let vnode  = render.call(this)
        return vnode
    }
}


// 创建元素
function createElement(tag,data={},...children){
    return vnode(tag,data,data.key,children)
}

// 创建文本
function createText(text){
    return vnode(undefined,undefined,undefined,undefined,text)
}
// 创建虚拟dom
function vnode(tag,data,key,children,text){
    return {
        tag,
        data,
        key,
        children,
        text
    }
}