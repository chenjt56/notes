## 函数组件
我们要做的下一件事就是支持函数组件。

首先我们改变这个例子。我们将使用这个简单的函数组件，返回一个 `h1` 元素。
```jsx
function App(props) {
  return <h1>Hi {props.name}</h1>;
}

const element = <App name="foo" />;
const container = document.getElementById("root");
Didact.render(element, container);
```

注意我们将 jsx 转化成 js，它将变成：
```js
function App(props) {
  return Didact.createElement(
    "h1",
    null,
    "Hi ",
    props.name
  );
}
const element = Didact.creteElement(App, {
  name: 'foo'
});
```

函数组件有两个方面的不同：    
1. 来自函数组件的 fiber 没有 DOM 节点
2. children 是从运行函数得到的，而不是直接从 props 中得到

我们检查这个 fiber 的类型，来决定我们执行两个不同的更新函数。

在函数 `updateHostComponent` 我们执行与之前一样的操作。

在函数 `updateFuntionComponent`, 我们运行这个函数去获取 children。

对于我们的例子来说，`fiber.type` 是这个 `App` 函数，当我们运行它时，它返回 `h1` 元素。

然后，一旦我们拥有了孩子，这个协调就就按一样的方式裕兴，我们不需要更改任何东西。
```js
function performUnitOfWork(fiber) {
  const isFunctionComponent = fiber.type instanceof Function;
  if(isFunctionComponent) {
    updateFuntionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }
}

function updateFunctionComponent(fiber) {
  // TODO
  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
}

function updateHostComponent(fiber) {
  if(!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  reconcileChildren(fiber, fiber.props.children);
}
```
我们需要更改的是 `commitWork` 函数。

现在我们有没有 DOM 节点的 fiber，我们需要改变两处。

首先，要找到 DOM 节点的父节点，我们需要沿着 fiber tree 一直向上直到找到一个有 DOM 节点的 fiber。

然后，当我们删除一个节点时，我们需要一直向下直到找到一个有 DOM 节点的孩子。
```js
function commitWork(fiber) {
  if (!fiber) {
    return
  }

  // 根据不同的 effectTag 进行不同的处理
  let domParentFiber = fiber.parent;
  while(!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent;
  }
  const domParent = domParentFiber.dom;

  if (
    fiber.effectTag === "PLACEMENT" &&
    fiber.dom != null
  ) {
    domParent.appendChild(fiber.dom)
  } else if (
    fiber.effectTag === "UPDATE" &&
    fiber.dom != null
  ) {
    updateDom(
      fiber.dom,
      fiber.alternate.props,
      fiber.props
    );
  } else if (fiber.effectTag === "DELETION") {
    commitDeletion(fiber, domParent);
  }

  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

function commitDeletion(fiber, domParent) {
  if(fiber.dom) {
    domparent.removeChild(fiber.dom);
  } else {
    commitDeletion(fiber.child, domParent);
  }
}
```