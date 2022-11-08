import { mergeOptions } from "../utils/index"

export function initGlobApi(Vue){
    // {created:[a,b,c],data:[a,b]...}
    Vue.options = {}
    Vue.Mixin = function(mixin){
        // 对象的合并
        // console.log(mixin);
        // console.log(Vue.options,this.options);
        this.options = mergeOptions(this.options,mixin)
    }

    // 定义全局方法
    Vue.options.components  = {}
    // 作用将配置项放到vue.options.components上,对应的是extend创建的子组件的类(继承了Vue的属性,并有自己的name和template属性),
    // 使用的时候再new 初始化子实例,mount挂载子实例
    Vue.component = function(id,componentDef){
        componentDef.name = componentDef.name || id
        // 创建组件的核心 Vue.extend()
        console.log(componentDef,'componentDef');
        componentDef = this.extend(componentDef)//返回一个实例
        // componentDef 为一个vue子类，额外多了两个属性componentDef:{name:xxx,template:xxx}
        this.options.components[id] = componentDef
        // console.log(this.options,'Vue.options');
    }

    // 1. 创建子类 ，初始化子组件，继承父组件属性
    Vue.extend = function(options){
        let superr = this
        // 创建子组件的实例
        //     // this == vm == vue
        //     function Vue(options){
        //         this._init(options)
        //    }
        const Sub = function vuecomponent(opts){
            // new Sub().$mount()
            // 实例初始化
            // console.log('子组件实例初始化',this);
            this._init(opts)
        }   

        // console.log(Sub);
        // 子组件继承父组件中的属性 Vue 类的继承
        Sub.prototype = Object.create(superr.prototype)
        // 子组件中的this指向
        Sub.prototype.constructor = Sub 
        // 将父组件中的属性合并到子组件中
        // console.log(this.options,options);
                        //子类继承父类 parent child
        Sub.options = mergeOptions(this.options,options)
        // console.log(Sub.options,777);
        return Sub     

    }






    
    // Vue中组件的使用方式
    // 1. Vue.component()全局注册
    // 2. 局部注册
        // 当全局组件和局部组件name值一样，会取局部组件
    // 3. vue.component()核心实现 Vue.extend() 放回一个组件的实例，.$mount()
    // 4. 组件间的关系，父子组件，子组件继承父组件的属性options，=>类的继承
    // 5. 创建一个子组件，就是new 子类
        // Vue 组件开发：复用 好维护;组件的更新；
        // 组件的特性：属性，样式，插槽





}
