import { arrMethods } from "./arr"
import Dep from './dep'
export function observer(data){
    if(typeof data != 'object' || data == null){
        return data
    }
    return new Observer(data)

}

class Observer{
    constructor(data){
        // 定义一个属性__ob__ 指向本身实例
        Object.defineProperty(data,'__ob__',{
            enumerable:false,
            value:this,//this当前实例 this.observeArray
        })
        this.dep = new Dep() //给所有的对象类型添加一个dep

        if(Array.isArray(data)){
           
            // 对数组的方法进行劫持行操作
            data.__proto__ = arrMethods
            // 如果是对象数组，对数组对象劫持
            this.observeArray(data)
        }else{
            this.walk(data) 
        }
    }
    // 遍历对象的属性，响应式劫持
    walk(data){
        let keys = Object.keys(data)
        for(let i =0;i<keys.length;i++){
            let key = keys[i]
            let value = data[key]
            defineReactive(data,key,value)
        }
    }
    // 遍历对象数组
    observeArray(value){
        value.forEach(data=>{
            observer(data)
        })
    }

}
// 每一个defineReactive方法，会创建一个私有属性 dep 即Dep的实例
function defineReactive(data,key,value){
    let childDep = observer(value)
    // 给每个属性添加一个dep
    let dep = new Dep() //私有属性
    console.log(key,'defineReactive初始化响应式',dep);
    Object.defineProperty(data,key,{
        get(){
            // console.log(childDep,'childDep');
            // console.log(Dep.target,1111);
            if(Dep.target){ 
            //注意此处是大写,target是静态私有变量不是实例的属性
                dep.depend()
                 // 在watcher中deps添加dep
                // this.deps.push(dep)
                // this.depsId.add(id)
                // ==>
                // dep.addSub(this(watcher)) //dep中subs也添加当前watcher
                console.log('执行 observe 中的getter,获取最新的值',dep,key);
                if(childDep.dep){
                    // 如果有 进行数组收集
                    childDep.dep.depend() 
                }
            }
            // console.log(dep,'dep111');
            // console.log('获取pbj');
            return value
        },
        set(newValue){
            // console.log('设置obj');
            if(newValue==value){
                return
            }
            console.log('observe set 监听name修改');
            observer(newValue)
            value = newValue
            // 更新依赖
            dep.notify()
        }
    })
}
