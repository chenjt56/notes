let isMount = true;  // 区分是渲染还是更新
let workInProgressHook = null; // 指当前正在处理的 hook

const fiber = {  // 保存组件对应信息
  stateNode: App,  // FunctionComponent 自身，就是一个函数
  memoizedState: null // 保存对应 hooks 的数据，保存的一条链表
}

function useState(initialState) {
  let hook;  // 当前的 useState 是哪一个 hook

  if (isMount) {
    hook = { // 首次渲染时，创建对应的 hook
      memoizedState: initialState,
      next: null,  // 指向下一个 hook
      queue: {  // 保存改变的状态
        pending: null
      }
    }
    if (!fiber.memoizedState) {
      fiber.memoizedState = hook;
    } else {
      workInProgressHook.next = hook
    }
    workInProgressHook = hook;
  } else { // 已经存在 hook
    hook = workInProgressHook;
    workInProgressHook = workInProgressHook.next;
  }

  // 产生新的状态
  let baseState = hook.memoizedState;
  if (hook.queue.pending) { 
    let firstUpdate = hook.queue.pending.next; // 第一个更新
    do { // 遍历链表
      const action = firstUpdate.action;
      baseState = action(baseState);
      firstUpdate = firstUpdate.next
    } while (firstUpdate !== hook.queue.pending.next)
    hook.queue.pending = null;
  }

  hook.memoizedState = baseState;
  return [baseState, dispatchAction.bind(null, hook.queue)]
}

function dispatchAction(queue, action) {
  const update = {  // 代表一次更新
    action,
    next: null
  }

  if (queue.pending === null) { // 当前的 hook 还没有需要触发的更新
    // 环状链表
    // u0 -> u0
    update.next = update;
  } else {
    // 添加一个更新，插入环状链表中
    // u1 -> u0 -> u1
    update.next = queue.pending.next;
    queue.pending.next = update;
  }
  queue.pending = update; // 每新建一个 update 就是在 queue 的末尾添加一个 update

  schedule(); // 触发更新
}

function schedule() {
  workInProgressHook = fiber.memoizedState;  // 重新指向第一个 hook
  const app = fiber.stateNode();   // 触发组件的渲染，即执行 FunctionComponent 的函数 
  isMount = false;
  return app;
}

function App() {
  const [num, updateNum] = useState(0);
  const [num1, updateNum1] = useState(10);

  return {
    onClick() {
      updateNum(num => num + 1);
    },
    onFocus() {
      updateNum1(num1 => num1 + 10);
    }
  }
}

window.app = schedule();