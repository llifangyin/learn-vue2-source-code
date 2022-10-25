import { mergeOptions } from "../utils/index"

export function initGlobApi(Vue){
    // {created:[a,b,c],data:[a,b]...}
    Vue.options = {}
    Vue.Mixin = function(mixin){
        // 对象的合并
        // console.log(mixin);
        // console.log(Vue.options,this.options);
        this.options = mergeOptions(this.options,mixin)
    }
}
