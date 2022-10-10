# learn-vue2-source-code
Learn the source code of vue2

## 通过rollup搭建环境
1. 安装依赖
npm install @babel/preset-env @babel/core rollup rollup-plugin-babel rollup-plugin-serve -D

2. 打包配置rollup.config.js
执行命令： rollup -c -w     (-c 去找配置文件)

## 测试
index.html 引入 打包生成的/dist/vue.js 调用new Vue使用

## 启动
npm run dev

## 初始化Vue
+ Vue对象封装 
+ Vue.prototype._init ==> initState(initProps,initData,initWatch,initMethods,initComputed)
+ Vue.prototype.$mounted

## vue2数据劫持
+ initData里 执行obsever(data)
### 对象

1. **Object.defineProperty** 只能对象中第一个属性劫持
1. 创建Observer类，构造函数遍历对象的属性，遍历数组的对象属性。export observe （实例Obsever类）方法供调用
2. 遍历walk对象的属性
3. 递归defineReactive 进行Object.definProperty对象的get set 

### 数组
1. 函数劫持**修改__proto__** 或者 **Object.setPrototype**
2. 对象数组遍历劫持数据
3. 对象的方法push unshift splice(第三个参数) 添加的数据进行数据劫持

### data对象代理
+ initData 中使用defineProperty 对vm._data.key 进行代理； 以便使用vm.key调用和修改

## 模板编译
init初始化后，开始模板编译步骤详见生命周期
1. 判断Has el Option 有直接进行下一步，没有调用vm.$mounted方法
2. 判断Has template option ?有进行render function :没有编译模板 compile el's outerHTML as template......
3. 开始编译:获取dom,创建ast语法树

+ 声明正则 匹配标签名,标签开始,标签结束,属性等
+ 解析HTML字符串,从前往往后一次查找
+ 先找到开始标签< ,然后调用parseStartTag 记录标签名,读取属性attrs,通过advace()删除掉标签,得到一个除了开始标签的新html字符串
+ 正则匹配标签结束位置,截取记录文本内容,最终删除文本内容.
+ 最终得到语法树的零件:开始标签,文本,结束标签