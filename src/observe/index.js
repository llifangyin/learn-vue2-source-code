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
        // 定义一个属性
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
function defineReactive(data,key,value){
    let childDep = observer(value)
    // 给每个属性添加一个dep
    let dep = new Dep()
    Object.defineProperty(data,key,{
        get(){
            // console.log(childDep,'childDep');
            if(Dep.target){ 
            //注意此处是大写,target是静态私有变量不是实例的属性
                dep.depend()
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
            observer(newValue)
            value = newValue
            // 更新依赖
            dep.notify()
        }
    })
}
