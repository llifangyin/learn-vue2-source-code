import { patch } from "./vnode/patch"
import watcher from './observe/watcher';
export function mountComponent(vm,el){

    callHook(vm,'beforeMounted')
    // 更新组件的方法
    // 1.vm._render将render函数变成虚拟dom
    // 2. vm._update 将vnode变成真实dom 
    
    let updateComponent = ()=>{
        vm._update(vm._render())
    }
    new watcher(vm,updateComponent,()=>{},true)

    callHook(vm,'mounted')
}
export function lifecycleMixin(Vue){
    Vue.prototype._update = function(vnode){
        let vm = this
        vm.$el = patch(vm.$el,vnode)//旧dom，虚拟dom
    }
} 

// 生命周期调用
export function callHook(vm,hook){
    // console.log(vm);
    const handlers = vm.$options[hook]
    // [fn a,fn b,fn]
    if(handlers){
        for(let i =0;i<handlers.length;i++){
            handlers[i].call(this)
        }
    }
}