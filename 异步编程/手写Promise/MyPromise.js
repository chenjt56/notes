class MyPromise {

  static PENDING = 'pending';
  static FULFILLED = 'fulfilled';
  static REJECTED = 'rejected';

  constructor(executor) {
    this.status = MyPromise.PENDING;
    this.value = null;
    try { // 执行者异步的捕获
      executor(this.resolve.bind(this), this.reject.bind(this));
    } catch (error) {
      this.resolve(error)
    }
  }

  resolve(value) {
    if (this.status === MyPromise.PENDING) {
      this.status = MyPromise.FULFILLED;
      this.value = value
    }
  }

  reject(reason) {
    if (this.status === MyPromise.PENDING) {
      this.status = MyPromise.REJECTED;
      this.value = reason;
    }
  }

  then(onFulfilled, onRejected) {
    if (typeof onFulfilled !== "function") {
      onFulfilled = () => {};
    }
    if (typeof onRejected !== "function") {
      onRejected = () => {};
    }
    if (this.status === MyPromise.FULFILLED) {
      setTimeout(() => {
        try {
          onFulfilled(this.value);
        } catch (error) {
          onRejected(error);
        }
      })
    }
    if (this.status === MyPromise.REJECTED) {
      setTimeout(() => {
        try {
          onRejected(this.value);
        } catch (error) {
          onRejected(error);
        }
      })
    }
  }
}