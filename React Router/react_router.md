# React Router
## 主要的组件
1. 路由器: \<BrowserRouter> 和 \<HashRouter>
2. 路由匹配器：\<Route> 和 \<Switch>
3. 导航： \<Link> 、 \<NavLink> 和 \<Redirect>

## 路由器的区别
\<BrowserRouter> 和 \<HashRouter> 路由器。两者之间的主要区别在于它们存储URL和与Web服务器通信的方式。   
要使用路由器，只需确保将其渲染在元素层次结构的根目录下即可。其使用方式一般如下所示：
```javascript
import React from 'react';
import ReactDM from 'react-dom';
import { BorwserRouter } from 'react-router-dom';

function App() {
  return <h1>Hello React Router</h1>
}

ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById("root")
);
```

## 路由匹配器
- 渲染 \<Switch> 时，它会搜索其子元素 \<Route> ，以查找其路径与当前URL匹配的元素。
- 当找到一个时，它将渲染该 \<Route> 并忽略所有其他路由。这意味着您应该将 \<Route> 包含更多特定路径（通常较长）的路径放在不那么特定路径之前。
- 如果没有 \<Route> 匹配，则 \<Switch> 不渲染任何内容（null）。

属性：
1. path：路径名
2. exact：表示完全匹配，一般匹配路径'/'时使用: `<Route exact path="/">`
3. render：Route 的渲染函数， 方便内联渲染
4. component：Route 对应的组件
5. children：不论是否与路径匹配都进行渲染？    
(**!注意：\<Route children> 优先于 \<Route component> 优先于 \<Route render>，因此请勿在同一<Route>中同时使用多者**)

## \<Link> 与 \<NavLink>
\<Link> 的属性：
1. to(string | loaction 对象): 表示定位的页面，字符串会转换成 location 对象（包含pathname、search、hash、与state属性）
2. replace(bool)：为 true 时，点击链接后将使用新地址替换掉访问历史记录里面的原地址；为 false 时，点击链接后将在原有访问历史记录的基础上添加一个新的纪录。默认为 false；
```javascript
<Link to="about">关于</Link>

<Link to={{
  pathname: '/courses',
  search: '?sort=name',
  hash: '#the-hash',
  state: { fromDashboard: true}
}}/>

<Link to='/courses' replace/>
```

\<NavLink> 是 \<Link>的一个特定版本，会在匹配上当前的url的时候给已经渲染的元素添加参数，组件的属性有： 
1. activeClassName(string)：设置选中样式，默认值为active
2. activeStyle(object)：当元素被选中时，为此元素添加样式
3. exact(bool)：为true时，只有当导致和完全匹配class和style才会应用
3. strict(bool)：为true时，在确定为位置是否与当前URL匹配时，将考虑位置pathname后的斜线
5. isActive(func)：判断链接是否激活的额外逻辑的功能


## Hooks
1. useHistory()：访问可用于导航的history实例。   
```javascript
  import { useHistory } from "react-router-dom";

  function HomeButton() {
    let history = useHistory();

    function handleClick() {
      history.push("/home");
    }

    return (
      <button type="button" onClick={handleClick}>
        Go home
      </button>
    );
  }
  ```
2. useLocation()：返回代表当前URL的location对象。    
您可以像useState一样考虑它，只要URL更改，它就会返回一个新位置。
```javascript
function usePageViews() {
  let location = useLocation();
  React.useEffect(() => {
    ga.send(["pageview", location.pathname]);
  }, [location]);
}

function App() {
  usePageViews();
  return <Switch>...</Switch>;
}
```
3. useParams()：返回URL参数的key/value的对象。    
使用它来访问当前 \<Route> 的 match.params。
```javascript
function BlogPost() {
  let { slug } = useParams();
  return <div>Now showing post {slug}</div>;
}
```
4. useRouteMatch()：与 \<Route> 相同的方式匹配当前URL。    
它主要用于在不实际渲染 \<Route> 的情况下访问匹配数据。
- 不使用useRouteMatch()
```javascript
function BlogPost() {
  return (
    <Route
      path="/blog/:slug"
      render={({ match }) => {
        // 用match做你想做的一切...
        return <div />;
      }}
    />
  );
}
```
- 使用useRouteMatch()
```javascript
function BlogPost() {
  let match = useRouteMatch("/blog/:slug");
  // 用match做你想做的一切...
  return <div />;
}
```