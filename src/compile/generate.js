//   <div id='app'>hello{{msg}}<h></h></div>
// render(){ //_c解析标签
//     return _c('div',{id:app},_v('hello'+_s(msg)),_c('h',''))
// }
// 插值表达式
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g


function genProps(attrs){
    let str =''
    for(let i = 0;i<attrs.length;i++){
        let attr = attrs[i]
        // 处理style属性
        let obj = {}
        if(attr.name=='style'){
            attr.value.split(';').forEach(item=>{
                let [key,val]=item.split(':')
                obj[key] = val
            })
            attr.value = obj
        }
        str += `${attr.name}:${JSON.stringify(attr.value)},`
    }
     return `{${str.slice(0,-1)}}`
}
// 处理子节点
function genChildren(el){
    let children = el.children
    // console.log(children);
    if(children){
        return children.map(child=>gen(child)).join(',')
    }
}
function gen(node){
    // 元素 _c
    if(node.type === 1){
        return generate(node)
    }else{
        //文本
        // 1.纯文本 _v
        // 2.插值表达式 _s
        let text = node.text //获取文本
        if(!defaultTagRE.test(text)){
            // console.log(text);
            // 普通文本
            return `_v(${JSON.stringify(text)})`
        }
        // 特殊文本 带有插值表达式 {{}} 
        let tokens = []
        let lastindex = defaultTagRE.lastIndex = 0 //正则调用多次的情况lastIndex匹配过后置位0可以再次使用 {{a}} {{b}}
        let match 
        while (match = defaultTagRE.exec(text)) {
            // console.log(match);
            // hello {{msg}} dd
            let index = match.index
            if(index > lastindex){
                // 添加内容
                tokens.push(JSON.stringify(text.slice(lastindex,index)))
            }
            tokens.push(`_s(${match[1].trim()})`)
            lastindex = index + match[0].length

        }
        if(lastindex<text.length){
            tokens.push(JSON.stringify(text.slice(lastindex)))
        }
        return `_v(${tokens.join('+')})`
    }
}
export function generate(el){
    // 处理子节点
    let children = genChildren(el)
    // console.log(children);
    // 字符串模板
    let code = `_c('${el.tag}',${el.attrs.length?`${genProps(el.attrs)}`:'undefined'}${children?`,${children}`:''})`
    // console.log(code);
    // _c('div',{id:"app",style:{"color":"cyan","margin":"10px"}},_v("\n        hello "+_s(msg)+" \n        "),_c('h2',undefined,_v("张三")),_v("\n    "))
    return code

}