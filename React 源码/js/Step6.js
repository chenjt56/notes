// 创建一个含有 type 和 props 属性的对象
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map(child =>
        typeof child === "object" ?
        child :
        createTextElement(child)
      ),
    },
  }
}

// 当元素是字符串或者数组时，单独处理
function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  }
}

// 通过 fiber 创建 dom 节点
function createDom(fiber) {
  const dom = // 创建节点，对文本节点做特殊处理
    fiber.type == "TEXT_ELEMENT" ?
    document.createTextNode("") :
    document.createElement(fiber.type)

  // 将 props 分配给节点
  updateDom(dom, {}, fiber.props)

  return dom
}

const isEvent = key => key.startsWith("on")
const isProperty = key => key !== "children" && !isEvent(key)
const isNew = (prev, next) => key => prev[key] !== next[key]
const isGone = (prev, next) => key => !(key in next)

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
        .substring(2)
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
      dom[name] = ""
    })

  // 设置新的或者更改 props
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      dom[name] = nextProps[name]
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

function commitRoot() {
  deletions.forEach(commitWork) // 删除节点
  commitWork(wipRoot.child)
  currentRoot = wipRoot // 保存当前显示在页面上的 fiber tree
  wipRoot = null
}

// 递归的将所有的节点添加进 DOM
function commitWork(fiber) {
  if (!fiber) {
    return
  }

  // 根据不同的 effectTag 进行不同的处理
  const domParent = fiber.parent.dom
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
    )
  } else if (fiber.effectTag === "DELETION") {
    domParent.removeChild(fiber.dom)
  }

  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

// 设置下一个工作单元 nextUnitOfWork 就是一个 fiber
function render(element, container) {
  wipRoot = { // 工作中(WorkInProgress)的 fiber tree 的根
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot, // 到 oldFiber 的一个连接
  }
  deletions = []
  nextUnitOfWork = wipRoot
}

let nextUnitOfWork = null
let currentRoot = null // 保存当前显示在页面上的 fiber tree 
let wipRoot = null
let deletions = null // 保存要删除的节点

function workLoop(deadline) {
  let shouldYield = false; // 是否需要让步
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(
      nextUnitOfWork
    )
    shouldYield = deadline.timeRemaining() < 1
  }

  // 当没有下一个工作单元时，将整个 fiber tree 提交到 DOM
  if (!nextUnitOfWork && wipRoot) {
    commitRoot()
  }

  requestIdleCallback(workLoop)
}

// 浏览器会在主线程空闲的时候执行这个 workLoop 回调函数
requestIdleCallback(workLoop)

// 执行一个工作单元，并且返回下一个工作单元
function performUnitOfWork(fiber) {
  // 1. 创建一个新的节点，并且添加进 DOM 中
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }

  // 2. 为每个孩子创建新的 fiber
  const elements = fiber.props.children
  reconcileChildren(fiber, elements)

  // 3. 返回下一个工作单元，即下一个 fiber
  if (fiber.child) { // 优先返回孩子
    return fiber.child
  }
  let nextFiber = fiber
  // 没有孩子，就找兄弟，没有兄弟就找父亲的兄弟。。。。
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }
}

// 为每个孩子创建新的 fiber，并且在这里进行协调
function reconcileChildren(wipFiber, elements) {
  let index = 0 // 下标
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child // 目前在页面上显示的 fiber
  let prevSibling = null // 记录前一个兄弟

  while (
    index < elements.length ||
    oldFiber != null
  ) {
    const element = elements[index]
    let newFiber = null

    // 比较 oldFiber 和 element
    const sameType =
      oldFiber &&
      element &&
      element.type == oldFiber.type

    if (sameType) {   // 是相同类型的节点
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: "UPDATE",
      }
    }
    if (element && !sameType) {  // element 存在且类型不同
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

    // 根据下标是否为 0，设置成孩子还是兄弟
    if (index === 0) {
      wipFiber.child = newFiber
    } else if (element) {
      prevSibling.sibling = newFiber
    }

    prevSibling = newFiber
    index++
  }
}

const Didact = {
  createElement,
  render,
}

/** @jsx Didact.createElement */
const container = document.getElementById("root")

const updateValue = e => {
  rerender(e.target.value)
}

const rerender = value => {
  const element = (
    <div>
      <input onInput={updateValue} value={value} />
      <h2>Hello {value}</h2>
    </div>
  )
  Didact.render(element, container)
}

rerender("World")