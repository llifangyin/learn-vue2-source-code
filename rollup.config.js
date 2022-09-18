import babel from 'rollup-plugin-babel'
import serve from 'rollup-plugin-serve'

export default {
    input:'./src/index.js', //Package entry file
    output:{
        file:'dist/vue.js',
        format:'umd', // 创建全局变量Vue 可以new Vue调用
        name:'Vue',
        sourcemap:true, 
    },
    plugins:[
        babel({
            exclude:'node_modules/**'
        }),
        serve({
            port:3000,
            openPage:'./index.html',
            contentBase:'',//当前目录
        })
    ]

}