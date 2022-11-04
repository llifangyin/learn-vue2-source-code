(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

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
  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*"; //标签名 a h span 

  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")"); //<span:xx> 特殊标签

  var startTagOpen = new RegExp("^<".concat(qnameCapture)); //标签开头的正则，捕获的内容是标签名

  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); //匹配标签结尾的</div>
  // attr='xxx'

  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
  var startTagClose = /^\s*(\/?)>/; //匹配标签结束时的>
  // 解析html
  // 遍历

  function parseHTML(html) {
    // 创建ast对象
    function createAstElement(tag, attrs) {
      return {
        tag: tag,
        //元素
        attrs: attrs,
        //属性
        children: [],
        //子集
        type: 1,
        //dom 1
        parent: null
      };
    } // 开始的标签 添加至root 语法树解构的对象中


    function start(tag, attrs) {
      // console.log(tag,attrs,'开始标签');
      var element = createAstElement(tag, attrs);

      if (!root) {
        root = element;
      }

      createdParent = element;
      stack.push(element);
    } // 文本


    function charts(text) {
      // console.log(text,'文本');
      text = text.replace(/\s*/g, ''); //去空格

      if (text) {
        createdParent.children.push({
          type: 3,
          text: text
        });
      }
    }

    function end(tag) {
      // console.log(tag,'结束标签');
      var element = stack.pop();
      createdParent = stack[stack.length - 1];

      if (createdParent) {
        //元素的闭合
        element.parent = createdParent.tag;
        createdParent.children.push(element);
      }
    }

    var root; //根元素

    var createdParent; //当前元素父节点

    var stack = []; //栈的数据解构 [div,h]
    // 开始标签 文本 结束标签
    // 一层层的剥离html的内容

    while (html) {
      var textEnd = html.indexOf('<'); //有0 无-1

      if (textEnd === 0) {
        // 1开始标签    
        var startTagMatch = parseStartTag(); //开始标签的内容

        if (startTagMatch) {
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        } // 2结束标签


        var endTagMatch = html.match(endTag); // console.log(endTagMatch,'endTagMatch');

        if (endTagMatch) {
          advance(endTagMatch[0].length);
          end(endTagMatch[1]);
          continue;
        }
      }

      var text = void 0; // 文本

      if (textEnd > 0) {
        // 获取文本内容
        // console.log(html);
        text = html.substring(0, textEnd); // console.log(text);
      }

      if (text) {
        advance(text.length);
        charts(text); // console.log(html);
      } // break;

    }

    function parseStartTag() {
      // 匹配开始标签
      var start = html.match(startTagOpen); //1结果 2false
      // console.log(start);

      if (!start) return false; // 创建ast语法树

      var match = {
        tagName: start[1],
        attrs: []
      }; // 删除开始标签

      advance(start[0].length); // 遍历属性,结束标签>

      var attr, end;

      while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
        // console.log(end);
        // console.log(attr);
        match.attrs.push({
          name: attr[1],
          value: attr[3] || attr[4] || attr[5]
        });
        advance(attr[0].length);
      } // console.log(end);


      if (end) {
        advance(end[0].length);
        return match;
      }
    }

    function advance(n) {
      html = html.substring(n); // console.log(html);
    }

    return root;
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = null != arguments[i] ? arguments[i] : {};
      i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }

    return target;
  }

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;

    var _s, _e;

    try {
      for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  //   <div id='app'>hello{{msg}}<h></h></div>
  // render(){ //_c解析标签
  //     return _c('div',{id:app},_v('hello'+_s(msg)),_c('h',''))
  // }
  // 插值表达式
  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;

  function genProps(attrs) {
    var str = '';

    var _loop = function _loop(i) {
      var attr = attrs[i]; // 处理style属性

      var obj = {};

      if (attr.name == 'style') {
        attr.value.split(';').forEach(function (item) {
          var _item$split = item.split(':'),
              _item$split2 = _slicedToArray(_item$split, 2),
              key = _item$split2[0],
              val = _item$split2[1];

          obj[key] = val;
        });
        attr.value = obj;
      }

      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
    };

    for (var i = 0; i < attrs.length; i++) {
      _loop(i);
    }

    return "{".concat(str.slice(0, -1), "}");
  } // 处理子节点


  function genChildren(el) {
    var children = el.children; // console.log(children);

    if (children) {
      return children.map(function (child) {
        return gen(child);
      }).join(',');
    }
  }

  function gen(node) {
    // 元素 _c
    if (node.type === 1) {
      return generate(node);
    } else {
      //文本
      // 1.纯文本 _v
      // 2.插值表达式 _s
      var text = node.text; //获取文本

      if (!defaultTagRE.test(text)) {
        // console.log(text);
        // 普通文本
        return "_v(".concat(JSON.stringify(text), ")");
      } // 特殊文本 带有插值表达式 {{}} 


      var tokens = [];
      var lastindex = defaultTagRE.lastIndex = 0; //正则调用多次的情况lastIndex匹配过后置位0可以再次使用 {{a}} {{b}}

      var match;

      while (match = defaultTagRE.exec(text)) {
        // console.log(match);
        // hello {{msg}} dd
        var index = match.index;

        if (index > lastindex) {
          // 添加内容
          tokens.push(JSON.stringify(text.slice(lastindex, index)));
        }

        tokens.push("_s(".concat(match[1].trim(), ")"));
        lastindex = index + match[0].length;
      }

      if (lastindex < text.length) {
        tokens.push(JSON.stringify(text.slice(lastindex)));
      }

      return "_v(".concat(tokens.join('+'), ")");
    }
  }

  function generate(el) {
    // 处理子节点
    var children = genChildren(el); // console.log(children);
    // 字符串模板

    var code = "_c('".concat(el.tag, "',").concat(el.attrs.length ? "".concat(genProps(el.attrs)) : 'undefined').concat(children ? ",".concat(children) : '', ")"); // console.log(code);
    // _c('div',{id:"app",style:{"color":"cyan","margin":"10px"}},_v("\n        hello "+_s(msg)+" \n        "),_c('h2',undefined,_v("张三")),_v("\n    "))

    return code;
  }

  function compileToFunction(el) {
    // 1.将html变成ast语法树
    var ast = parseHTML(el); // 2.将ast语法树 变成render函数
    // (1) ast语法树变成字符串拼接 (2) 字符串变成render函数 with()

    var code = generate(ast); // _c节点 _v文本 _s变量
    // console.log(code);

    var render = new Function("with(this){return ".concat(code, "}")); // console.log(render);
    // ƒ anonymous(
    //     ) {
    //     with(this){return _c('div',{id:"app",style:{"color":"cyan","margin":"10px"}},_v("\n        hello "+_s(msg)+" \n        "),_c('h2',undefined,_v("张三")),_v("\n    "))}
    //     }
    // with的用法 改变作用域 继而使模板里的变量name 可以直接显示为this.name
    // let obj = {a:1,b:2}
    // with(obj){
    //     console.log(a,b);
    // }

    return render; // 3. 将render函数变成虚拟dom vnode init.js里实现
  }

  var HOOKS = ["beforecreate", "created", "beforeMount", "mounted", "beforeupdate", "updated", "beforeDestroy", "destroyed"]; // 策略模式

  var starts = {};

  starts.data = function (parentVal, childVal) {
    return childVal;
  }; //合并data
  // starts.computed = function(){}
  // starts.watch = function(){}
  // starts.methods = function(){}
  // 遍历声明周期HOOKS


  HOOKS.forEach(function (hooks) {
    starts[hooks] = mergeHooks;
  }); // console.log(starts);

  function mergeHooks(parentVal, childVal) {
    // console.log(parentVal,childVal);
    // {created:[a,b,c],data:[a,b]...}
    if (childVal) {
      if (parentVal) {
        return parentVal.concat(childVal);
      } else {
        return [childVal]; // 
      }
    } else {
      return parentVal;
    }
  }

  function mergeOptions(parent, child) {
    // console.log(parent,child);
    var options = {}; // {created:[a,b,c],data:[a,b]...}

    for (var key in parent) {
      mergeField(key);
    }

    for (var _key in child) {
      mergeField(_key);
    }

    function mergeField(key) {
      //  策略模式
      if (starts[key]) {
        options[key] = starts[key](parent[key], child[key]);
      } else {
        options[key] = child[key];
      }
    } // console.log(options,'options');


    return options;
  }

  function initGlobApi(Vue) {
    // {created:[a,b,c],data:[a,b]...}
    Vue.options = {};

    Vue.Mixin = function (mixin) {
      // 对象的合并
      // console.log(mixin);
      // console.log(Vue.options,this.options);
      this.options = mergeOptions(this.options, mixin);
    };
  }

  // 获取原来的数组方法
  var oldArrayProtoMethods = Array.prototype; // 继承 创建新的方法对象

  var arrMethods = Object.create(oldArrayProtoMethods);
  var methods = ['push', 'pop', "unshift", "shift", "splice"];
  methods.forEach(function (item) {
    arrMethods[item] = function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      // console.log('劫持数组');
      var result = oldArrayProtoMethods[item].apply(this, args); //this当前实例对象，
      //observe中把类整体赋值给了__ob__可供在此调用数据劫持方法obseveArray
      //args :push时为添加的数组参数
      // 追加的数组对象进行数据劫持 push unshift  splice(第三个参数时新增的)

      var inserted;

      switch (item) {
        case 'push':
        case 'unshift':
          inserted = args;
          break;

        case 'splice':
          inserted = args.splice(2); //arr.splice(0,1,{a:6})

          break;
      } // console.log(this,'this');//当前调用的数组对象


      var ob = this.__ob__;

      if (inserted) {
        //对添加的对象进行劫持
        ob.observeArray(inserted);
      } // console.log(inserted,111);


      ob.dep.notify();
      return result;
    };
  });

  var id$1 = 0;

  var Dep = /*#__PURE__*/function () {
    function Dep() {
      _classCallCheck(this, Dep);

      this.id = id$1++;
      this.subs = [];
    } // 收集 watcher


    _createClass(Dep, [{
      key: "depend",
      value: function depend() {
        // console.log(Dep.target);
        // 希望watcher可以存放dep 双向记忆
        // this.subs.push(Dep.target) //转至 watcher里 addDep添加
        Dep.target.addDep(this); // 在watcher中deps添加dep
        // this.deps.push(dep)
        // this.depsId.add(id)
        // ==>
        // dep.addSub(this(watcher)) //dep中subs也添加当前watcher
      }
    }, {
      key: "addSub",
      value: function addSub(watcher) {
        this.subs.push(watcher);
      } // 更新 watcher

    }, {
      key: "notify",
      value: function notify() {
        console.log('notify-subs-arr 执行update', this.subs);
        this.subs.forEach(function (watcher) {
          watcher.update();
        });
      }
    }]);

    return Dep;
  }(); // 添加watcher


  Dep.target = null; // 处理多个watcher 渲染的 和 coputed的

  var stack = [];
  function pushTarget(watcher) {
    Dep.target = watcher; // 入栈

    stack.push(watcher);
  }
  function popTarget() {
    // Dep.target = null
    // 解析一个watcher删除一个watcher
    // console.log(stack,11);
    stack.pop();
    Dep.target = stack[stack.length - 1]; //获取前面的一个watcher
  }

  function observer(data) {
    if (_typeof(data) != 'object' || data == null) {
      return data;
    }

    return new Observer(data);
  }

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);

      // 定义一个属性__ob__ 指向本身实例
      Object.defineProperty(data, '__ob__', {
        enumerable: false,
        value: this //this当前实例 this.observeArray

      });
      this.dep = new Dep(); //给所有的对象类型添加一个dep

      if (Array.isArray(data)) {
        // 对数组的方法进行劫持行操作
        data.__proto__ = arrMethods; // 如果是对象数组，对数组对象劫持

        this.observeArray(data);
      } else {
        this.walk(data);
      }
    } // 遍历对象的属性，响应式劫持


    _createClass(Observer, [{
      key: "walk",
      value: function walk(data) {
        var keys = Object.keys(data);

        for (var i = 0; i < keys.length; i++) {
          var key = keys[i];
          var value = data[key];
          defineReactive(data, key, value);
        }
      } // 遍历对象数组

    }, {
      key: "observeArray",
      value: function observeArray(value) {
        value.forEach(function (data) {
          observer(data);
        });
      }
    }]);

    return Observer;
  }(); // 每一个defineReactive方法，会创建一个私有属性 dep 即Dep的实例


  function defineReactive(data, key, value) {
    var childDep = observer(value); // 给每个属性添加一个dep

    var dep = new Dep(); //私有属性
    // console.log(key,'defineReactive初始化响应式',dep);

    Object.defineProperty(data, key, {
      get: function get() {
        // console.log(childDep,'childDep');
        // console.log(Dep.target,1111);
        if (Dep.target) {
          //注意此处是大写,target是静态私有变量不是实例的属性
          dep.depend(); // 在watcher中deps添加dep
          // this.deps.push(dep)
          // this.depsId.add(id)
          // ==>
          // dep.addSub(this(watcher)) //dep中subs也添加当前watcher
          // console.log('执行 observe 中的getter,获取最新的值',dep,key);

          if (childDep.dep) {
            // 如果有 进行数组收集
            childDep.dep.depend();
          }
        } // console.log(dep,'dep111');
        // console.log('获取pbj');


        return value;
      },
      set: function set(newValue) {
        // console.log('设置obj');
        if (newValue == value) {
          return;
        }

        console.log('observe set 监听name修改');
        observer(newValue);
        value = newValue; // 更新依赖

        dep.notify();
      }
    });
  }

  var callback = [];
  var pending$1 = false;

  function flush() {
    // console.log(222);
    callback.forEach(function (cb) {
      return cb();
    });
    pending$1 = false;
  }

  var timerFunc; // 处理兼容性问题

  if (Promise) {
    timerFunc = function timerFunc() {
      Promise.resolve().then(function () {
        // console.log(1.5);
        flush();
      });
    };
  } else if (MutationObserver) {
    //h5处理异步
    // 监听dom变化，监控完毕再异步更新
    var observe = new MutationObserver(flush); //创建文本

    var textNode = document.createTextNode(1); //观测文本内容

    observe.observe(textNode, {
      characterData: true
    });

    timerFunc = function timerFunc() {
      textNode.textContent = 2;
    };
  } else if (setImmediate) {
    // ie支持
    timerFunc = function timerFunc() {
      setImmediate(flush);
    };
  }

  function nextTick(cb) {
    // console.log(cb,111);
    // 队列 //  1 vue 自己的nexttick 2 用户调用的
    callback.push(cb); // [cb1,cb2]

    if (!pending$1) {
      // vue3 使用promise.then
      // vue2 处理兼容问题
      timerFunc(); //异步执行

      pending$1 = true;
    }
  }

  var id = 0;

  var watcher = /*#__PURE__*/function () {
    function watcher(vm, updateComponent, cb, options) {
      _classCallCheck(this, watcher);

      // callback 标识
      this.vm = vm;
      this.exprOrfn = updateComponent;
      this.cb = cb;
      this.options = options;
      this.id = id++;
      this.user = !!options.user; //!! 保证为布尔值

      this.lazy = options.lazy; // 如果为true,是computed属性

      this.dirty = this.lazy; // 取值时，表示用户是否执行

      this.deps = []; //watcher存放dep 

      this.depsId = new Set(); // 存放不重复的dep id
      // 判断

      if (typeof updateComponent === 'function') {
        //初始化$moutned会执行一次渲染：
        // initMixin => _init => $mounted => (lifecyle)mountComponent => new Watcher
        this.getters = updateComponent; //更新视图
      } else {
        //watch监听的属性名 key
        // 字符串变成函数
        this.getters = function (_vm) {
          // console.log('$watch的watcher.get方法$,取当前watcher的值赋给watcher.value');
          // console.log('取值过程中，调用的vm.值，触发observe的getter事件，把当前的watch watcher收集到各个属性的dep中');
          // console.log('当set一个值时，会触发当前watch watcher的方法，判断user =true 执行回调函数cb,实现监听');
          // a.b.c 深层监听
          // console.log(_vm,111);
          var path = _vm.exprOrfn.split('.');

          var obj = vm;

          for (var i = 0; i < path.length; i++) {
            obj = obj[path[i]];
          }

          return obj; //vm.a.b.c
        };
      } // console.log('=== watcher-init',this);
      // 初始化 dom挂载mountComponent中会执行一次
      // 初次渲染  保存初始值 (computed模式初始不加载)


      this.value = this.lazy ? void 0 : this.get(); //保存watcher初始值
    }

    _createClass(watcher, [{
      key: "addDep",
      value: function addDep(dep) {
        // 去重
        var id = dep.id; //depsId set解构使用has方法判断是否存在

        if (!this.depsId.has(id)) {
          this.deps.push(dep);
          this.depsId.add(id); //set解构 用add方法添加

          dep.addSub(this);
        }
      }
    }, {
      key: "get",
      value: function get() {
        // console.log('$render&&computed$-watcher.get 方法执行');
        // 初始化 dom挂载mountComponent中会执行一次
        pushTarget(this); // 给Dep添加watcher => Dep.target = watcher 
        // console.log(this.getters,222);
        // console.log('Dep.target的值',Dep.target);
        // console.log('执行render方法或computed方法');

        var value = this.getters.call(this.vm, this); // console.log('render 完毕 pop Dep.target');
        // 情况1 => 初始化渲染页面
        //渲染页面 vm._update(vm._render) _s(msg) 拿到with函数vm.msg
        // 渲染过程中会调用一次observe中的getter,执行  该初始化渲染的watcher的deps push了new的dep
        //  new的dep的subs push了 这个初次渲染的watcher实例
        // 情况2 => computed的watcher，初始化watcher,lazy=true不调用get,第一次取computed值时，执行watcher.evaluate方法
        //  => 从而执行watcher.get方法，执行该方法时：先执行pushTarget方法，给Dep.target添加computed的watcher,然后
        // 调用计算方法，当取vm.变量值时=>（触发observe中的get方法，发现有Dep.target(computed的wather),defineReactive私有变量的
        // dep和计算computed的watcher互相收集依赖，当触发变量的set时,触发dep.notify遍历deps执行watcher.update,计算watcher也得到更新)
        // update方法执行queueWatcher => flushWatcher => 遍历watcher.run  => watcher.get,
        // computed的watcher= lazy为true不执行queueWatcher方法,dirity赋值为true;
        // 执行渲染watcher,执行get方法,Dep.target值取渲染watcher,然后取vm.遍历:(1).普通变量，取observe.getter方法,新的渲染watcher和dep互相收集
        //      (2). computed变量，取值触发 computed中的createComputedGetter,
        // dirty为true 执行计算方法evaluate,执行计算watcher的get中的computed计算函数，得到最新值；
        // 执行computed的watcher.depend(),执行：deps[i].depend() => Dep.target.addDep(this) 
        //      => watcher.addDep => dep.addSub => dep中this.subs.push(watcher),互相收集;

        popTarget(); //取消watcher  Dep.target = stack[stack.length-1] //默认情况length-1 结果为null
        // console.log(Dep.target);

        return value; //初始值
      } // 更新数据

    }, {
      key: "update",
      value: function update() {
        // 不要数据更新后每次调用
        // 缓存
        // this.get()
        //lazy为ture 为computed
        if (this.lazy) {
          this.dirty = true;
        } else {
          queueWatcher(this);
        }
      }
    }, {
      key: "run",
      value: function run() {
        // 更新取值 old new
        var value = this.get();
        var oldValue = this.value;
        this.value = oldValue;

        if (this.user) {
          // 执行handler 用户的watcher的cb
          this.cb.call(this.vm, value, oldValue);
        }
      } // computed 执行计算方法

    }, {
      key: "evaluate",
      value: function evaluate() {
        this.value = this.get();
        this.dirty = false;
      } // 相互收集

    }, {
      key: "depend",
      value: function depend() {
        // 收集渲染watcher,存放到dep中，dep再会存放watcher
        // 最终可以通过watcher找到所有的dep,让所有的dep都记住渲染的watcher
        var i = this.deps.length;

        while (i--) {
          this.deps[i].depend();
        }
      }
    }]);

    return watcher;
  }();

  var queue = []; //将需要批量更新的watcher 存放队列中

  var has = {};
  var pending = false; // 队列处理

  function flushWatcher() {
    // console.log(queue,'queue-真正执行update队列');
    queue.forEach(function (watcher) {
      watcher.run(); //防抖执行回调更新函数
      // watcher.cb() // updated 声明周期函数 简易执行回调
    });
    queue = [];
    has = {};
    pending = true;
  }

  function queueWatcher(watcher) {
    var id = watcher.id; // 没一个组件都是同一个watcher
    // console.log(666); //3次

    if (has[id] == null) {
      //去重
      queue.push(watcher);
      has[id] = true; //防抖: 触发多次 只执行一次

      if (!pending) {
        //异步 等待同步代码执行完毕 执行
        // setTimeout(() => {
        // }, 0);
        // nextTick 相当于定时器，
        nextTick(flushWatcher);
        pending = true;
      }
    }
  }
  // 收集依赖
  // vue  dep watcher data:{name,msg}
  // dep  : dep和data中的属性一一对应
  // watcher : 在视图上用几个,就有几个watcher
  // 一. 基本类型的关系
  // dep 与 watcher的关系:  一对多 dep.name = [w1,w2,w3...]
  //二. 实现对象的收集依赖
  // dep 和watcher的关系 多对多 computed 
  // 三 数组更新
  // 1. 给所有的对象增加一个dep []
  // 2. 获取数组的值,会调用get方法,希望让当前的数组记住这个渲染的watcher
  //   (1) 需要获取当前dep
  //   (2) 当前面对数组取值的时候,就让数组的dep记住这个watcher
  // 3. 我们更新数组的时候,调用push,等等方法时,找到我们这个watcher

  function initState(vm) {
    var ops = vm.$options;

    if (ops.props) ;

    if (ops.data) {
      initData(vm); // √
    } // 先初始化data,再初始化watch


    if (ops.watch) {
      initWatch(vm); //√
    }

    if (ops.methods) ;

    if (ops.computed) {
      initComputed(vm); //√
    }
  }
  /* initData------------------------------------------------------- */
  // 初始化data

  function initData(vm) {
    var data = vm.$options.data; // data()  this默认window 

    data = vm._data = typeof data == 'function' ? data.call(vm) : data; //将对象上的所有属性，代理到实例上{a:1,b:@}  defineProperty

    for (var key in data) {
      Proxy(vm, '_data', key);
    }

    observer(data);
  }

  function Proxy(vm, source, key) {
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[source][key];
      },
      set: function set(val) {
        vm[source][key] = val;
      }
    });
  }
  /* initWatch------------------------------------------------------- */
  // 一. watch4种使用方式
  // 1. 属性方法
  // 2. 属性数组
  // 3.属性：对象
  // 4.属性：字符串
  // watch:{
  //     'a'(newVal,oldVal)=>{
  //         console.log(newVal);
  //     },
  //     'b':[
  // (newVal,oldVal)=>{
  //     console.log(newVal);
  // },
  //         (newVal,oldVal)=>{
  //             console.log(newVal);
  //         }
  //     ],
  // c:{
  // handler(){
  //     console.log('xxx');
  // }
  // },
  // d:'aa'
  // },
  // methods: {
  //     aa(){console.log('ccc')}
  // },
  // 二.vue中的watch格式化
  // 三 watch的最终实现方式, watch
  // 通过高阶函数，
  // 四  面试： watch和computed的区别
  // computed具有缓存机制，通过dirty变量是实现
  // watch 回调函数
  // 问题：视图中 变量没更新dom
  // 因为这里有多个watcher,渲染watcher  和 computed watcher


  function initWatch(vm) {
    // 1.获取watch
    var watch = vm.$options.watch; // console.log('watch:',watch);
    // 2. 遍历

    var _loop = function _loop(key) {
      var handler = watch[key]; // 数组,对象,字符,函数

      if (Array.isArray(handler)) {
        // 处理数组形式
        handler.forEach(function (item) {
          createWatcher(vm, key, item);
        });
      } else {
        //对象 字符 函数
        // 创建一个方法来处理
        createWatcher(vm, key, handler);
      }
    };

    for (var key in watch) {
      _loop(key);
    }
  } // vm.$watch(()=>{return 'a'})//返回的是watcher的属性


  function createWatcher(vm, exprOrfn, handler, options) {
    // 处理handler
    if (_typeof(handler) == 'object') {
      // d:{
      //     handler(val){
      //         console.log('d',val);
      //     }
      // }
      options = handler; //用户的配置项 

      handler = handler.handler;
    }

    if (typeof handler == 'string') {
      // e:'fun1'
      handler = vm[handler]; //将实例上的methods的fun1作为handler
    } // 其他是函数
    // watch最终处理 $watch这个方法


    return vm.$watch(vm, exprOrfn, handler, options);
  }
  /* initComputed------------------------------------------------------- */


  function initComputed(vm) {
    var computed = vm.$options.computed; // 1.通过watcher实现

    var watcher$1 = vm._computedWatcher = {}; // 2.将computed属性通过defineProperty进行处理

    for (var key in computed) {
      var userDef = computed[key]; // 获取get

      var getters = typeof userDef == 'function' ? userDef : userDef.get; // 给每一个computed属性添加一个watcher getters为computed函数或对象的get函数

      watcher$1[key] = new watcher(vm, getters, function () {}, {
        lazy: true
      }); // defineReactive
      //lazy不调用时不计算 

      defineComputed(vm, key, userDef);
    } // console.log(vm);

  }

  var sharePropDefinition = {}; // 响应式处理computed的值

  function defineComputed(target, key, userDef) {
    sharePropDefinition = {
      enumable: true,
      configurable: true,
      get: function get() {},
      set: function set() {}
    };

    if (typeof userDef == 'function') {
      // sharePropDefinition.get  = userDef
      sharePropDefinition.get = createComputedGetter(key);
    } else {
      // 对象
      // sharePropDefinition.get = userDef.get
      sharePropDefinition.get = createComputedGetter(key);
      sharePropDefinition.set = userDef.set;
    } //  代理 target:vue  key computed的属性


    Object.defineProperty(target, key, sharePropDefinition);
  } // 高阶函数,缓存机制


  function createComputedGetter(key) {
    //返回用户的computed方法
    // return 函数里的 this指向被调用对象的this => vm
    // 不这样写this为函数本身,调用的时候才会走return里的内容
    // 该方法执行了
    //1.响应式处理key的getter() => 对应watcher的value
    // （1） 如果第一次取值dirty为true则执行watcher的evaluate方法计算computed的函数，并赋值给watcher.value缓存
    // （2） 满足条件Dep.target有值;收集computed属性的watcehr依赖;执行顺序为; 
    //  watcher.depend() =>
    //  deps[i].depend() => Dep.target.addDep(this) => watcher.addDep => 
    //  dep.addSub => dep中this.subs.push(watcher)
    // （3）Dep中使用stack=[]接收watcher,Dep.target赋值最后一个,如果有computed则Dep需要收集两个;
    // (4) watcher.update更新数据时=>ueueWatcher=>queue.push(watcher)=>flushWatcher=>遍历queue中的watcher.run()
    // 2. 当set对应data值时,会触发dep.notify方法执行watcher.update() => watcher.run()从而执行计算和刷新watcher
    return function () {
      // dirty 为true执行用户方法
      var watcher = this._computedWatcher[key];
      console.log('$lazy$-调用computed lazy watcher的getter');

      if (watcher) {
        if (watcher.dirty) {
          //dirty true第一次取值，计算get;false读取缓存 watcher.value
          // 执行方法,求值 重新定义一个方法
          console.log('$lazy$ dirty = true 初始化计算computed方法');
          watcher.evaluate(); //运行用户的computed方法 触发observe的get会进行依赖收集
        } // 判断是否有渲染wathcer，如果有执行 ：相互存放watcher


        if (Dep.target) {
          // 比如 fullName 由 firstName和lastName组成 
          // 渲染watcher取fullName时，开始取fisrtNmae和lastName,也就是渲染watcher调用computed watcher
          // 这两个属性的dep收集当前的computed watcher ,这个计算watcher收集这两个属性的dep
          console.log('computed-watcher互相收集', Dep.target); // 说明 还有渲染watcher,收集起来

          watcher.depend(); //计算watcher收集渲染watcher
        } // 重复使用，不重新计算


        return watcher.value;
      }
    };
  }
  /* initComputed------------------------------------------------------- */

  /* stateMixin------------------------------------------------------- */


  function stateMixin(vm) {
    // 队列  vue自己的nexttick
    //  1 vue 自己的nexttick 2 用户调用的
    vm.prototype.$nextTick = function (cb) {
      // 数据更新之后获取到最新的dom
      // console.log(cb);
      nextTick(cb);
    }; // watch监听属性的实现


    vm.prototype.$watch = function (vm, exprOrfn, handler) {
      var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
      // 实现watcher的方法就是new  watcher
      // exprOrfn 表达式或方法  user:用户的属性,watcher中监测到watch变化执行回调标识
      new watcher(vm, exprOrfn, handler, _objectSpread2(_objectSpread2({}, options), {}, {
        user: true
      })); // immediate立即执行

      if (options.immediate) {
        handler.call(vm);
      }
    };
  }
  /* stateMixin------------------------------------------------------- */

  // 将虚拟dom变成真实dom
  function patch(oldVnode, vnode) {
    // console.log(oldVnode,vnode);
    // 第一次渲染 oldnode 是一个真实dom
    // console.log(oldVnode.nodeType);
    if (oldVnode.nodeType == 1) {
      // 1 创建真实的dom
      // console.log(oldVnode,vnode);
      var el = createEl(vnode); // console.log(el);
      // 2 替换 （1）获取父节点 （2） 插入当前节点 （3）老元素删除

      var parentEl = oldVnode.parentNode; // console.log(parentEl);

      parentEl.insertBefore(el, oldVnode.nextsibling);
      parentEl.removeChild(oldVnode);
      return el;
    } else {
      // 第二次渲染，oldVnode是虚拟dom,进行比对，进行最小量更新

      /*  diff算法,最小量更新 */
      // 1.元素不一样 整体替换
      if (oldVnode.tag !== vnode.tag) {
        oldVnode.el.parentNode.replaceChild(createEl(vnode, oldVnode.el));
      } // 2. 标签一样，text属性


      if (!oldVnode.tag) {
        // 没有tag是文本
        if (oldVnode.text !== vnode.text) {
          return oldVnode.el.textContent = vnode.text;
        }
      } // 2.1 属性不同(标签一样) <div id="a"> => <div id="b">
      // 方法 1直接复制


      var _el = vnode.el = oldVnode.el;

      updateProps(vnode, oldVnode.data); //3. 子元素diff 子元素:

      var oldChildren = oldVnode.children || [];
      var newChildren = vnode.children || [];

      if (oldChildren.length && newChildren.length) {
        updateChild(oldChildren, newChildren, _el);
      } else if (oldChildren.length) {
        _el.innerHtml = '';
      } else if (newChildren.length) {
        for (var i = 0; i < newChildren.length; i++) {
          var child = newChildren[i]; // 添加真实dom

          _el.appendChild(createEl(child));
        }
      }
    }
  }

  function updateChild(oldChildren, newChildren, parent) {
    // vue diff算法
    // dom中操作元素：头部添加，尾部添加，倒序和正序的的方式
    //  vue2 采用双指针的方法
    // 1. 创建双指针
    // console.log(oldChildren,newChildren);
    var oldStartIndex = 0; //old开头索引

    var oldStartVnode = oldChildren[oldStartIndex]; //old开始元素

    var oldEndIndex = oldChildren.length - 1;
    var oldEndVnode = oldChildren[oldEndIndex];
    var newStartIndex = 0; //old开头索引

    var newStartVnode = newChildren[newStartIndex]; //old开始元素

    var newEndIndex = newChildren.length - 1;
    var newEndVnode = newChildren[newEndIndex];

    function isSameVnode(oldContext, newContext) {
      return oldContext.tag === newContext.tag && oldContext.key == newContext.key;
    } // 创建旧元素映射表


    function makeIndexByKey(child) {
      var map = {};
      child.forEach(function (item, index) {
        if (item.key) {
          map[item.key] = index;
        }
      });
      return map;
    }

    var map = makeIndexByKey(oldChildren);
    console.log(map); // 2. 遍历

    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
      //？？
      // 比对 开头元素
      if (isSameVnode(oldStartVnode, newStartVnode)) {
        // 从前往后比对
        console.log('con');
        patch(oldStartVnode, newStartVnode); // 移动指针

        oldStartVnode = oldChildren[++oldStartIndex];
        newStartVnode = newChildren[++newStartIndex];
      } else if (isSameVnode(oldEndVnode, newEndVnode)) {
        // 从后往前比对
        patch(oldEndVnode, newEndVnode); // 移动指针

        oldEndVnode = oldChildren[--oldEndIndex];
        newEndVnode = newChildren[--newEndIndex];
      } else if (isSameVnode(oldStartVnode, newEndVnode)) {
        // 交叉比对 old头与start尾
        patch(oldStartVnode, newEndVnode);
        oldStartVnode = oldChildren[++oldStartIndex];
        newEndVnode = newChildren[--newEndIndex];
      } else if (isSameVnode(oldEndVnode, newStartVnode)) {
        // 交叉对比  old尾与start头
        patch(oldEndVnode, newStartVnode);
        oldEndVnode = oldChildren[--oldEndIndex];
        newStartVnode = newChildren[++newStartIndex];
      } else {
        // 暴力比对:子集没有任何关系(遍历对比)
        // 1. 创建旧元素映射表   //{a:0,b:1,c:2}
        var moveIndex = map[newStartVnode.key]; // 2. 从旧映射表中寻找元素

        if (moveIndex == undefined) {
          // 没有找到元素，添加到最前面
          // p:已有的虚拟dom的el属性是创建对应的真实dom
          parent.insertBefore(createEl(newStartVnode), oldStartVnode.el);
        } else {
          //有
          //  获取到要插入的的元素
          var moveVnode = oldChildren[moveIndex];
          oldChildren[moveIndex] = null; //防止数组塌陷
          //？？为什么插入到oldStartVnode.el之前

          parent.insertBefore(createEl(moveVnode), oldStartVnode.el); // 可能问题，可能插入的元素有子元素

          patch(moveVnode, newStartVnode); // newEndVnode???
        } // 新元素指针位移，继续循环


        newStartVnode = newChildren[++newStartIndex];
      } // key的作用: vnode更新，找到已有key值的vnode的话会复制该节点，而不是创建节点，性能提升

    } // while遍历完成后 index最后比对的那一个 
    // 添加多余的子元素/ old3 new4


    if (newStartIndex <= newEndIndex) {
      for (var i = newStartIndex; i <= newEndIndex; i++) {
        parent.appendChild(createEl(newChildren[i]));
      }
    } // 将多余元素去掉


    if (oldStartIndex <= oldEndIndex) {
      for (var _i = oldStartIndex; _i <= oldEndIndex; _i++) {
        var child = oldChildren[_i];

        if (child != null) {
          parent.removeChild(child.el); //删除元素
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

  } // 添加属性


  function updateProps(vnode) {
    var oldProps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    //第一次属性
    var newProps = vnode.data || {}; //获取当前新节点属性 

    var el = vnode.el; //获取当前节点
    // 1. 属性处理：old 有属性 新的没属性

    for (var key in oldProps) {
      if (!newProps[key]) {
        // 删除当前节点的属性
        el.removeAttribute(key);
      }
    } // 2. 老vnode样式处理：老的style,样式处理 


    var newStyle = newProps.style || {}; //新样式

    var oldStyle = oldProps.style || {};

    for (var _key in oldStyle) {
      if (!newStyle[_key]) {
        el.style = '';
      }
    } // 3.新vnode: 样式处理


    for (var _key2 in newProps) {
      if (_key2 === 'style') {
        for (var styleName in newProps.style) {
          el.style[styleName] = newProps.style[styleName];
        }
      } else if (_key2 == 'class') {
        el.className = newProps.className;
      } else {
        el.setAttribute(_key2, newProps[_key2]);
      }
    }
  } // 创建真实dom


  function createEl(vnode) {
    var tag = vnode.tag;
        vnode.data;
        vnode.key;
        var children = vnode.children,
        text = vnode.text;

    if (typeof tag === 'string') {
      // 标签
      vnode.el = document.createElement(tag);
      updateProps(vnode);

      if (children.length) {
        children.forEach(function (child) {
          vnode.el.appendChild(createEl(child));
        });
      } // for(let k in data){
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

    } else {
      vnode.el = document.createTextNode(text);
    }

    return vnode.el;
  } // vue的渲染流程
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

  function mountComponent(vm, el) {
    callHook(vm, 'beforeMounted'); // 更新组件的方法
    // 1.vm._render将render函数变成虚拟dom
    // 2. vm._update 将vnode变成真实dom 
    // 实现自动更新

    var updateComponent = function updateComponent() {
      // console.log(vm._render());
      vm._update(vm._render());
    }; // 更新数据
    // constructor(vm,updateComponent,cb,options){
    // 该实例最终会被收集到dep中
    // console.log('new render watcher');


    new watcher(vm, updateComponent, function () {
      callHook(vm, 'updated'); //订阅
    }, true);
    callHook(vm, 'mounted');
  }
  function lifecycleMixin(Vue) {
    Vue.prototype._update = function (vnode) {
      var vm = this; // 需要区分首次渲染，还是更新

      var prevVnode = vm._vnode; //首次渲染，_vnode为null

      if (!prevVnode) {
        vm.$el = patch(vm.$el, vnode); //旧dom，虚拟dom

        vm._vnode = vnode;
      } else {
        // console.log('render函数渲染dom');
        patch(vm.$el, vnode);
      }
    };
  } // 生命周期调用

  function callHook(vm, hook) {
    // console.log(vm);
    var handlers = vm.$options[hook]; // [fn a,fn b,fn]

    if (handlers) {
      for (var i = 0; i < handlers.length; i++) {
        handlers[i].call(this);
      }
    }
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      var vm = this;
      vm.$options = mergeOptions(Vue.options, options);
      callHook(vm, 'beforecreated'); // init 状态

      initState(vm);
      callHook(vm, 'created'); //渲染模板 el

      if (vm.$options.el) {
        vm.$mounted(vm.$options.el);
      }
    }; // 创建$mounted


    Vue.prototype.$mounted = function (el) {
      // console.log(el);
      // el template render
      var vm = this;
      var options = vm.$options;
      el = document.querySelector(el);
      vm.$el = el; // 真实dom
      // 没有render函数

      if (!options.render) {
        var template = options.template; // 没有template option 
        // 则 Compile el's outerHTML as template *

        if (!template && el) {
          // 获取Html
          el = el.outerHTML; //html字符串
          // <div id="app">hello {{msg}} </div>
          // 变成ast语法树 ,将ast语法树变成render函数

          var render = compileToFunction(el); // console.log(render);
          // (1) 将render函数变成vnode

          options.render = render; // (2) 将vnode变成真实DOM放到页面中
        } // 挂载组件
        // 1.vm._render将render函数变成虚拟dom
        // 2. vm._update 将vnode变成真实dom
        // console.log(vm,el);


        mountComponent(vm);
      }
    };
  }

  function renderMixin(Vue) {
    // 节点 创建标签
    Vue.prototype._c = function () {
      return createElement.apply(void 0, arguments);
    }; // 文本


    Vue.prototype._v = function (text) {
      return createText(text);
    }; // 变量 _s(msg)


    Vue.prototype._s = function (val) {
      return val == null ? "" : typeof val == "Object" ? JSON.stringify(val) : val;
    };

    Vue.prototype._render = function () {
      var vm = this;
      var render = vm.$options.render; //init.js 中定义options的render属性为render函数

      var vnode = render.call(this);
      return vnode;
    };
  } // 创建元素

  function createElement(tag) {
    var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    for (var _len = arguments.length, children = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      children[_key - 2] = arguments[_key];
    }

    return vnode(tag, data, data.key, children);
  } // 创建文本


  function createText(text) {
    return vnode(undefined, undefined, undefined, undefined, text);
  } // 创建虚拟dom


  function vnode(tag, data, key, children, text) {
    return {
      tag: tag,
      data: data,
      key: key,
      children: children,
      text: text
    };
  }

  function Vue(options) {
    this._init(options);
  } // 给vue.prototype添加_init(initState(),$mounted)方法 ,$mounted方法 把挂载el内的html转为render字符串，转为虚拟dom，渲染成真实dom
  // initState方法在initState中定义执行initProps,initData,initWatch,initMethods,initComputed等初始化函数


  initMixin(Vue);
  lifecycleMixin(Vue); //给vue.prototype添加_update方法 创建虚拟dom

  renderMixin(Vue); //给Vue.prototype添加_c,_v,_s,render函数用来创建虚拟dom

  stateMixin(Vue); // 给Vue.prototype添加$nextTick  $watch方法 
  // 全局方法 Vuemixin vue.component extend...

  initGlobApi(Vue); //Mixin (mergeOptions)

  return Vue;

}));
//# sourceMappingURL=vue.js.map
