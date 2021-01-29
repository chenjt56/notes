function toUnit32(value) { // 将给定的值转化为无符号的 32 位整数
  return Math.floor(Math.abs(Number(value))) % Math.pow(2, 32);
}

function isArrayIndex(key) { // 判断一个属性能否作为数组的下标
  let numericKey = toUnit32(key);
  return String(numericKey) === key && numericKey < (Math.pow(2, 32) - 1)
}

function creatArray(length = 0) {
  return new Proxy({
    length
  }, {
    set(trapTarget, key, value) {
      let currentLength = Reflect.get(trapTarget, "length");
      if (isArrayIndex(key)) {
        let numericKey = Number(key);
        if (numericKey >= currentLength) { // 超出数组长度时，重新设置数组长度
          Reflect.set(trapTarget, "length", numericKey + 1);
        }
        return Reflect.set(trapTarget, key, value);
      } else if (key === "length") { // 直接设置数组的长度
        if (value < currentLength) {
          for (let index = currentLength - 1; index >= value; index--) {
            Reflect.deleteProperty(trapTarget, index);
          }
        }
        return Reflect.set(trapTarget, key, value);
      } else {
        throw TypeError(`${key} 不能作为数组的下标`);
      }
    }
  })
}

let colors = creatArray(3);
console.log(colors.length); // 3
colors[0] = 'red';
colors[1] = 'black';
colors[2] = 'blue';
console.log(colors.length); // 3
colors[4] = "green";
console.log(colors.length); // 4
colors.length = 2;
console.log(colors.length); // 2
console.log(colors[2]); // undefined
console.log(colors[3]); // undefined

// colors["test"] = "yellow"   TypeError: test 不能作为数组的下标