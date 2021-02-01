## 步骤二：`ReactDOM.render`
接着我们需要写我们自己版本的 `ReactDOM.render` 函数。

现在我们只关心在 DOM 中添加成员。我们稍后处理更新和删除。

我们从用元素的类型创建一个 DOM 节点开始，然后在 container 中添加这个节点。
对每个孩子递归进行同样的操作。
```js
function render(element, container) {
  // TODO create dom nodes
  const dom = document.createElement(element.type);

  element.props.children.forEach(child => {
    render(child, dom);
  });

  container.appendChild(dom);
}

const Didact = {
  createElement,
  render
}

Didact.render(element, container);
```

我们同样需要处理文本节点，如果元素的类型是 `TEXT_ELEMENT` ，我们创建文本节点来代替一般节点。
```js
function render(element, container) {
  const dom = 
    element.type = "TEXT_ELEMENT" 
      ? document.createTextNode("")
      : document.createElement(element.type);
  
  element.props.children.forEach(child => 
    render(child, dom);
  );

  container.appendChild(dom);
}
```

最后一件事就是我需要将所有的元素属性分配给这个节点。

```js
function render(element, container) {
  const dom = 
    element.type = "TEXT_ELEMENT" 
      ? document.createTextNode("")
      : document.createElement(element.type);

  const isProperty = key => key !== "children";
  Object.keys(element.props)
    .filter(isProperty)
    .forEach(name => {
      dom[name] = element.props[name];
    });
  
  element.props.children.forEach(child => 
    render(child, dom);
  );

  container.appendChild(dom);
}
```

这就是我们要做的。现在我们拥有了自己的库，可以将 JSX 渲染进 DOM 中。

```js
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map(child =>
        typeof child === "object"
          ? child
          : createTextElement(child)
      ),
    },
  }
}
​
function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  }
}
​
function render(element, container) {
  const dom =
    element.type == "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(element.type)
​
  const isProperty = key => key !== "children"
  Object.keys(element.props)
    .filter(isProperty)
    .forEach(name => {
      dom[name] = element.props[name]
    })
​
  element.props.children.forEach(child =>
    render(child, dom)
  )
​
  container.appendChild(dom)
}
​
const Didact = {
  createElement,
  render,
}
​
/** @jsx Didact.createElement */
const element = (
  <div id="foo">
    <a>bar</a>
    <b />
  </div>
)
const container = document.getElementById("root")
Didact.render(element, container)
```
