// 可迭代对象具有 Symbol.iterator 属性
// Symbol.iterator 通过指定函数可以返回一个作用于附属对象的迭代器

let values = [1, 2, 3];
// 它会自动调用迭代器的 next() 方法，直到 done 属性为 true
for (let num of values) {
  console.log(num);
}
// 1 2 3

// 访问默认迭器
let iterator = values[Symbol.iterator]();
console.log(iterator.next()); // {value: 1, done: false}

// 可以通过访问默认迭代器来判断对象是否是可迭代对象
function isIterable(object) {
  return typeof object[Symbol.iterator] === "function";
}
console.log(isIterable([1, 2, 3])); // true
console.log(isIterable("Hello")); // true
console.log(isIterable(new Map())); // true
console.log(isIterable(new Set())); // true
console.log(isIterable(new WeakSet())); // false
console.log(isIterable(new WeakMap())); // false

// 创建可迭代对象
let collection = {
  items: [],
  // 给 Symbol.iterator 属性添加一个生成器 （星号在属性名前面）
  *[Symbol.iterator]() {
    for (let item of this.items) {
      yield item;
    }
  }
}
collection.items.push(1);
collection.items.push(2);
collection.items.push(3);
for (let x of collection) {
  console.log(x);
}
// 1 2 3