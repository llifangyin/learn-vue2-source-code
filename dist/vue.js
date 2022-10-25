(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

    var HOOKS = ["beforecreate", "created", "beforeMount", "mounted", "beforeupdate", "updated", "beforeDestroy", "destroyed"]; // 策略模式

    var starts = {};

    starts.data = function (parentVal, childVal) {
      return childVal;
    }; //合并data


    starts.computed = function () {};

    starts.watch = function () {};

    starts.methods = function () {}; // 遍历声明周期HOOKS


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

    // 获取原来的数组方法
    var oldArrayProtoMethods = Array.prototype; // 继承 创建新的方法对象

    var arrMethods = Object.create(oldArrayProtoMethods);
    var methods = ['push', 'pop', "unshift", "shift", "splice"];
    methods.forEach(function (item) {
      arrMethods[item] = function () {
        console.log('劫持数组');

        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

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
        }

        console.log(inserted, 111);
        return result;
      };
    });

    function observer(data) {
      if (_typeof(data) != 'object' || data == null) {
        return data;
      }

      return new Observer(data);
    }

    var Observer = /*#__PURE__*/function () {
      function Observer(data) {
        _classCallCheck(this, Observer);

        // 定义一个属性
        Object.defineProperty(data, '__ob__', {
          enumerable: false,
          value: this //this当前实例 this.observeArray

        });

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
    }();

    function defineReactive(data, key, value) {
      observer(value);
      Object.defineProperty(data, key, {
        get: function get() {
          // console.log('获取pbj');
          return value;
        },
        set: function set(newValue) {
          // console.log('设置obj');
          if (newValue == value) {
            return;
          }

          observer(newValue);
          value = newValue;
        }
      });
    }

    function initState(vm) {
      var ops = vm.$options;

      if (ops.props) ;

      if (ops.data) {
        initData(vm);
      }

      if (ops.watch) ;

      if (ops.methods) ;

      if (ops.computed) ;
    } // 初始化data

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
    }

    var root; //根元素

    var createdParent; //当前元素父节点

    var stack = []; //栈的数据解构 [div,h]
    // 开始的标签 添加至root 语法树解构的对象中

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
      text = text.replace(/a/g, ''); //去空格

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
    } // 解析html
    // 遍历


    function parseHTML(html) {
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
        } // console.log({tokens});


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
      // with的用法 改变作用域
      // let obj = {a:1,b:2}
      // with(obj){
      //     console.log(a,b);
      // }

      return render; // 3. 将render函数变成虚拟dom vnode init.js里实现
    }

    // 将虚拟dom变成真实dom
    function patch(oldVnode, vnode) {
      // 1 创建真实的dom
      // console.log(oldVnode,vnode);
      var el = createEl(vnode); // console.log(el);
      // 2 替换 （1）获取父节点 （2） 插入当前节点 （3）老元素删除

      var parentEl = oldVnode.parentNode; // console.log(parentEl);

      parentEl.insertBefore(el, oldVnode.nextsibling);
      parentEl.removeChild(oldVnode);
      return el;
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

    function mountComponent(vm, el) {
      callHook(vm, 'beforeMounted'); // 更新组件的方法
      // 1.vm._render将render函数变成虚拟dom
      // 2. vm._update 将vnode变成真实dom 

      vm._update(vm._render());

      callHook(vm, 'mounted');
    }
    function lifecycleMixin(Vue) {
      Vue.prototype._update = function (vnode) {
        var vm = this;
        vm.$el = patch(vm.$el, vnode); //旧dom，虚拟dom
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
          } // 挂在组件
          // 1.vm._render将render函数变成虚拟dom
          // 2. vm._update 将vnode变成真实dom


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
    }

    initMixin(Vue); // 添加数据初始化

    lifecycleMixin(Vue); //添加声明周期

    renderMixin(Vue); //render函数 创建虚拟dom
    // 全局方法 Vuemixin vue.component extend...

    initGlobApi(Vue);

    return Vue;

}));
//# sourceMappingURL=vue.js.map
