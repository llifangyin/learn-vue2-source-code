import { compileToFunction } from "./compile/index";
import { initGlobApi } from "./global-api/index";
import { initMixin } from "./init";
import { stateMixin } from "./initState";
import { lifecycleMixin } from "./lifecycle";
import { renderMixin } from "./vnode/index.js"
import { createEl, patch } from "./vnode/patch";
function Vue(options){
     this._init(options)
    


}

initMixin(Vue) // 添加数据初始化
lifecycleMixin(Vue) //添加声明周期
renderMixin(Vue) //render函数 创建虚拟dom
stateMixin(Vue) // 给实例添加$nextTick 方法

// 全局方法 Vuemixin vue.component extend...
initGlobApi(Vue)


//初始化创建vnode 
let vm1 = new Vue({data:{name:'zhangsan vnode1'}}) //
// let render1 = compileToFunction(`<div id="a" cc='cc' style="color:blue;font-size:18px">{{name}}</div>`)
let render1 = compileToFunction(`<ul><li>a</li><li>b</li><li>c</li></ul>`)
let vnode1 = render1.call(vm1)
document.body.appendChild(createEl(vnode1))

// 数据更新 计算diff最小化更新 => patch方法
let vm2 = new Vue({data:{name:'lisi vnode2'}}) //
// let render2 = compileToFunction(`<div id="b" name="test" style="color:gray;font-size:22px">{{name}}</div>`)
let render2 = compileToFunction(`<ul><li>a</li><li>b</li><li>c</li><li>d</li></ul>`)
let vnode2 = render2.call(vm2)
// document.body.appendChild(createEl(vnode2))
// 通过patch比对
setTimeout(() => {
     patch(vnode1,vnode2)
}, 2000);

export default Vue