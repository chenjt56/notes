## 钩子
最后一步。现在我们拥有了函数组件。让我们来添加 state。

让我们将例子改成一个传统的计数器组件。我们每次点击，它的 state 加一。

注意，我们使用 `Didact.useState` 去获取和更新计数器的值。
```jsx
const Didact = {
  createElement,
  render,
  useState,
}
​
/** @jsx Didact.createElement */
function Counter() {
  const [state, setState] = Didact.useState(1)
  return (
    <h1 onClick={() => setState(c => c + 1)}>
      Count: {state}
    </h1>
  )
}
const element = <Counter />
const container = document.getElementById("root")
Didact.render(element, container)
```
在这里，我们从示例中调用 `Counter` 函数。 在该函数内部，我们称为 `useState`。

在调用函数组件之前，我们需要初始化一些全局变量，以便我们在 `useState` 函数中使用。

首先我们设置工作中的 fiber

我们给 fiber 添加一个 `hooks` 数组去支持一个函数组件多次调用 `useState` 方法。同时我们保存当前钩子的下标。

当函数组件调用 `useState`， 我们检查是否有一个旧的钩子。我们用钩子的下标在 fiber 的链接中检查。

如果我们有一个旧的钩子，我们从旧的钩子中复制 state 到新的钩子中，如果没有我们就初始化一个 state。

然后我们添加这个新的钩子到 fiber，钩子的下标加一，并且放回这个 state。

```js
let wipFiber = null;
let hookIndex = null;

function updateFunctionComponent(fiber) {
  wipFiber = fiber;
  hookIndex = 0;
  wipFiber.hooks = [];
  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
}

function useState(initial) {
  const oldHook = 
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex];
  const hook = {
    state: oldHook ? oldHook.state : initial
  }

  wipFiber.hooks.push(hook);
  hookIndex++;
  return [hook.state]
}
```
`useState` 还需要返回一个更新 state 的函数，所以我们定义一个 `setState` 函数接收一个操作（在这个计数器的例子中这个操作就是 state 加一的函数）。

我们将这个操作放进我们在钩子中添加的一个队列中。

然后我们做一些跟 `render` 函数中相似的事情，将一个新的工作中的根节点设置为下一个工作单元，以至于工作循环可以开始用一个新的渲染阶段。
```js
function useState(initial) {
  const oldHook = 
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex];
  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: []
  }

  const setState = action => {
    hook.queue.push(action);
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot
    }
    nextUnitOfWork = wipRoot;
    deletions = [];
  }

  wipFiber.hooks.push(hook);
  hookIndex++;
  return [hook.state, setState];
}
```

但是我们现在还没有执行这个操作。

我们在下一次渲染这个组件的时候执行它，我们从旧的钩子队列中获取所有的操作，然后对新的钩子状态一个一个执行它们，所以当我们返回 state 时，它就是更新过的了。
```js
function useState(initial) {
  const oldHook = 
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex];
  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: []
  }

  const actions = oldHook ? oldHook.queue : [];
  actions.forEach(action => {
    hook.state = action(hook.state);
  })

  const setState = action => {
    hook.queue.push(action);
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot
    }
    nextUnitOfWork = wipRoot;
    deletions = [];
  }

  wipFiber.hooks.push(hook);
  hookIndex++;
  return [hook.state, setState];
}
```

这就是全部。我们构建出了我们自己版本的 React。