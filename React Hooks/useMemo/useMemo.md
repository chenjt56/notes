# React Hooks 之 useMemo()
## 问题场景？
父组件改变自身的数据，不涉及子组件的数据变化，仍然会 render 时重新渲染子组件。

## 方法一： 生命周期函数 shouldComponentUpdate()
- 使用方法： shouldComponentUpdate 通过返回 true 或 false 来控制组件是否渲染。他的默认值就是 true，即每次的数据变化都会触发重新渲染。
  ```javascript
  shouldComponentUpdate(nextProps, nextState) {
    if(this.props.value === nextProps.value) {
      return false;
    }
  }
  ```
- 缺点：
  1. 对复杂的数据类型判断不准确，需要一层一层的拆出来进行对比
  2. 每个组件都需要写不同的判断的逻辑

## 方法二： React.PureComponent 组件
- 使用方法：继承 PureComponent 组件的子组件，会自动判断传进的参数有没有变化，没有变化就会阻止子组件的渲染。
- 缺点：
  1. 只提供简单的对比算法，对复杂的数据结构判断不准确 (复杂数据结构:用Object.key()获取下key，然后key和对应的value都是基础类型数据，就是算是简单数据结构，不然就是复杂)
  2. 函数组件不能继承 PureComponent 
- 对比算法： 
```javascript
const hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * inlined Object.is polyfill to avoid requiring consumers ship their own
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
 */
function is(x: mixed, y: mixed): boolean {
  // SameValue algorithm
  if (x === y) { // Steps 1-5, 7-10
    // Steps 6.b-6.e: +0 != -0
    // Added the nonzero y check to make Flow happy, but it is redundant
    return x !== 0 || y !== 0 || 1 / x === 1 / y;
  } else {
    // Step 6.a: NaN == NaN
    return x !== x && y !== y;
  }
}

/**
 * Performs equality by iterating through keys on an object and returning false
 * when any key has values which are not strictly equal between the arguments.
 * Returns true when the values of all keys are strictly equal.
 */
function shallowEqual(objA: mixed, objB: mixed): boolean {
  if (is(objA, objB)) {
    return true;
  }

  if (typeof objA !== 'object' || objA === null ||
      typeof objB !== 'object' || objB === null) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  // Test for A's keys different from B.
  for (let i = 0; i < keysA.length; i++) {
    if (
      !hasOwnProperty.call(objB, keysA[i]) ||
      !is(objA[keysA[i]], objB[keysA[i]])
    ) {
      return false;
    }
  }

  return true;
}
```

## 方法三： React.memo() 和 useMemo()
### React.memo()
React.memo() 是一个高阶组件， 与 React.PureComponent 组件的区别在于前者是函数组件，后者是类组件。二者的功能是一样的。
- 使用方法: 
```javascript
import React, {memo} from 'react';
const Child = memo(function Child(props) {
  return (
    <h1>{props.value}</h1>
  )
})
export default Child;
```
### useMemo()
1. React.memo()是判断一个函数组件的渲染是否重复执行。
2. useMemo()是定义一段函数逻辑是否重复执行。
3. useMemo()的参数：第一个参数是执行函数，那......第二个参数：         
  - 若第二个参数为空，则每次渲染组件该段逻辑都会被执行，就不会根据传入的属性值来判断逻辑是否重新执行，这样写useMemo()也就毫无意义。
  - 若第二个参数为空数组，则只会在渲染组件时执行一次，传入的属性值的更新也不会有作用。
  - 所以useMemo()的第二个参数，数组中需要传入依赖的参数。
