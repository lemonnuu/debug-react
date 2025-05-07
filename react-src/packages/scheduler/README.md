# `scheduler`

This is a package for cooperative scheduling in a browser environment. It is currently used internally by React, but we plan to make it more generic.

The public API for this package is not yet finalized.

### Thanks

The React team thanks [Anton Podviaznikov](https://podviaznikov.com/) for donating the `scheduler` package name.


## 任务调度机制

scheduler 是一个单独的包，可以认为它和 React 没有直接关系，可以当作就是用 JS 实现了一个单线程任务调度器。

三个概念：

- callback: 实际要执行的任务
- task: scheduler 封装的任务结构，附带了 任务id、优先级、到达时间、到期时间等额外信息
- work: 一个时间切片内的工作单元

### 最小堆

任务池用到了最小堆这个数据结构

1. 任务执行有着不同的优先级，而且任务队列是动态的，需要找出当前时刻优先级最高的任务，所以用到了最小堆这个数据结构
2. 最小堆是一个父节点永远不大于子节点的完全二叉树，通过数组进行存储
3. 节点下标计算公式：
   - parentNode: `childNode >>> 1` （除以二并向下取整）
   - leftChildNode: `parentNode * 2 - 1`
   - rightChildNode: `parentNode * 2` | `leftChildNode + 1`
4. 最小堆增、删、查：
   - 查：最小堆数据结构的"查"肯定就是查堆顶，也就是最小值
   - 增：最小堆新增元素需要先将元素添加至末尾，然后再向上堆化，也就是和他的祖先节点比较
   - 删：最小堆删除元素需要先删除堆顶元素，然后将末尾元素提至堆顶，并向下堆化，向下堆化的时候需要比较父节点、左子节点和右子节点

### 任务调度器

React 将任务分成了 五 个优先级（没算 NoPriority）：

```js
export const NoPriority = 0; // ! 无优先级(默认值)，实际没有用到，Task 的优先级默认为 NormalPriority
export const ImmediatePriority = 1; // 立即执行优先级(最高)
export const UserBlockingPriority = 2; // 用户阻塞优先级(需要快速响应)
export const NormalPriority = 3; // 普通优先级(默认)
export const LowPriority = 4; // 低优先级(可延迟执行)
export const IdlePriority = 5; // 空闲优先级(最低)
```

### 时间切片

时间切片就是指一个时间段，比如 5ms。在单线程机制下，如果一个任务执行时间花费过久，就容易堵塞后面的任务。假设 React 页面渲染的时候，某一个任务堵塞后面高优先级任务，如用户交互任务、布局任务等，这个时候就会看到卡顿现象。

为了解决这个问题，React 参照操作系统，引入了时间切片机制，在某个时间段内周期性的执行任务，即**周期性地把控制权交还给浏览器**

#### 时间

时间方面用了更精确的 `performance.now()` 而不是 `Date.now`

- `performance.now()` 是高精度时间「微秒级」，Date.now() 是低精度时间「毫秒级」
- `performance.now()` 基于页面加载时间，​​完全隔离系统时间影响​​，保证稳定性。
- `Date.now()` 受系统时间影响，比如用户修改系统时间。

#### 控制权交还浏览器

```js
export const frameYieldMs = 5; // ! 时间切片参数，单帧最大执行时间（5毫秒）
```

```js
function shouldYieldToHost() {
  const timeElapsed = getCurrentTime() - startTime;
  if (timeElapsed < frameInterval) {
    return false;
  }
  return true;
}
```

### 任务调度器入口

`unstable_scheduleCallback` 函数

### requestHostCallback


`requestHostCallback` 的核心就是模拟 requestIdleCallback 来调度执行时间切片

React 使用 MessageChannel 创建宏任务，来实现异步任务队列，以实现异步更新，确保 React 在执行更新时能够合并多个更新操作，并在下一个宏任务中一次性跟更新，以提高性能并减少不必要的重复渲染，从而提高性能和用户体验。

#### 模拟 requestIdleCallback

React 中的任务调度使用 MessageChannel 模拟 requestIdleCallback，而不是 setTimeout。

> https://developer.mozilla.org/zh-CN/docs/Web/API/Window/setTimeout#延时比指定值更长的原因
