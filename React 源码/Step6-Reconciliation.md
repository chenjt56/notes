## 协调
到目前为止，我们仅向 DOM 添加了内容，但是更新或删除节点又如何呢？

这就是我们现在要做的，我们需要将在 `render` 函数上收到的元素与我们提交给 DOM 的最后一棵 fiber tree 进行比较。

因此，在完成提交之后，我们需要保存对“我们提交给 DOM 的最后一棵 fiber tree”的引用。 我们称它为 `currentRoot`。

我们还将 `alertnate` 属性添加到每根光纤。 该属性是到旧光纤的链接，旧光纤是我们在上一个提交阶段提交给 DOM 的光纤。
```js
function commitRoot() {
  commitWork(wipRoot.child)
  currentRoot = wipRoot
  wipRoot = null
}
​/*......*/
function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  }
  nextUnitOfWork = wipRoot
}
​
let nextUnitOfWork = null
let currentRoot = null
let wipRoot = null
```

现在让我们从 `performUnitOfWork` 中提取创建新的光纤的代码，到 `reconcoliChildren` 函数中。
```js
function performUnitOfWork(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }
​
  const elements = fiber.props.children
  reconcileChildren(fiber, elements)
​
  if (fiber.child) {
    return fiber.child
  }
  let nextFiber = fiber
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }
}

function reconcileChildren(wipFiber, elements) {
  let index = 0
  let prevSibling = null
​
  while (index < elements.length) {
    const element = elements[index]
​
    const newFiber = {
      type: element.type,
      props: element.props,
      parent: wipFiber,
      dom: null,
    }
​
    if (index === 0) {
      wipFiber.child = newFiber
    } else {
      prevSibling.sibling = newFiber
    }
​
    prevSibling = newFiber
    index++
  }
}
```

在这里，我们将旧纤维与新元素进行协调。