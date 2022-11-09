// 将虚拟dom变成真实dom
export function patch(oldVnode,vnode){
    // 组件没有老节点
    // console.log(oldVnode,vnode,333);
    if(!oldVnode){
        // console.log(oldVnode,vnode,111);
        return createEl(vnode)
    }else{
        // console.log(oldVnode,vnode);
        // 第一次渲染 oldnode 是一个真实dom
        // console.log(oldVnode.nodeType,444);
        if(oldVnode.nodeType == 1){
            // 1 创建真实的dom
            // console.log(oldVnode,vnode);
            let el = createEl(vnode)
            // console.log(el,'insertEl');
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


}
function updateChild(oldChildren,newChildren,parent){
    // vue diff算法
    // dom中操作元素：头部添加，尾部添加，倒序和正序的的方式
    //  vue2 采用双指针的方法
    // 1. 创建双指针
    // console.log(oldChildren,newChildren);
    let oldStartIndex = 0 //old开头索引
    let oldStartVnode = oldChildren[oldStartIndex] //old开始元素
    let oldEndIndex = oldChildren.length-1
    let oldEndVnode = oldChildren[oldEndIndex]    

    let newStartIndex = 0 //old开头索引
    let newStartVnode = newChildren[newStartIndex] //old开始元素
    let newEndIndex = newChildren.length-1
    let newEndVnode = newChildren[newEndIndex]

    function isSameVnode(oldContext,newContext){
        return (oldContext.tag === newContext.tag) && (oldContext.key == newContext.key)
    }
    // 创建旧元素映射表
    function makeIndexByKey(child){
        let map = {}
        child.forEach((item,index)=>{
            if(item.key){
                map[item.key] = index
            }
        })
        return map
    }
    let map = makeIndexByKey(oldChildren)
    // console.log(map);
    // 2. 遍历
    while(oldStartIndex<=oldEndIndex && newStartIndex <= newEndIndex){ //？？
        // 比对 开头元素
        if(isSameVnode(oldStartVnode,newStartVnode)){
            // 从前往后比对
            // console.log('con');
            patch(oldStartVnode,newStartVnode)
            // 移动指针
            oldStartVnode = oldChildren[++oldStartIndex]
            newStartVnode = newChildren[++newStartIndex]
    
        }else if(isSameVnode(oldEndVnode,newEndVnode)){
            // 从后往前比对
            patch(oldEndVnode,newEndVnode)
            // 移动指针
            oldEndVnode = oldChildren[--oldEndIndex]
            newEndVnode = newChildren[--newEndIndex]
    
        }else if( isSameVnode(oldStartVnode,newEndVnode)){
            // 交叉比对 old头与start尾
            patch(oldStartVnode,newEndVnode)
            oldStartVnode = oldChildren[++oldStartIndex]
            newEndVnode = newChildren[--newEndIndex]
        }else if(isSameVnode(oldEndVnode,newStartVnode)){
            // 交叉对比  old尾与start头
            patch(oldEndVnode,newStartVnode)
            oldEndVnode = oldChildren[--oldEndIndex]
            newStartVnode = newChildren[++newStartIndex]
        }else{
            // 暴力比对:子集没有任何关系(遍历对比)
            // 1. 创建旧元素映射表   //{a:0,b:1,c:2}
            let moveIndex = map[newStartVnode.key]
            // 2. 从旧映射表中寻找元素
            if(moveIndex == undefined){
                // 没有找到元素，添加到最前面
                // p:已有的虚拟dom的el属性是创建对应的真实dom
                parent.insertBefore(createEl(newStartVnode),oldStartVnode.el)
            }else{//有
                //  获取到要插入的的元素
                let moveVnode = oldChildren[moveIndex]   
                oldChildren[moveIndex] = null//防止数组塌陷
                //？？为什么插入到oldStartVnode.el之前
                parent.insertBefore(createEl(moveVnode),oldStartVnode.el) 
                // 可能问题，可能插入的元素有子元素
                patch(moveVnode,newStartVnode) // newEndVnode???
            }
            // 新元素指针位移，继续循环
            newStartVnode = newChildren[++newStartIndex]

        }
        // key的作用: vnode更新，找到已有key值的vnode的话会复制该节点，而不是创建节点，性能提升

    }
    // while遍历完成后 index最后比对的那一个 
    // 添加多余的子元素/ old3 new4
    if(newStartIndex<=newEndIndex){
        for(let i = newStartIndex;i<=newEndIndex;i++){
            parent.appendChild(createEl(newChildren[i]))
        }
    }

    // 将多余元素去掉
    if(oldStartIndex<=oldEndIndex){
        for(let i = oldStartIndex;i<=oldEndIndex;i++){
            let child = oldChildren[i]
            if(child!=null){
                parent.removeChild(child.el) //删除元素
            }
        }
    }

    /* 测试diff算法 => 放置src/index.js里测似 */
    //初始化创建vnode 
    // let vm1 = new Vue({data:{name:'zhangsan vnode1'}}) //
    // // let render1 = compileToFunction(`<div id="a" cc='cc' style="color:blue;font-size:18px">{{name}}</div>`)
    // let render1 = compileToFunction(`<ul>
    // <li key='a'>a</li>
    // <li key='b'>b</li>
    // <li key='c'>c</li>
    // <li key='f'>f1</li>
    // </ul>`)
    // let vnode1 = render1.call(vm1)
    // document.body.appendChild(createEl(vnode1))

    // // 数据更新 计算diff最小化更新 => patch方法
    // let vm2 = new Vue({data:{name:'lisi vnode2'}}) //
    // // let render2 = compileToFunction(`<div id="b" name="test" style="color:gray;font-size:22px">{{name}}</div>`)
    // let render2 = compileToFunction(`<ul>
    // <li key='f'>f</li>
    // <li key='g'>g</li>
    // <li key='e'>e</li>
    // <li key='h'>h</li>
    // <li key='a'>a2</li>
    // </ul>`)
    // let vnode2 = render2.call(vm2)
    // // document.body.appendChild(createEl(vnode2))
    // // 通过patch比对
    // setTimeout(() => {
    //      patch(vnode1,vnode2)
    // }, 2000);

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
    let {vm,tag,data,key,children,text} = vnode
    // console.log(vnode,555);
    if(typeof tag === 'string'){
        // 组件
        if(createComponent(vnode)){
            // console.log(vnode.componentInstance.$el,'my-button create');
            return vnode.componentInstance.$el

        }else{
        // 标签 
            vnode.el = document.createElement(tag)
            updateProps(vnode)
            if(children.length){
                children.forEach(child=>{
                    // 如果child为component return vnode.componentInstance.$el
                    vnode.el.appendChild(createEl(child))
                })
            }
        }
    }else{
        vnode.el = document.createTextNode(text||children)
    }
    // console.log(vnode.el,11111111111);
    return vnode.el
}

function createComponent(vnode){
    let i = vnode.data
    if((i = i.hook)&& (i= i.init)){
        i(vnode) //初始化创建子组件的实例
    }
    // console.log(vnode.componentInstance,'componentInstance');
    if(vnode.componentInstance){
        return true
    }
    return false
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
