// 生成器是一种返回迭代器的函数
// 例子：
function* createIterator() {
  console.log("还没执行1");
  yield 1;
  console.log("执行了1，还没执行2");
  yield 2;
  console.log("执行了2，还没执行3");
  yield 3;
  console.log('会不会执行到这里');
}

// 生成器的调用方法与普通函数相同，只不过是返回一个迭代器
let iterator = createIterator();
console.log(iterator.next()); // { done: false, value: 1 }
console.log(iterator.next()); // { done: false, value: 2 }
console.log(iterator.next()); // { done: false, value: 3 }
console.log(iterator.next()); // { done: true, value: undefined }


// 生成器函数最有趣的部分就是，每当执行完一条 yield 语句之后函数就会自动停止执行。

// 生成器函数表达式  **不能使用箭头函数来创建生成器**
let createIteratorFnc = function* (items) {
  for (let i = 0; i < items.length; i++) {
    yield items[i];
  }
}
iterator = createIteratorFnc([1, 2, 3]);
console.log(iterator.next()); // { done: false, value: 1 }
console.log(iterator.next()); // { done: false, value: 2 }
console.log(iterator.next()); // { done: false, value: 3 }
console.log(iterator.next()); // { done: true, value: undefined }

// 生成器对象的方法
let o = {
  * createIterator(items) {
    for (let i = 0; i < items.length; i++) {
      yield items[i];
    }
  }
}
iterator = o.createIterator([1, 2, 3]);
console.log(iterator.next()); // { done: false, value: 1 }
console.log(iterator.next()); // { done: false, value: 2 }
console.log(iterator.next()); // { done: false, value: 3 }
console.log(iterator.next()); // { done: true, value: undefined }