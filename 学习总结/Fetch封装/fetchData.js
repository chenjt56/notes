/*
fetch() 与 XMLHTTPRequest 的区别
1. fetch() 使用 Promise，而不是使用回调函数；
2. fetch() 采用模块化设计，API 分散在多个对象上面；
3. fetch() 通过数据流（Stream 对象）处理数据，可以分块读取，有利于提高网站性能表现减少内存占用。
*/


// 基本使用方法
fetch('https://api.github.com/users/ruanyf')
  .then(response => response.json())
  // 接收一个 Stream 对象，.json是一个异步操作，取出所有内容，并将其转为 JSON  对象
  .then(json => console.log(json))
  .catch(err => console.log('Request Failed', err));

// fetch() 发送网络请求后，只有网络错误或者无法连接的时候，才会报错，其他情况都不会报错，而是认为请求成功

// 两种方式判断请求是否成功
async function fetchText() {
  const response = await fetch('/readme.txt');
  // 方式一
  if (response.status >= 200 && response.status < 300) {
    return await response.text();
  } else {
    throw new Error(response.statusText);
  }

  // 方式二
  // Response.ok属性返回一个布尔值，表示请求是否成功，true对应 HTTP 请求的状态码 200 到 299，false对应其他的状态码。
  if (response.ok) {
    // 请求成功
  } else {
    // 请求失败
  }
}

// 读取内容的方法
// 1. response.text()：得到文本字符串。
// 2. response.json()：得到 JSON 对象。
// 3. response.blob()：得到二进制 Blob 对象。
// 4. response.formData()：得到 FormData 表单对象。
// 5. response.arrayBuffer()：得到二进制 ArrayBuffer 对象。
async function getImage() {
  const response = await fetch('damo.jpg');
  const myBlob = await response.blob();
  const objectURL = URL.createObjectURL(myBlob);

  const myImage = document.createElement('img');
  myImage.src = objectURL;
  document.body.appendChild(myImage);
}
getImage();

// 取消一个 fetch 请求
let controller = new AbortController();
let signal = controller.signal;

fetch('./damo.jpg', {
  signal: controller.signal
})
  .catch(err => console.log(err));

signal.addEventListener('abort',
  () => console.log('abort!')
);

controller.abort(); // 取消

console.log(signal.aborted); // true

/**
 * @description: 封装的fetch post 方法
 * @param {string} url
 * @param {object} data
 * @param {object} headers
 * @param {string} method
 * @return {Promise}
 */
const postFetchData = (url, data = {}, headers = {}, method = "POST") => {
  return new Promise(async (resolve, reject) => {
    const response = await fetch(url, {
      method,
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        ...headers
      }
    });
    if (response.ok) {
      const jsonData = await response.json();
      resolve(jsonData);
    } else {
      const statusText = response.statusText;
      alert(`出错了${statusText}`);
      reject(statusText);
    }
  });
}

/**
 * @description: 封装的fetch get 方法
 * @param {string} url
 * @param {object} data
 * @param {object} headers
 * @param {string} method
 * @return {Promise}
 */
const getFetchData = (url, data = {}, headers = {}, method = "GET") => {
  Object.keys(data).filter(key => (data[key] !== null && data[key] !== undefined)).forEach((key, index) => {
    if (index === 0) {
      url += `?${key}=${data[key]}`;
    } else {
      url += `&${key}=${data[key]}`;
    }
  });

  return new Promise(async (resolve, reject) => {
    const response = await fetch(url, {
      method,
      headers
    });

    if (response.ok) {
      const jsonData = await response.json();
      resolve(jsonData);
    } else {
      alert(`出错了${statusText}`);
      reject(statusText);
    }
  });
}