// 公共方法
import { History } from './base'
function getHash(){
    return window.location.hash.slice(1) // #hash 
}
class HashHistory extends History{
    constructor(router) {
        super(router)
        this.router = router
        // 确保当前mode是hash
        ensureSlash()
        
    }
    getCurrentLocation(){
        return getHash()
    }
    setUpListener(){
        window.addEventListener('hashchange',()=>{
            // 跳转
            // this HashHistory实例
            this.transitionTo(getHash())
        })
    }
}
export {
    HashHistory
}


function ensureSlash(){
    if(window.location.hash){
        return 
    }
    window.location.hash = '/'
}