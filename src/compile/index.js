import {parseHTML} from './parseAst';
import {generate} from './generate';
export function compileToFunction(el){
    // 1.将html变成ast语法树
    let ast = parseHTML(el)

    // 2.将ast语法树 变成render函数
        // (1) ast语法树变成字符串拼接 (2) 字符串变成render函数 with()
    
    let code = generate(ast) // _c节点 _v文本 _s变量
    // console.log(code);
    let render = new Function(`with(this){return ${code}}`)
    // console.log(render);

    // ƒ anonymous(
        //     ) {
            //     with(this){return _c('div',{id:"app",style:{"color":"cyan","margin":"10px"}},_v("\n        hello "+_s(msg)+" \n        "),_c('h2',undefined,_v("张三")),_v("\n    "))}
    //     }
    
    // with的用法 改变作用域 继而使模板里的变量name 可以直接显示为this.name
    // let obj = {a:1,b:2}
    // with(obj){
        //     console.log(a,b);
        // }
        
    return render
    // 3. 将render函数变成虚拟dom vnode init.js里实现


}