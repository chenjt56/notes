## 步骤三：并发模式
在我们添加更多代码之前，我们需要一个重构。

问题就在 render 函数中的递归调用。`element.props.children.forEach(child =>render(child, dom))`

一旦我们开始渲染，就必须等到这个元素树渲染完毕。如果这个元素树很大，它将阻塞主线程过久。如果浏览器需要处理更高优先级的事件如处理用户的输入等，它将等待直到渲染结束。所以我们将整个渲染工作拆分成小的单元，在一个单元完成后，如果浏览器需要去完成其他的事，我们允许浏览器中断渲染。

```js
let nextUnitOfWork = null;
function workloop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOFWork = performUnitOfWork(
      nextUnitOfWork
    );
    shouldYeild = deadline.timeRemaining() < 1;
  }
  requestIdleCallback(workloop);
}

requestIdleCallback(workloop);

function performUnitOfWork(nextUnitOfWork) {
  // TODO
}
```
我们使用 `requestIdleCallback` 来制造循环。你可以将 `requestIdleCallback` 看成是 `setTimeout`，但是与我们告诉它多久执行不同的是，浏览器会执行这个回调当主线程空闲的时候。（React 不再使用 `requestIdleCallback`。现在它使用的是 `scheduler package`。但是在这个用例中，它们在概念上是一样的。）

`requestIdleCallback` 还给我们提供了一个 deadline 的参数。我们可以使用它来在浏览器重新获取控制权之前我们拥有多少时间。

截至2019年11月，并发模式在React中还不稳定。 循环的稳定版本看起来像这样：
```js
while (nextUnitOfWork) {
  nextUnitOfWork = performUnitOfWork(
    nextUnitOfWork
  )
}
```

在开始使用这个循环之前，我们需要设置第一个工作的单元，然后编写 `performUnitOfWork` 函数,该函数不仅执行这个工作单元，还要返回下一个工作单元。