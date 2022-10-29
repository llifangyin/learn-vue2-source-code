import { patch } from "./vnode/patch"
import watcher from './observe/watcher';
export function mountComponent(vm,el){

    callHook(vm,'beforeMounted')

    // 更新组件的方法
    // 1.vm._render将render函数变成虚拟dom
    // 2. vm._update 将vnode变成真实dom 
    
    // 实现自动更新
    let updateComponent = ()=>{
        // console.log(vm._render());
        vm._update(vm._render())
    }
    // 更新数据
    // constructor(vm,updateComponent,cb,options){
    new watcher(vm,updateComponent,()=>{
        callHook(vm,'updated') //订阅
    },true)

    callHook(vm,'mounted')
}
export function lifecycleMixin(Vue){
    Vue.prototype._update = function(vnode){
        let vm = this
        // 需要区分首次渲染，还是更新
        let prevVnode = vm._vnode //首次渲染，_vnode为null
        if(!prevVnode){
            vm.$el = patch(vm.$el,vnode)//旧dom，虚拟dom
            vm._vnode = vnode 
        }else{
            patch(vm.$el,vnode)
        }
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