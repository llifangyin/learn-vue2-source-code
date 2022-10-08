# learn-vue2-source-code
Learn the source code of vue2

## 通过rollup搭建环境
1. 安装依赖
npm install @babel/preset-env @babel/core rollup rollup-plugin-babel rollup-plugin-serve -D

2. 打包配置rollup.config.js
执行命令： rollup -c -w     (-c 去找配置文件)

## 测试
index.html 引入 打包生成的/dist/vue.js 调用new Vue使用

## vue2数据劫持
### 对象
1. **Object.defineProperty** 只能对象中第一个属性劫持
2. 遍历
3. 递归 get set 

### 数组
1. 函数劫持**修改__proto__** 或者 **Object.setPrototype**
2. 对象数组遍历劫持数据
3. 对象的方法push unshift splice(第三个参数) 添加的数据进行数据劫持

### data对象代理
+ initData 中使用defineProperty 对vm._data.key 进行代理； 以便使用vm.key调用和修改