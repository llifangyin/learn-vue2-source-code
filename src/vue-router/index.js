let Vue
import routerLink from "./components/routerLink";
import routerView from "./components/routerView";
import { createMatch } from "./createMatch";
import { HashHistory } from "./history/hash";
import { HTMLHistory } from "./history/html5";
export default class VueRouter{
    constructor(options={}){
        // match核心，变成想要的路由格式 [{},{}] => {'/':{component}}
        this.match = createMatch(options.routes || [])

        this.beforeHooks = []

        // 核心二:路由管理
        // 1.获取模式
        options.mode = options.mode || 'hash'
        switch(options.mode){
            case 'hash':
                this.history = new HashHistory(this)
                break
            case'history':
                this.history = new HTMLHistory(this)
                break
        }
        // console.log(this.history,111);

    }
    beforeEach(fn){
        this.beforeHooks.push(fn)
    }
    push(location){
        // this.history.transitionTo(location)
        this.history.push(location)
    }
    // app this实例
    init(app){
        // 1. 获取当前路由
        const history = this.history
        history.listen((route)=>{
            app._route = route
        })
        // 2.跳转
        const setUpHashListener = ()=>{
            history.setUpListener()
        }
        history.transitionTo(
            history.getCurrentLocation(),//获取当前路由
            // 2.回调函数
            setUpHashListener
        )
    }
}
VueRouter.install = (_Vue)=>{
    Vue = _Vue

    // jsx全局组件
    Vue.component('router-link',routerLink)
    Vue.component('router-view',routerView)

    // 给每个组件添加router组件实例，
    Vue.mixin({
        beforeCreate() {
            if(this.$options.router){
                // 根实例
                this._routerRoot = this
                this._router = this.$options.router
                this._router.init(this)
                // 响应式处理
                Vue.util.defineReactive(this,'_route',this._router.history.current)
            }else{
                this._routerRoot = this.$parent&&this.$parent._routerRoot
            }
        },
    })

    Object.defineProperty(Vue.prototype,'$router',{
        get(){
            return this._routerRoot._router
            // return this._router
        }
    })
    Object.defineProperty(Vue.prototype,'$route',{
        get(){
            return this._routerRoot._route
            // return this._route
        }
    })

}

// vue  this.$route属性 this.$router方法