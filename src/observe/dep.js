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
        Dep.target.addDep(this) //dep实例添加至target=>watcher

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
export function pushTarget(watcher){
    Dep.target = watcher
}
export function popTarget(){
    Dep.target = null
}
export default Dep