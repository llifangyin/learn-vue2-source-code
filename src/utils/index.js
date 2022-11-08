
export const HOOKS = [
    "beforecreate",
    "created",
    "beforeMount",
    "mounted",
    "beforeupdate",
    "updated",
    "beforeDestroy",
    "destroyed"
]
// 策略模式
let starts = {} 
starts.data = function(parentVal,childVal){
    return childVal

}
// 全局组件和内部组件处理 
starts.components = function(parentVal,childVal){
    const obj = Object.create(parentVal)
    if(childVal){
        for(let key in childVal){
            obj[key] = childVal[key]
        }
    }
    return obj
}
//合并data
// starts.computed = function(){}
// starts.watch = function(){}
// starts.methods = function(){}
// 遍历声明周期HOOKS
HOOKS.forEach(hooks=>{
    starts[hooks] = mergeHooks
})

// console.log(starts);
function mergeHooks(parentVal,childVal){
    // console.log(parentVal,childVal);
    // {created:[a,b,c],data:[a,b]...}
    if(childVal){
        if(parentVal){
            return parentVal.concat(childVal)
        }else{
            return [childVal] // 
        }
    }else{
        return parentVal
    }
}

export function mergeOptions(parent,child){
    // console.log(parent,child,'in-mergeOptions');
    const options = {}
    // {created:[a,b,c],data:[a,b]...}
    for(let key in parent){
        mergeField(key)
    }
    for(let key in child){
        mergeField(key)
    }
    function mergeField(key){
        //  策略模式
        if(starts[key]){
            options[key] = starts[key](parent[key],child[key])
        }else{
            // 合并组件时  全局组件也要合并过来 
            options[key] = child[key] || parent[key]
        }
    }
    // console.log(options,'options-mergeOptions');
    return options
}
