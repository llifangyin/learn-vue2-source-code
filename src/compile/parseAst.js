

// ast语法树 {} 操作节点 css js
//  vnode {}操作节点
// <div id="app">hello {{msg}} </div>
/* 
{
    tag:"div",
    attrs:[{id:"app"}],
    children:[{
        tag:null,
        text:'hello{{msg}}'
    }]
}
*/
// 声明正则 匹配标签开头结尾 属性 
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*` //标签名 a h span 
const qnameCapture = `((?:${ncname}\\:)?${ncname})` //<span:xx> 特殊标签
const startTagOpen = new RegExp(`^<${qnameCapture}`)//标签开头的正则，捕获的内容是标签名
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)//匹配标签结尾的</div>
// attr='xxx'
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/ 
const startTagClose = /^\s*(\/?)>/  //匹配标签结束时的>



// 解析html
// 遍历
export function parseHTML(html){
    
    // 创建ast对象
    function createAstElement(tag,attrs){
        return {
            tag,//元素
            attrs,//属性
            children:[],//子集
            type:1,//dom 1
            parent:null
        }
    }

    // 开始的标签 添加至root 语法树解构的对象中
    function start(tag,attrs){
        // console.log(tag,attrs,'开始标签');
        let element = createAstElement(tag,attrs)
        if(!root){
            root = element
        }
        createdParent = element
        stack.push(element)
    }
    // 文本
    function charts(text){
        // console.log(text,'文本');
        text = text.replace(/\s*/g,'')//去空格
        if(text){
            createdParent.children.push({
                type:3,
                text
            })
        }
    }
    function end(tag){
        // console.log(tag,'结束标签');
        let element = stack.pop()
        createdParent = stack[stack.length-1]
        if(createdParent){ //元素的闭合
            element.parent = createdParent.tag
            createdParent.children.push(element)
        }
    }

    let root;//根元素
    let createdParent;//当前元素父节点
    let stack=[]; //栈的数据解构 [div,h]


    // 开始标签 文本 结束标签
    // 一层层的剥离html的内容
    while(html){
        let textEnd = html.indexOf('<')//有0 无-1
        if(textEnd ===0){
            // 1开始标签    
            const startTagMatch = parseStartTag() //开始标签的内容
            if(startTagMatch){
                start(startTagMatch.tagName,startTagMatch.attrs)
                continue
            }
            
            // 2结束标签
            let endTagMatch = html.match(endTag)
            // console.log(endTagMatch,'endTagMatch');
            if(endTagMatch){
                advance(endTagMatch[0].length)
                end(endTagMatch[1])
                continue
            }
        }
        let text 
        // 文本
        if(textEnd>0){
            // 获取文本内容
            // console.log(html);
            text = html.substring(0,textEnd)
            // console.log(text);
        }
        if(text){
            advance(text.length)
            charts(text)
            // console.log(html);
        }
        // break;
    }
    function parseStartTag(){
        // 匹配开始标签
        const start = html.match(startTagOpen)//1结果 2false
        // console.log(start);
        if(!start) return false
        // 创建ast语法树
        let match = {
            tagName:start[1],
            attrs:[],
        }
        // 删除开始标签
        advance(start[0].length)
        // 遍历属性,结束标签>
        let attr,end 
        while(!(end = html.match(startTagClose) ) && (attr = html.match(attribute)) ){
            // console.log(end);
            // console.log(attr);
            match.attrs.push({
                name:attr[1],
                value:attr[3]||attr[4]||attr[5]
            })
            advance(attr[0].length)
        }
        // console.log(end);
        if(end){
            advance(end[0].length)
            return match
        }
    }
    function advance(n){
       html =  html.substring(n)
        // console.log(html);
    }
    return root
}
  