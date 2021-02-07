# Diff 算法
## 概览
对于 `update` 的组件，他会将当前组件与该组件在上次更新时对应的 Fiber 节点比较（这就是 Diff 算法），将比较的结果生成新的 Fiber 节点。

### Diff 算法的本质：
一个 DOM 节点在某一时刻最多有4个节点和他相关。    
1. `current Fiber`。如果该 DOM节点 已经在页面中， `current Fiber` 代表 DOM节点 对应的 Fiber节点。
2. `workInProgress Fiber`。如果该 DOM节点 将在本次更新中渲染到页面中， `workInProgress Fiber`  表示该 DOM节点对应 Fiber节点。
3. DOM节点本身。
4. JSX 对象。即 `ClassComponent` 的 `render` 方法的返回结果，或者 `FunctionComponent` 的调用结果。JSX 对象中包含描述 DOM节点的信息。
- Diff 算法的本质就是对比 1 和 4，生成 2 。

### Diff 算法的瓶颈以及 React 如何应对
由于Diff操作本身也会带来性能损耗，React文档中提到，即使在最前沿的算法中，将前后两棵树完全比对的算法的复杂程度为 O(n 3 )，其中n是树中元素的数量。

如果在React中使用了该算法，那么展示1000个元素所需要执行的计算量将在十亿的量级范围。这个开销实在是太过高昂。

为了降低算法的复杂度， React 的 diff 会预设三个限制：
1. 只对同级的元素进行比较。如果一个 DOM 节点在前后两次更新中跨越了层级，那么 React 不会尝试复用它。
2. 两个不同类型的元素会产生不同的书。如果元素由 div 变成了 p， React 会销毁 div 及其子孙节点，并新建 p 及其子孙节点。
3. 开发者可以通过 key 属性来暗示哪些子元素在不同的渲染下能保持稳定。考虑以下例子：
```jsx
// 更新前
<div>
  <p key="ka">ka</p>
  <h3 key="song">song</h3>
</div>

// 更新后
<div>
  <h3 key="song">song</h3>
  <p key="ka">ka</p>
</div>
```
分析：如果没有 key，React 会认为 div 的第一个子节点由 p 变为 h3，第二个子节点由 h3 变为了 p。这符合限制 2 的设定，会销毁并新建。
但是当我们使用 key 指明节点的先后对应关系后，React 知道 `key==="ka"` 的 p 标签在更新之后依旧存在，只是需要交换一下顺序。

### Diff 是如何实现的
从 Diff 的入口函数 `reconcileChildFiber` 出发，该函数会根据 `newChild` （即 JSX 对象）类型来调用不同的处理函数。
```ts
function  reconcileChildFibers(
  returnFiber: Fiber,
  currentFirstChild: Fiber | null,
  newChild: any
): Fiber | null {
  const isObject = typeof newChild === 'object' && newChild !== null;
  if(isObject) {
    // Object 类型， 可能是 REACT_ELEMENT_TYPE 或 REACT_PROTAL_TYPE
    switch (newChild.$$typeof) {
      case REACT_ELEMENT_TYPE:
        // 调用 reconcileSingleElement 处理
      // ... 省略其他的 case
    }
  }

  if(type newChild === "string" || typeof newChild === 'number') {
    // 调用 reconcileSingleTextNode 处理
    // ... 省略
  }

  if(isArray(newChild)) {
    // 调用 reconcileChildArray 处理
    // ... 省略
  }

  // 一些其他情况的调用函数
  // ... 省略

  // 以上都没有命中，则删除节点
  return deleteRemainingChildren(returnFiber, currentFirstChild);
}
```
我们可以从同级的节点数量将 Diff 分为两类：    
1. 当 newChild 类型为 object、number、string，代表同级只有一个节点。
2. 当 newChild 类型为 Array 时，同级有多个节点。

## 单节点 Diff
函数 `reconcileSingleElement` 会做的事情：
![单节点Diff](../img/diff1.png)
第二步**判断DOM节点是否可以复用**如何实现：
```ts
function reconcileSingeElement(
  returnFiber: Fiber,
  currentFirstChild: Fiber | null,
  element: ReactElement
): Fiber {
  const key = element.key;
  let child = currentFirstChild;

  // 首先判断是否存在对应的 DOM节点
  while(child !== null) {
    // 上次更新存在的 DOM 节点，接下来判断是否可以复用

    // 首先比较 key 是否相同
    if(child.key === key) {
      // key 相同，接下来比较 type 是否相同
      switch(child.tag) {
        // ... 省略 case
        default: {
          if(child.elementType === element.type) {
            deleteRemainingChildren(returnFiber, child.sibling);
            const existing = useFiber(child, element.props);
            // type 相同则表示可以复用
            // 返回复用的 fiber
            return existing;
          }
          // type 不同则跳出 switch
          break;
        }
      }
      // key 相同但是 type 不相同
      // 将该 fiber 及其兄弟 fiber 标记为删除
      deleteRemainingChildren(returnFiber, child);
      break;
    } else {
      // key 不相同，将该 fiber 标记为删除
      deleteChild(returnFiber, child);
    }
    child = child.sibling;
  }

  // 创建新的 Fiber，并且返回
  // ...省略
}
```
从代码可以看出， React 通过先判断 key 是否相同，如果 key 相同则判断 type、 是否相同，只有二者都相同时一个 DOM 节点才能复用。

这里有几个细节需要注意一下：      
- 当 `child !== null` 且 key 相同但是 type 不同的时候执行 `deleteRemainingChildren` 将 child 及其兄弟 fiber 都标记删除。
- 当 `child !== null` 且 key 不同时仅将 child 标记删除。

考虑以下例子：当前页面有三个 li，我们要全部删除，在插入一个 p。
```js
// 当前页面显示的
ul > li*3

// 这次需要更新的
ul > p
```
由于这次更新时只有一个 p，属于单节点的 diff，会走上面的代码逻辑。

在 `reconcileSingleElement` 中遍历之前的三个 fiber （对应 DOM 为三个 li），寻找本次更新的 p 是否可以复用之前的 3 个 fiber 中的 DOM。

当 key 相同但是 type不同时，代表我们已经找到本次更新的 p 对应上次的 fiber，但是 p 与 li 的 type 不一样，不能复用。既然唯一的可能性不能复用，那么剩下的 fiber 都没有机会，所以都需要标记为删除。

当 key 不同时只代表遍历到的该 fiber 不能被 p 复用，后面还有兄弟 fiber 还没有遍历到。所以仅仅标记该 fiber 删除。

## 多节点 Diff
现在考虑一个 `FunctionComponent`:
```jsx
function List () {
  return (
    <ul>
      <li key="0">0</li>
      <li key="1">1</li>
      <li key="2">2</li>
      <li key="3">3</li>
    </ul>
  )
}
```
他的返回值 JSX 对象的 children 属性不再是单一节点，而是包含四个对象的数组。
```js
{
  $$typeof: Symbol(react.element),
  key: null,
  props: {
    children: [
      {$$typeof: Symbol(react.element), type: "li", key: "0", ref: null, props: {…}, …}
      {$$typeof: Symbol(react.element), type: "li", key: "1", ref: null, props: {…}, …}
      {$$typeof: Symbol(react.element), type: "li", key: "2", ref: null, props: {…}, …}
      {$$typeof: Symbol(react.element), type: "li", key: "3", ref: null, props: {…}, …}
    ]
  },
  ref: null,
  type: "ul"
}
```
这种情况下，`reconcileChildFibers` 的 newChild 参数类型为 Array，会调用函数 `reconcileChildrenArray` 进行处理。
### 概览
首先归纳我们需要处理的情况。同级多个节点的 Diff，一定属于以下三种情况的一种或者多种。

- 情况1：节点更新
  ```html
  <!-- 之前 -->
  <ul>
    <li key="0" className="before">0<li>
    <li key="1">1<li>
  </ul>

  <!-- 之后 情况1 —— 节点属性变化 -->
  <ul>
    <li key="0" className="after">0<li>
    <li key="1">1<li>
  </ul>

  <!-- 之后 情况2 —— 节点类型更新 -->
  <ul>
    <div key="0">0</div>
    <li key="1">1<li>
  </ul>
  ```
- 情况2：节点新增或减少
  ```html
  <!-- 之前 -->
  <ul>
    <li key="0">0<li>
    <li key="1">1<li>
  </ul>

  <!-- 之后 情况1 —— 新增节点 -->
  <ul>
    <li key="0">0<li>
    <li key="1">1<li>
    <li key="2">2<li>
  </ul>

  <!-- 之后 情况2 —— 删除节点 -->
  <ul>
    <li key="1">1<li>
  </ul>
  ```
- 情况3：节点位置变化
  ```html
  <!-- 之前 -->
  <ul>
    <li key="0">0<li>
    <li key="1">1<li>
  </ul>

  <!-- 之后 -->
  <ul>
    <li key="1">1<li>
    <li key="0">0<li>
  </ul>
  ```

### Diff 的思路
React 团队发现，在日常开发中，相较于新增和删除，更新组件发生的频率更高。所以 Diff 会优先判断当前节点是否属于更新。

基于以上原因， Diff 算法的整体逻辑会经历两轮遍历：
1. 处理更新的节点。
2. 处理剩下的不属于更新的节点。

### 第一轮遍历
1. `let i = 0` 遍历 `newChildren`，将 `newChildren[i]` 与 `oldFiber` 比较，判断 `DOM节点` 是否可以复用。
2. 如果可以复用，`i++`，继续比较 `newChildren[i]` 和 `oldFiber.sibling`，可以复用则继续遍历。
3. 如果不可复用，分两种情况：
    - key 不同导致不可复用，立即跳出整个循环，第一轮遍历结束。
    - key 相同 type 不同导致的不可复用，会将 `oldFiber` 标记为 `DELETION`，并且继续遍历。
4. 如果 `newChildren` 遍历完（即 `i === newChilren.length - 1`） 或者 `oldFiber` 遍历完（即 `oldFiber.sibling === null`），跳出遍历，第一轮遍历结束。

遍历结束后，会有两种结果：
1. 步骤 3 跳出的遍历：   
此时 `newChilren` 和 `oldFiber` 都没有遍历完。
举个例子，考虑以下代码。
```html
<!-- 之前 -->
<li key="0">0</li>
<li key="1">1</li>
<li key="2">2</li>
            
<!-- 之后 -->
<li key="0">0</li>
<li key="2">1</li>
<li key="1">2</li>
``` 
第一个节点可复用，遍历到 `key === 2` 的节点发现key改变，不可复用，跳出遍历，等待第二轮遍历处理。

此时 `oldFiber` 剩下 `key === 1` 、 `key === 2` 未遍历，`newChildren` 剩下 `key === 2` 、 `key === 1` 未遍历。

2. 步骤 4 跳出的遍历：
可能 `newChildren` 遍历完，或 `oldFiber` 遍历完，或他们同时遍历完。举个例子，考虑如下代码：
```html
<!-- 之前 -->
<li key="0" className="a">0</li>
<li key="1" className="b">1</li>
            
<!-- 之后 情况1 —— newChildren与oldFiber都遍历完 -->
<li key="0" className="aa">0</li>
<li key="1" className="bb">1</li>
            
<!-- 之后 情况2 —— newChildren没遍历完，oldFiber遍历完 -->
<!-- newChildren剩下 key==="2" 未遍历 -->
<li key="0" className="aa">0</li>
<li key="1" className="bb">1</li>
<li key="2" className="cc">2</li>
            
<!-- 之后 情况3 —— newChildren遍历完，oldFiber没遍历完 -->
<!-- oldFiber剩下 key==="1" 未遍历 -->
<li key="0" className="aa">0</li>
```

### 第二轮遍历
对于第一轮变量的结果，我们分别讨论：
1. `newChildren` 与 `oldFiber` 同时遍历完。    
这就是最理想的情况：只需要一轮遍历进行组件更新。此时 Diff 结束。
2. `newChildren` 没有遍历完， `oldFiber` 遍历完。     
已有的 `DOM节点` 都复用了，这是还有新加入的节点，意味着本次更新有新节点插入，我们只需要遍历剩下的 `newChildren` 为生成的 `workInProgress fiber` 依次标记 `Placement`。
3. `newChildren` 遍历完， `oldFiber` 没遍历完。
意味着本次更新比之前的节点数量少，有节点被删除了。所以需要遍历剩下的 `oldFiber`，依次标记为 `DELETION`。
4. `newChildren` 与 `oldFiber` 都没有遍历完。（**Diff算法最精髓最难懂的部分**）  
这意味着有节点在本次更新中改变了位置。

#### 处理移动的节点
由于有节点改变了位置，所以不能再用位置索引 `i` 对比前后的节点，那么如何才能将同一个节点在两次更新中对应上呢？

我们需要使用 `key` 。

为了快速找出 `key` 对应的 `oldFiber` ，我们将所有还未处理的 `oldFiber` 存入以 `key` 为 key， `oldFiber` 为 value 的 `Map` 中。

```js
const existingChildren = mapRemainingChilren(returnFiber, oldFiber);
```
接下来遍历剩余的 `newChildren`，通过 `newChilren[i].key` 就能在 `existingChildren` 中找到 `key` 相同的 `oldFiber`。

#### 标记节点是否移动
既然我们的目标是寻找移动的节点，那么我们需要明确：节点是否移动是以什么为参照物。

我们的参照物是： 最后一个可以复用的节点在 `oldFiber` 中的位置索引（用变量 `lastPlacedIndex` 表示）。

由于本次更新中节点是按照 `newChildern` 的顺序排列。在遍历 `newChildren` 的过程中，每一个 `遍历到的可以复用的节点` 一定是在当前遍历到的 `所有可复用节点` 中 **最靠右边的那一个**, 即一定在 `lastPlacedIndex` 对应的 `可复用的节点` 在本次更新中位置的后面。

那么我们只需要比较 `遍历到的可复用节点` 在上次更细时是否也在 `lastPlacedIndex` 对应的 `oldFiber` 后面，就能知道两次更新中这两个节点对应的位置改变没有。

我们用变量 `oldIndex` 表示 `遍历到的可复用节点` 在 `oldFiber` 中的位置索引。如果 `oldFiber < lastPlacedIndex`，代表本次更新该节点需要向右移动。

`lastPalcedIndex` 初始为 `0`, 每遍历一个可以复用的节点，如果 `oldIndex >= lastPlacedIndex`, 则 `lastPlacedIndex = oldIndex`。
