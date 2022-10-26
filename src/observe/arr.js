// 获取原来的数组方法
let oldArrayProtoMethods = Array.prototype
// 继承 创建新的方法对象
export let arrMethods = Object.create(oldArrayProtoMethods)

let methods = ['push','pop',"unshift","shift","splice"]

methods.forEach(item=>{
    arrMethods[item] = function(...args){
        console.log('劫持数组');
       let result =  oldArrayProtoMethods[item].apply(this,args)//this当前实例对象，
        //observe中把类整体赋值给了__ob__可供在此调用数据劫持方法obseveArray

        //args :push时为添加的数组参数
        // 追加的数组对象进行数据劫持 push unshift  splice(第三个参数时新增的)
        let inserted;
        switch(item){
            case 'push':
            case 'unshift':
                inserted = args
                break;
            case 'splice':
                inserted = args.splice(2)//arr.splice(0,1,{a:6})
                break
        }

        // console.log(this,'this');//当前调用的数组对象
        let ob = this.__ob__
        if(inserted){
            //对添加的对象进行劫持
            ob.observeArray(inserted)
        }
        console.log(inserted,111);
        ob.dep.notify()
       return result
    }
})