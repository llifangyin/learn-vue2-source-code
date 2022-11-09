export function renderMixin(Vue){
    // 节点 创建标签
    Vue.prototype._c = function(){
        return createElement(this,...arguments)
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
function createElement(vm,tag,data={},...children){
    // console.log(children,8888);
    // 创建1.标签 2.组件
    // 判断标签还是组件
    if(isReserved(tag)){
        return vnode(vm,tag,data,data.key,children)
    }else{
        // 创建组件 拿到子组件
        const Ctor = vm.$options['components'][tag]
        // console.log(vm.$options,2222);
        // 创建自定义组件
        return createComponent(vm,tag,data,children,Ctor)
    }
}
// 创建组件的虚拟dom
function createComponent(vm,tag,data,children,Ctor){
    // console.log(Ctor,typeof Ctor,'{name:f vueconpoent}');
    // 对象 {name:'xx',componet:'xx'}
    // console.log(typeof Ctor,'ctor');
    // console.log(children,'children-----------');
    if(typeof Ctor =='object'){
        // console.log(vm.constructor.extend,'vm.constructor.extend == Vue.extend');
        // vm.constructor == Vue构造函数Vue,它的extend函数也可以写成Vue.extend需要引入Vue
        Ctor = vm.constructor.extend(Ctor) //返回一个子类
        // console.log(Ctor,'vue的子类');
        // 添加一个方法
        // console.log(vnode(vm,'vue-component'+tag,data,undefined,{Ctor,children}),222);
    }
    
    data.hook = {
        init(vnode){ // 组件的初始化
            // 创建实例
            // console.log(vnode,'vnode => hook.init');
            // console.log(vnode.vm,222);
            let child = vnode.componentInstance = new vnode.componentOptions.Ctor({})
            // console.log(child,'子类实例');
            // console.log(child.$el,'child.$el');
            // child.$el = vnode.vm.$el
            // 子组件实例化的目的是获取到该实例child的$el 即转换后的组件真实dom，不用挂载
            child.$mount() // $el
        }
    }
    // 为什么是'vm'
    // console.log(vnode('vm','vue-component'+'-'+ tag,data,undefined,undefined,undefined,{Ctor,children}),'vnode111');
    return vnode('vm','vue-component'+'-'+ tag,data,undefined,undefined,undefined,{Ctor,children})
}

// 是否是html标签
function isReserved(tag){
    return ['a','div','button','span','input','ul','li',
            'img','ol','h1','h2','h3','h4','h5','p','textarea'].includes(tag)
}

// 创建文本
function createText(text){
    return vnode(undefined,undefined,undefined,undefined,text)
}
// 创建虚拟dom
function vnode(vm,tag,data,key,children,text,componentOptions){
    return {
        vm,
        tag,
        data,
        key,
        children,
        text,
        componentOptions
    }
}