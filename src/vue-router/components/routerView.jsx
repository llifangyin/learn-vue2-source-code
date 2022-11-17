export default{
    functional:true,//true是函数式组件
    render(h,{parent,data}){
        // 1.h=> createElement ,context  => FunctionalRenderContext
        // console.log(this,'this'); // null

        //2. 通过parent app.vue根实例获取route,即嵌套路由 {path:xx,matched:[{path:xx,matched:[]}]}
        let route = parent.$route 

        //  问题 嵌套路由  about/a => [about,about/a]
        // console.log(data,'data');
        // data为router-view上的属性
        data.routerView = true
        
        // console.log(parent,'parent');
        let depPath = 0
        while(parent){
            // $vnode 相当于一个占位符，表示的组件，
            // <template><div></div></template>
            if(parent.$vnode && parent.$vnode.data.routerView){
                depPath++
            }
            // console.log(parent.$vnode,111);
            parent = parent.$parent // 递归寻找父亲
        }
        // console.log(depPath,'depath');
        let recode = route.matched[0].matched[depPath]
        // console.log(recode,'recode');
        // console.log(depPath,recode,'recode-----');
        // 没有路由
        if(!recode){
            return h()
        }else{
            return h(recode.component,data)
        }
    }
}

// router-view 占位符 函数式组件创建
// 函数式组件：没有管理状态、没有生命周期方法、只接受一些prop的函数、标记为functional(无状态，无响应式的，无this上下文)