// 公共方法

import { createRoute } from "../createRouterMap";
function runQueue(queue,interator,cb){
    // 同步执行 
    function step(index){
        // 队列里的函数执行完毕
        if(index>=queue.length){
            return cb()
        }

        let hook = queue[index]
        interator(hook,()=>step(index+1))
        
    }
    step(0)
}

class History{
    constructor(router) {
        this.router = router
        // this传递过来的

        // 保存最新的路由记录
        this.current = createRoute(null,{path:'/'})
            // console.log(router,111);
    }

    listen(cb){
        this.cb = cb
    }
    
    push(to){
        this.transitionTo(to,()=>{
            window.location.hash = to
        })
    }
   
    transitionTo(location,cb){
        // 获取到最新的地址，根据地址渲染组件 match(/about/a)
        let router = this.router.match.match(location)
        // console.log(router,555);
        // 渲染数据 响应式
        // 最新路径
        this.current = createRoute(router,{path:location})
        // {path: '/about/a', matched: Array(1)}
        // console.log(this.current,4444);

        // 获取到全局守卫的队列
        let queue = [].concat(this.router.beforeHooks)
        console.log(queue,'queue');
        // 队列函数执行
        const iterator = (hook,next)=>{
            //hook:当前守卫执行的方法
            // from, to,next
            hook(this.current,router,()=>{
                next()
            })
        }
        // 更新视图
        runQueue(queue,iterator,()=>{
            // 队列方法执行完执行
            this.cb && this.cb(this.current)
            // 执行方法
            cb && cb()
        })


    }
}
export {
    History
}
