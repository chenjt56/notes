let proxy = new Proxy({}, {
  get: function (_target, propKey, _receiver) {
    console.log(`getting ${propKey}!`);
    return Reflect.get(_target, propKey, _receiver);
  },
  set: function (_target, propKey, _receiver) {
    console.log(`setting ${propKey}!`);
    return Reflect.set(_target, propKey, _receiver);
  }
});
proxy.count = 1;
++proxy.count;


let obj = new Proxy({}, {
  get: function (_traget, propKey, _receiver) {
    return 35;
  }
});
console.log(obj.time);
console.log(obj.name);

let target = {};
let handler = {};
let proxy1 = new Proxy(target, handler);
proxy1.b = 'a';
console.log(proxy1);
console.log(target.b);

// 使用技巧: 将 Proxy 对象，设置到 object.proxy 属性上，从而可以在 object 对象上访问
let object = {
  proxy: new Proxy(target, handler)
}
console.log(object);


// 利用 Proxy，可以将读取属性的操作（get），转变为执行某个函数，从而实现属性的链式操作。
let pipe = function (value) {
  let fnStack = [];
  let oproxy = new Proxy({}, {
    get(pipeObj, fnName) {
      console.log(fnName)
      if (fnName === 'get') {
        return fnStack.reduce((val, fn) => {
          return fn(val);
        }, value);
      }
      fnStack.push(window[fnName]);
      return oproxy;
    }
  });
  return oproxy;
}
//  只有使用 var 声明的变量才会变成 window 的属性
var double = n => n * 2;
var pow = n => n * n;
var reverseInt = n => n.toString().split("").reverse().join("") | 0;

pipe(3).double.pow.reverseInt.get;


// 利用 get 拦截，实现生成各种 DOM 节点的通用函数
const dom = new Proxy({}, {
  get(target, property) {
    return function (attrs = {}, ...children) {
      // console.log(children);
      const el = document.createElement(property);
      for (let prop of Object.keys(attrs)) {
        el.setAttribute(prop, attrs[prop]);
      }
      for (let child of children) {
        if (typeof child === 'string') {
          child = document.createTextNode(child);
        }
        el.appendChild(child);
      }
      return el;
    }
  }
});
const el = dom.div({},
  'Hello, my name is ',
  dom.a({
    herf: '//example.com'
  }, 'Mark'),
  '. I like: ',
  dom.ul({},
    dom.li({}, 'The Web'),
    dom.li({}, 'Food'),
    dom.li({}, '…actually that\'s it')
  )
);
document.body.appendChild(el);

const target1 = Object.defineProperties({}, {
  foo: {
    value: 123,
    configurable: false,
    writable: false
  }
});

const handler1 = {
  get(_target, _propKey) {
    return 'abc';
  }
}
const proxy = new Proxy(target1, handler1);
// proxy.foo;
// Uncaught TypeError: 'get' on proxy: property 'foo' is a read-only and non-configurable data 
// property on the proxy target but the proxy did not return its actual value (expected '123' but got 'abc')