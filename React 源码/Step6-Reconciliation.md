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

我们同时遍历旧的 fiber （wipFiber.alternate）和我们需要协调的元素的数组。

如果我们忽略所有同时遍历数组和链表的样板，我们就只剩下： oldFiber 和 element。oldFiber 是指我们上一次渲染的东西， element 是指我们这次要渲染进 DOM 的东西。

我们需要对比他们去看这里是否有需要提交到 DOM 中的更改。

为了对比，我们使用以下规则：
1. 如果 oldFiber 与 element 的类型相同，我们保留这个 DOM 节点，只更新它的 props。
2. 如果这个类型是不一样的，并且有一个新的 element，这意味着我们需要创建新的 DOM 节点。
3. 如果类型不同，并且有 oldFiber，我们需要删除这个旧的节点。

React 在这使用 keys，更好的实现协调。例如，它检测子元素何时更改元素数组中的位置。

当这个 oldFiber 和 element 有相同的类型，我们根据 oldFiber 的DOM 节点和 element 的 props 创建一个新的 fiber。

我们为 fiber 添加一个新的： `effectTag`。我们将在提交阶段使用这个属性。

然后是第二种情况，元素需要新的 DOM 节点， 我们使用 `PLACEMENT` 来标记这个新的 fiber。

最后是我们需要删除这个节点的情况，我们没有新的 fiber， 因此我们在 oldFiber 上添加 `DELETION` 标记。

```js
function reconcileChildren(wipFiber, elements) {
  let index = 0
  let oldFiber =
    wipFiber.alternate && wipFiber.alternate.child
  let prevSibling = null

  while (
    index < elements.length ||
    oldFiber != null
  ) {
    const element = elements[index]
    let newFiber = null

    const sameType =
      oldFiber &&
      element &&
      element.type == oldFiber.type

    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: "UPDATE",
      }
    }
    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: "PLACEMENT",
      }
    }
    if (oldFiber && !sameType) {
      oldFiber.effectTag = "DELETION"
      deletions.push(oldFiber)
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling
    }

    if (index === 0) {
      wipFiber.child = newFiber
    } else if (element) {
      prevSibling.sibling = newFiber
    }

    prevSibling = newFiber
    index++
  }
}
```

但是当我们从工作中的根节点提交 fiber 进 DOM 中时，它是没有 oldFiber 的。

所以我们需要一个数组来保存我们想要删除的节点。

然后当我们提交这些更改给 DOM 时，我们使用数组中的 fibers

```js
function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  }
  deletions = []
  nextUnitOfWork = wipRoot
}
​
let nextUnitOfWork = null
let currentRoot = null
let wipRoot = null
let deletions = null

function commitRoot() {
  deletions.forEach(commitWork);
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
}
```

现在我们修改 `commitWork` 函数去处理新的属性 `effectTags`。

如果 fiber 有 `PLACEMENT`，我们做与之前一样的操作，将 DOM 节点添加进父亲 fiber。

如果是 `DELETION`，我么做相反的操作，删除孩子。

如果是 `UPDATE`，我们需要用新的 props 更新已经存在的 DOM。我们在函数 `updateDOM` 中进行。

```js
function commitWork(fiber) {
  if (!fiber) {
    return
  }
  const domParent = fiber.parent.dom
  if (
    fiber.effectTag === "PLACEMENT" &&
    fiber.dom !== null
  ) {
    domParent.appendChild(fiber.dom)
  } else if (
    fiber.effectTag === "UPDATE" &&
    fiber.dom !== null
  ) {
    updateDom(
      fiber.dom,
      fiber.alertnate.props,
      fiber.props
    )
  } else if (fiber.effectTag === "DELETION") {
    domParent.removeChild(fiber.dom)
  }
​
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}
```

我们将 oldFier 的 props 与新的 fiber 的 props 进行比较，删除不需要的 props，设置新的或者改变 props。

一种我们需要更新的 props 就是事件监听器，所以如果属性名以 on 开头，我们就特殊处理。
```js
const isEvent = key => key.startsWith("on");
const isProperty = key => key !== "children" && !isEvent(key);
const isNew = (prev, next) => key => prev[key] !== next[key];
const isGone = (prev, next) => key => !(key in next);
function updateDom(dom, prevProps, nextProps) {
  // 删除或者更新事件监听器
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(
      key => 
        !(key in nextProps) ||
        isNew(prevProps, nextProps)(key)
    )
    .forEach(name => {
      const eventType = name
        .toLowerCase()
        .subString(2);
      dom.removeEventListener(
        eventType,
        prevProps[name]
      )
    })
  
  // 删除旧的 props
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach(name => {
      dom[name] = "";
    });

  // 设置新的或者更改 props
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      dom[name] = nextProps[name];
    })

  // 设置新的事件监听器
   Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      const eventType = name
        .toLowerCase()
        .substring(2)
      dom.addEventListener(
        eventType,
        nextProps[name]
      )
    })
}
```