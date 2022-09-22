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

  var oldArrayProtoMethods = Array.prototype;
  var arrMethods = Object.create(oldArrayProtoMethods);
  var methods = ['push', 'pop', "unshift", "shift", "splice"];
  methods.forEach(function (item) {
    arrMethods[item] = function () {
      console.log('劫持数组');

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var result = oldArrayProtoMethods[item].apply(this, args);
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

      if (Array.isArray(data)) {
        data.__proto__ = arrMethods;
      } else {
        this.walk(data);
      }
    }

    _createClass(Observer, [{
      key: "walk",
      value: function walk(data) {
        var keys = Object.keys(data);

        for (var i = 0; i < keys.length; i++) {
          var key = keys[i];
          var value = data[key];
          defineReactive(data, key, value);
        }
      }
    }]);

    return Observer;
  }();

  function defineReactive(data, key, value) {
    observer(value);
    Object.defineProperty(data, key, {
      get: function get() {
        console.log('获取pbj');
        return value;
      },
      set: function set(newValue) {
        console.log('设置obj');

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

    data = vm._data = typeof data == 'function' ? data.call(vm) : data;
    observer(data);
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      var vm = this;
      vm.$options = options; // init 状态

      initState(vm);
    };
  }

  function Vue(options) {
    this._init(options);
  }

  initMixin(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
