// 创建一个含有 type 和 props 属性的对象
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map(child =>
        typeof child === 'object' ?
        child :
        createTextElement(child)
      )
    }
  }
}

// 当元素是字符串或者数组时，单独处理
function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: []
    }
  }
}

// 渲染函数
function render(element, container) {
  // 创建节点,对于文本节点做特殊处理
  const domNode = element.type === "TEXT_ELEMENT" ?
    document.createTextNode("") :
    document.createElement(element.type);

  // 将属性分配给节点
  const isProperty = key => key !== "children";
  Object.keys(element.props)
    .filter(isProperty)
    .forEach(name => {
      domNode[name] = element.props[name];
    })

  // 递归渲染孩子节点
  element.props.children.forEach(child => {
    render(child, domNode);
  });

  container.appendChild(domNode);
}

const Didact = {
  createElement,
  render
}

/**@jsx Didact.createElement*/
const element = (
  <div id="foo">
    <a href="/#">bar</a>
    <b />
  </div>
)

const container = document.getElementById("root");
Didact.render(element, container);