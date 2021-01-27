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
let person1 = new Proxy({}, validtor);
person1.age = 100;
// person.age = 'young';   TypeError: The age is not integers
// person.age = 300;       RangeError: The age seems invalid
console.log(person1.age);
// 利用set方法，还可以数据绑定，即每当对象发生变化时，会自动更新 DOM。


// 2.  保护对象的内部属性
function invariant(key, action) {
  if (key.startsWith('_')) {
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


// 3. 使用 Proxy 实现观察者模式
// 观察者模式（Observer mode）指的是函数自动观察数据对象，一旦对象有变化，函数就会自动执行。
const queueObservers = new Set();

const observe = fn => queueObservers.add(fn); // 观察者函数
const observable = obj => new Proxy(obj, {
  set
}); // 观察目标

function set(target, key, value, receiver) {
  const result = Reflect.set(target, key, value, receiver);
  queueObservers.forEach(observer => observer());
  return result;
}

const person = observable({
  name: '张三',
  age: 20
});

function print() {
  console.log(`${person.name}, ${person.age}`);
}
observe(print);

person.name = '李四'; // 李四， 20
person.newkey = 'newValue'; // 李四， 20