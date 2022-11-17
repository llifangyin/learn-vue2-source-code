import { createRouterMap ,createRoute} from "./createRouterMap";

export function createMatch(routes){
    // 1.变成路由映射表 
    const pathMap = createRouterMap(routes)
    // console.log(pathMap);
    // 2.addRoute 动态添加路由方法
    function addRoutes(routes){
        createRouterMap(routes,pathMap)
    }
    // 3. 路径要返回一个数组
    // 渲染 '/about/a'  需要match到 [about,about/a]两个
    function match(location){
        // 记录
        let record = pathMap[location]
        // 匹配到记录
        if(record){
            return createRoute(record,{path:location})
        }
        return createRoute(null,{path:location})
    }
    return {
        addRoutes,
        match
    }
    // addRoutes([{
    //     path:'/about',
    //     component:'xx',
    //     children:[
    //         {
    //             path:'b',
    //             component: 'xxx'
    //         }
    //     ]
    // }])
    // console.log(pathMap);
}