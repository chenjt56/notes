# useEffect()
## useEffect() 的作用
React 中的钩子，都是引入某种特定的副效应，而 useEffect() **是通用的副效应钩子** 。找不到对应的钩子时，就可以用它。    
useEffect() 的作用就是指定一个副效应函数，组件每渲染一次，该函数就自动执行一次。组件首次在网页 DOM 加载后，副效应函数也会执行。
## useEffect() 的用法
- 第一个参数是一个函数，组件挂载和重新渲染，该函数（副效应函数）都会自动执行一次。
- 第二个参数是一个数组：    
  1. 如果是一个空数组，副效应函数只会在组件加载进 DOM 时执行一次，后面组件重新渲染就不会在执行。
  2. 如果不是空数组，就是指定副效应函数的依赖项，只有这个变量发生了改变，副效应函数才会执行。
- useEffect() 允许返回一个函数，在组件卸载时执行该函数，清除副效应。这个返回值是可选的，如果不需要清除副效应就不需要。
  ```javascript
  useEffect(() => {
    const subscription = props.source.subscribe();
    return () => {
      subscription.unsubscribe();
    }
  }, [props.source]);
  /*
    实际使用中，由于副效应函数默认是每次渲染都会执行，所以清理函数不仅会在组件卸载时执行一次，每次副效应函数重新执行之前，也会执行一次，用来清理上一次渲染的副效应。
  */
  ```
## useEffect() 的用途
只要是副效应，都可以使用useEffect()引入。它的常见用途有下面几种。
1. 获取数据（data fetching）
2. 事件监听或订阅（setting up a subscription）
3. 改变 DOM（changing the DOM）
4. 输出日志（logging）   

一个例子：
```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [data, setData] = useState({ hits: [] });

  useEffect(() => {
    const fetchData = async () => {
      const result = await axios(
        'https://hn.algolia.com/api/v1/search?query=redux',
      );
      // 请求数据，触发重新渲染
      setData(result.data);
    };

    fetchData();
  }, []); // 只需要请求一次数据，第二个参数为[]
  // 相当于 生命周期函数 componentDidMount()

  return (
    <ul>
      {data.hits.map(item => (
        <li key={item.objectID}>
          <a href={item.url}>{item.title}</a>
        </li>
      ))}
    </ul>
  );
}

export default App;
```