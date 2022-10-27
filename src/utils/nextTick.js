let callback = []
let pending = false

function flush(){
    // console.log(222);
    callback.forEach(cb=>cb())
    pending = false
}

let timerFunc 
// 处理兼容性问题
if(Promise){
    timerFunc = ()=>{
        Promise.resolve().then(()=>{
            // console.log(1.5);
            flush()
        })
    }
}else if(MutationObserver){ //h5处理异步
    // 监听dom变化，监控完毕再异步更新
    let observe = new MutationObserver(flush)
    //创建文本
    let textNode = document.createTextNode(1) 
    //观测文本内容
    observe.observe(textNode,{characterData:true})
    timerFunc = ()=>{
        textNode.textContent = 2
    }
}else if(setImmediate){ // ie支持
    timerFunc = ()=>{
        setImmediate(flush)
    }
}
export function nextTick(cb){
    // console.log(cb,111);
    // 队列 //  1 vue 自己的nexttick 2 用户调用的
    callback.push(cb)
    // [cb1,cb2]
    if(!pending){
        // vue3 使用promise.then
        // vue2 处理兼容问题
        timerFunc()//异步执行
        pending = true
    }
}