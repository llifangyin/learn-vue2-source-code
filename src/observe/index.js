import { arrMethods } from "./arr"

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
    observer(value)
    Object.defineProperty(data,key,{
        get(){
            console.log('获取pbj');
            return value
        },
        set(newValue){
            console.log('设置obj');
            if(newValue==value){
                return
            }
            observer(newValue)
            value = newValue
        }
    })
}
