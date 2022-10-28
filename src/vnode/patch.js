// 将虚拟dom变成真实dom
export function patch(oldVnode,vnode){
    // console.log(oldVnode,vnode);
    // 第一次渲染 oldnode 是一个真实dom
    if(oldVnode.nodeType == 1){
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
    }else{
        // 第二次渲染，oldVnode是虚拟dom,进行比对，进行最小量更新
        /*  diff算法,最小量更新 */
        // 1.元素不一样 整体替换
        if(oldVnode.tag!==vnode.tag){
            oldVnode.el.parentNode.replaceChild(createEl(vnode,oldVnode.el))
        }
        // 2. 标签一样，text属性
        if(!oldVnode.tag){
            // 没有tag是文本
            if(oldVnode.text !== vnode.text){
                return oldVnode.el.textContent = vnode.text
            }
        }
        // 2.1 属性不同(标签一样) <div id="a"> => <div id="b">
        // 方法 1直接复制
        let el = vnode.el = oldVnode.el
        updateProps(vnode,oldVnode.data)

        //3. 子元素diff 子元素:
        let oldChildren = oldVnode.children || []
        let newChildren = vnode.children || []
        if(oldChildren.length && newChildren.length){
            updateChild(oldChildren,newChildren,el)
        }else if(oldChildren.length){
            el.innerHtml = ''
        }else if(newChildren.length){
            for(let i = 0;i<newChildren.length;i++){
                let child = newChildren[i]
                // 添加真实dom
                el.appendChild(createEl(child))
            }
        }
    }

}
function updateChild(oldChildren,newChildren,el){

}
// 添加属性
function updateProps(vnode,oldProps={}){//第一次属性
    let newProps = vnode.data || {} //获取当前新节点属性 
    let el = vnode.el //获取当前节点

    // 1. 属性处理：old 有属性 新的没属性
    for(let key in oldProps){
        if(!newProps[key]){
            // 删除当前节点的属性
            el.removeAttribute(key)
        }
    }
    // 2. 老vnode样式处理：老的style,样式处理 
    let newStyle = newProps.style || {} //新样式
    let oldStyle = oldProps.style || {}
    for(let key in oldStyle){
        if(!newStyle[key]){
            el.style = ''
        }
    }
    // 3.新vnode: 样式处理
    for(let key in newProps){
        if(key === 'style'){
            for(let styleName in newProps.style){
                el.style[styleName] = newProps.style[styleName]
            }
        }else if(key =='class'){
            el.className = newProps.className
        }else{
            el.setAttribute(key,newProps[key])
        }
    }



}

// 创建真实dom
export function createEl(vnode){
    let {tag,data,key,children,text} = vnode
    if(typeof tag === 'string'){
        // 标签
        vnode.el = document.createElement(tag)
        updateProps(vnode)
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



// diff算法
// 1. vue操作vnode  {tag:'div',data:'',children:[]}
// 2. 真实dom
// for(let key in app){
//     console.log(key);
// }

// vue更新数据 通过diff算法实现(最小量更新) vnode比对
// 1. 创建两个vnode
// 2. 对比:在数据更新时,拿到老节点和新节点比对,不同的地方更新
