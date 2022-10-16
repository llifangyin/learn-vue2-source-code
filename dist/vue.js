(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

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
    // 空格
    text = text.replace(/s/g, '');

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

  function compileToFunction(el) {
    var ast = parseHTML(el);
    console.log(ast, 'ast');
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      var vm = this;
      vm.$options = options; // init 状态

      initState(vm); //渲染模板 el

      if (vm.$options.el) {
        vm.$mounted(vm.$options.el);
      }
    }; // 创建$moutned


    Vue.prototype.$mounted = function (el) {
      // console.log(el);
      // el template render
      var vm = this;
      var options = vm.$options;
      el = document.querySelector(el); // 没有render函数

      if (!options.render) {
        var template = options.template; // 没有template option 
        // 则 Compile el's outerHTML as template *

        if (!template && el) {
          // 获取Html
          el = el.outerHTML; //html字符串
          // <div id="app">hello {{msg}} </div>
          // 变成ast语法树

          compileToFunction(el); // render
          // vnode
          // console.log(el);
        }
      }
    };
  }

  function Vue(options) {
    this._init(options);
  }

  initMixin(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
