##  步骤0：回顾
首先我们来回顾一些基本的概念。你可以跳过这一步，如果你已经对 React、JSX 和 DOM elements 如何工作有一个好的理解。     

我们将使用 React app，仅仅只有三行代码。
```js
const element = <h1 title="foo">Hello</h1>;
const container = document.getElementById("root");
ReactDOM.render(element, container);
```
第一行代码定义了一个 React 元素。第二行代码从 DOM 中获取一个节点。最后一行把 React 渲染进这个节点中。     

让我们移除所有的 React 特殊的代码，将他们替换成原生的 JS。    

第一行我们通过 JSX 定义了一个元素。这不是符合 JS 语法的代码，因此在转化成普通的 JS 前，我们需要将它替换成的合法的 JS。

JSX 通过像 Bable 这样的工具转化成 JS。这个转换时很简单的：用 `createElement` 替换标签中的代码，将标签名、属性和孩子作为参数进行传递。

```js
const element = React.createElement("h1", {title: "foo"}, "Hello");
const container = document.getElementById("root");
ReactDOM.render(element, container);
```
`React.createElement` 根据它的参数创建了一个对象。除了一些验证之外（？），这就是它所作的全部。所以我们可以安全的将函数调用替换为它的输出。

一个元素是什么？就是一个对象包含包含两个属性：type 和 props （当然还有其他的，但是我们只关心这两个）。
- type 就是一个字符串表示我们想要创建的 DOM 节点的类型，这就是我们传递进 `createElement` 的标签名。它也能是一个函数，但是我们将在第 7 步讨论。
- props 是另一个对象，它包含从 JSX 属性中获取的所有的 keys 和 values 。它还包含一个特殊的属性： children。
  - children 在这个例子中是一个字符串，但是它通常是一个含有更多元素的数组。这就是为什么元素也是树。
```js
const element = {
  type: 'h1',
  props: {
    title: 'foo',
    children: 'Hello';
  }
}
const container = document.getElementById("root");
ReactDOM.render(element, container);
```

我们需要替换的另一部分的 React 代码就是 `ReactDOM.render` 。`render` 就是 React 改变 DOM 的方法，所以让我们自己来进行渲染。
```js
const element = {
  type: 'h1',
  props: {
    title: 'foo',
    children: 'Hello';
  }
}
const container = document.getElementById("root");
const node = document.createElement(element.type);
node['title'] = element.props.title
const text = document.createTextNode("");
text['nodeValue'] = element.props.children;
node.appendChild(text);
container.appendChild(node);
```
**为避免混淆，我将使用“元素”来指代 React 元素，并使用“节点”来指代 DOM 元素。**
1. 创建一个节点使用这个对象的 type 属性，在这个例子中是 h1。
2. 将所有的 props 属性分配给这个节点，这里只有一个 title 属性。
3. 创建孩子节点。这里只需要创建一个文本节点。使用 textNode 而不是设置 innerText 将允许我们以后以相同的方式对待所有元素。另请注意，我们如何像设置 h1 标题一样设置 nodeValue，就像字符串中带有 props 一样：`{nodeValue：“hello”}` 。
4. 最后将 textNode 添加到 h1 节点，将 h1 节点添加到 container。

现在我们就有了与之前相同的 app ，但是我们没有使用 React。