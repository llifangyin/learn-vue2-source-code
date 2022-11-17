 
// 组件
export default{
    // 组件的属性
    props:{
        to:{
            type:String,
            required:true
        },
        tag:{
            type:String
        }
    },
    render(h) {
        // jsx
        let tag = this.tag || 'a'
        let handler = ()=>{
            this.$router.push(this.to)
        }
        return <tag onclick={handler}>{this.$slots.default}</tag>
    }
}