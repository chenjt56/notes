// 1. 数据验证的一种方式
let validtor = {
  set(obj, prop, value) {
    if (prop === 'age') {
      if (!Number.isInteger(value)) {
        throw new TypeError('The age is not integer');
      }
      if (value > 200 || value < 0) {
        throw new RangeError('The age seems invalid');
      }
      // 满足条件的直接保存
      obj[prop] = value;
    } else {
      obj[prop] = value;
    }
  }
}
let person = new Proxy({}, validtor);
person.age = 100;
// person.age = 'young';   TypeError: The age is not integers
// person.age = 300;       RangeError: The age seems invalid
console.log(person.age);
// 利用set方法，还可以数据绑定，即每当对象发生变化时，会自动更新 DOM。


// 2.  保护对象的内部属性
function invariant(key, action) {
  if(key.startsWith('_')) {
    throw new Error(`Invalid attempt to ${action} private "${key}" property`);
  }
}
const handler = {
  get(target, prop) {
    invariant(prop, 'get');
    return target[prop];
  },
  set(target, prop, value) {
    invariant(prop, 'set');
    target[prop] = value;
    return true
  }
}
const target = {};
const proxy = new Proxy(target, handler);
// proxy._prop;         Invalid attempt to get private "_prop" property
// proxy._prop = 'c';   Invalid attempt to set private "_prop" property
