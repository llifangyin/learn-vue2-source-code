// 将虚拟dom变成真实dom
export function patch(oldVnode,vnode){
    // 1 创建真实的dom
    // console.log(oldVnode,vnode);
    let el = createEl(vnode)
    // console.log(el);
    // 2 替换 （1）获取父节点 （2） 插入当前节点 （3）老元素删除
    let parentEl = oldVnode.parentNode
    // console.log(parentEl);
    parentEl.insertBefore(el,oldVnode.nextsibling)
    parentEl.removeChild(oldVnode)
    return el
}

// 创建真实dom
function createEl(vnode){
    let {tag,data,key,children,text} = vnode
    if(typeof tag === 'string'){
        // 标签
        vnode.el = document.createElement(tag)
        if(children.length){
            children.forEach(child=>{
                vnode.el.appendChild(createEl(child))
            })
        }
        // for(let k in data){
        //     if(k =='style'){
        //         let styleStr=''
        //         for(let l in data[k]){
        //             styleStr += l 
        //             styleStr += ':'
        //             styleStr += data[k][l]
        //             styleStr += ';'
        //         }
        //         vnode.el.setAttribute(k,styleStr)

        //     }else{
        //         vnode.el.setAttribute(k,data[k])
        //     }
        // }
        
    }else{
        vnode.el = document.createTextNode(text)
    }
    return vnode.el
}


// vue的渲染流程
// 数据初始化 => 对模板进行编译 => 变成render函数
//  => 通过render函数变成vnode => vnode变成真实dom
//  insert页面