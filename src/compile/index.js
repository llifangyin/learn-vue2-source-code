import {parseHTML} from './parseAst';
import {generate} from './generate';
export function compileToFunction(el){
    // 1.将html变成ast语法树
    let ast = parseHTML(el)

    // 2.将ast语法树 变成render函数
        // (1) ast语法树变成字符串拼接 (2) 字符串变成render函数
    
    let code = generate(ast)
    console.log(code);
}