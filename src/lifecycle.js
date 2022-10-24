
export function mountComponent(vm,el){
    // 更新组件的方法
    // 1.vm._render将render函数变成虚拟dom
    // 2. vm._update 将vnode变成真实dom
    vm._update(vm._render())
}
export function lifecycleMixin(Vue){
    Vue.prototype._update = function(vnode){
        
    }
} 