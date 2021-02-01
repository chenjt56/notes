## Render 和 Commit 阶段
这里我们有了另一个问题。

每当我们在处理元素的时候，我们在 DOM 中创建了一个新的节点。请记住，在在完成整个树的渲染之前，浏览器会中断我们的处理。这样，用户将看不到一个完整的 UI。 这不是我们想要的。

所以我们需要移除是 DOM 发生改变的部分。作为代替，我们将跟踪 fiber tree 的根。我们将它称为 工作中的根或者 `wipRoot`。
```js
function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element]
    }
  }
  nextUnitOfWork = wipRoot;
}
let newtUnitOfWork = null;
let wipRoot = null;
```

一旦我们完成所有工作（因为没有下一个工作单元，所以我们知道），我们提交整个 fiber tree 到 DOM。    
我们在函数 `commitRoot` 中处理。我们在这里递归的将所有节点添加进 DOM 中。
```js
function commitRoot() {
  // TODO add nodes to dom
  commitWork(wipRoot.child);
  wipRoot = null;
}

function commitWork(fiber) {
  if(!fiber) {
    return ;
  }
  const domParent = fiber.parent.dom;
  domParent.appendChild(fiber.dom);
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}
​/*......*/
function workLoop(deadline) {
  let shouldYield = false
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(
      nextUnitOfWork
    )
    shouldYield = deadline.timeRemaining() < 1
  }
​
  if (!nextUnitOfWork && wipRoot) {
    commitRoot()
  }
​
  requestIdleCallback(workLoop)
}
```