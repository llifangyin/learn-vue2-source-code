let id = 0
class Dep{
    constructor(){
        this.id = id ++
        this.subs = []
    }
    // 收集 watcher
    depend(){
        // console.log(Dep.target);
        // 希望watcher可以存放dep 双向记忆

        // this.subs.push(Dep.target) //转至 watcher里 addDep添加
        Dep.target.addDep(this) 
        // 在watcher中deps添加dep
        // this.deps.push(dep)
        // this.depsId.add(id)
        // ==>
        // dep.addSub(this(watcher)) //dep中subs也添加当前watcher

    }
    addSub(watcher){
        this.subs.push(watcher)
    }
    // 更新 watcher
    notify(){
        this.subs.forEach(watcher=>{
            watcher.update()
        })
    }
}
// 添加watcher
Dep.target = null
// 处理多个watcher 渲染的 和 coputed的
let stack = [] 
export function pushTarget(watcher){
    Dep.target = watcher
    // 入栈
    stack.push(watcher) 
}
export function popTarget(){
    // Dep.target = null
    // 解析一个watcher删除一个watcher
    // console.log(stack,11);
    stack.pop()
    Dep.target = stack[stack.length-1] //获取前面的一个watcher
}
export default Dep