let oldArrayProtoMethods = Array.prototype

export let arrMethods = Object.create(oldArrayProtoMethods)

let methods = ['push','pop',"unshift","shift","splice"]

methods.forEach(item=>{
    arrMethods[item] = function(...args){
        console.log('劫持数组');
       let result =  oldArrayProtoMethods[item].apply(this,args)
       return result
    }
})