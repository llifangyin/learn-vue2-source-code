// 获取原来的数组方法
let oldArrayProtoMethods = Array.prototype
// 继承 创建新的方法对象
export let arrMethods = Object.create(oldArrayProtoMethods)

let methods = ['push','pop',"unshift","shift","splice"]

methods.forEach(item=>{
    arrMethods[item] = function(...args){
        console.log('劫持数组');
       let result =  oldArrayProtoMethods[item].apply(this,args)
       return result
    }
})