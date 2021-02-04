## 步骤1：`CreateElement`
```js
const element = (
  <div id="foo">
    <a>bar</a>
    <b />
  </div>
);
const container = document.getElementById("root");
ReactDOM.render(element, container);
```

让我们从另一个 app 重新开始。这次我们将替换 React 代码使用我们自己的 React 的版本。

我们将从写我们自己的 `createElement` 开始。

让我们把 JSX 转化成 JS，以便于我们可以看清晰 `createElement` 的调用。
```js
const element = React.createElement(
  "div",
  {id: "foo" },
  React.createElement("a", null, "bar"),
  React.createElement("b")
);
const container = document.getElementById("root");
ReactDOM.render(element, container);
```

我们可以看到步骤 0，一个元素就是一个含有 type 和 props 属性的对象。我们的函数需要做的唯一一件事就是创建一个对象。
```js
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children： children.map(child => 
        typeof child === 'object'
          ? child
          : createTextElement(child)
      ),
    },
  }
}
/*
例如：
  createElement("div") 返回: 
  {
    type: "div",
    props: { children: []}
  }

  createElement("div", null, a) 返回:
  {
    "type": "div",
    "props": { "children": [a] }
  }
*/
function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: []
    }
  }
}
```
我们对 props 使用拓展语法，对 children 使用剩余参数语法，这样 children 属性就总是一个数组。

这个 children 数组也可以包含原始数据类型，例如字符串和数字。因此，我们会将不是对象的所有内容包装在其自己的元素中，并为其创建特殊类型：`TEXT_ELEMENT`。

当没有 children 时，React 不会包装原始值或创建空数组，但是我们这样做是因为它可以简化我们的代码，对于我们的库，我们更喜欢简单代码而不是高性能代码。

我们仍在使用 React 的 `createElement` 。

为了替换它，让我们给我们的库起个名字。 我们需要一个听起来像 React 的名字，但也暗示了它的教学目的。我们将叫它 Didact 。

但是我们仍然想在这里使用 JSX 。 我们如何告诉 babel 使用 Didact 的 `createElement` 代替 React 的？

```js
/** @jsx Didact.createElement*/
```
如果我们有这样的注释，当babel转译JSX时，它将使用我们定义的函数。

---

这一步骤后我们的代码：
```js
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children： children.map(child => 
        typeof child === 'object'
          ? child
          : createTextElement(child)
      ),
    },
  }
}

function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: []
    }
  }
}

const Didact = {
  createElement,
}
​
/** @jsx Didact.createElement*/
const element = Didact.createElement(
  "div",
  { id: "foo" },
  Didact.createElement("a", null, "bar"),
  Didact.createElement("b")
)

const container = document.getElementById("root")
ReactDOM.render(element, container)
```