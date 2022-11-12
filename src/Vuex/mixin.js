export let Vues  //实例

export const install = function(_Vue){
    Vues = _Vue
    // 可以使用vue提供的方法 Vue.mixin,实现没一个组件拿到store
    Vues.mixin({
        beforeCreate() {
            console.log(this);
            // 每一个组件实例的option
            let options = this.$options
            if(options.store){//跟实例
                this.$store = options.store
            }else{//其他组件实例
                this.$store = this.$parent && this.$parent.$store
            }
        },
    })
}