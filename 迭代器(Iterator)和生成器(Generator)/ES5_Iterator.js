// 迭代器是一种特殊的对象
// 所有的迭代器都有一个 next() 方法，每次调用都会返回一个对象
// 结果对象有两个属性： 
// value：下一个要返回的值
// done: 布尔值， true 表示没有更多可以返回的数据
// 迭代器还会保存一个内部指针，用来指向当前集合中值的位置，每次抵用 next() 方法都会返回下一个可以用的值。

// 使用 ES5 创建一个迭代器
function createIterator(items) {
  var i = 0;

  return {
    next: function () {
      var done = (i >= items.length);
      var value = !done ? items[i++] : undefined;
      return {
        done: done,
        value: value
      }
    }
  }
}

var iterator = createIterator([1, 2, 3]);
console.log(iterator.next()); // { done: false, value: 1 }
console.log(iterator.next()); // { done: false, value: 2 }
console.log(iterator.next()); // { done: false, value: 3 }
console.log(iterator.next()); // { done: true, value: undefined }
// 之后调用都返回一样的内容
console.log(iterator.next()); // { done: true, value: undefined }
