export function createRouterMap(routes,routerOptions={}){
    let pathMap = routerOptions
    routes.forEach(router=>{
        addRouterRecord(router,pathMap)
    })
   
    return pathMap
}
function addRouterRecord(router,pathMap,parent){
    let path = parent?`${parent.path}/${router.path}`: router.path
    let record = {
        path:router.path,
        name:router.name,
        component:router.component,
        parent
    }
    if(!pathMap[path]){
        pathMap[path] = record
    }
    if(router.children){
        router.children.forEach(child=>{
            addRouterRecord(child,pathMap,record)
        })
    }
}

export function createRoute(record,{path}){
    let matched = []
    if(record){
        while(record){
            matched.unshift(record)// /about /about/a ...
            record = record.parent
        }
    }
    return {
        path,
        matched
    }
}