// 集合对象迭代器

// entries() 返回一个迭代器，其值为多个键值对
let colors = ["red", "blue", "green"];
let tracking = new Set([1234, 5678, 9012]);
let data = new Map();
data.set("title", "Understanding ECMAScript 6");
data.set("format", "ebook");
for (let entry of colors.entries()) {
  console.log(entry);
}
for (let entry of tracking.entries()) {
  console.log(entry);
}
for (let entry of data.entries()) {
  console.log(entry);
}
// [0, "red"]
// [1, "blue"]
// [2, "green"]
// [1234, 1234]
// [5678, 5678]
// [9012, 9012]
// ["title", "Understanding ECMAScript 6"]
// ["format", "ebook"]

// values() 返回一个迭代器，其值为集合的值
for (let value of colors.values()) {
  console.log(value);
}
for (let value of tracking.values()) {
  console.log(value);
}
for (let value of data.values()) {
  console.log(value);
}
// 'red'
// 'blue'
// 'green'
// 1234
// 5678
// 9012
// 'Understanding ECMAScript 6'
// 'ebook'

// keys() 返回一个迭代器，其值为集合中所有的键名
for (let key of colors.keys()) {
  console.log(key);
}
for (let key of tracking.keys()) {
  console.log(key);
}
for (let key of data.keys()) {
  console.log(key);
}
// 0
// 1
// 2
// 1234
// 5678
// 9012
// 'title'
// 'format'

// 数组和 Set 集合的默认迭代器是 values() 方法
// Map 集合的默认迭代器是 entries() 方法
