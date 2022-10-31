# React Hooks

为什要要有 Hooks:

- 在组件之间复用状态逻辑很难
  - 通常情况下的 状态逻辑复用方式
  - render Props
  - 高阶组件
  - Hook 可以从组件中提取状态逻辑，并对这些逻辑进行单独的测试并复用
  - Hook 使你可以在无需修改组件结构的情况下复用组件逻辑
- 复杂组件变得难以理解
- 难以理解的 Class
  - Class 组件的 this 问题
- 函数组件中没有 this

## useState Hook

useState hook 主要用来在 function component 组件中进行状态管理。主要负责：

- 在组件渲染更新期间，维持组件状态。
- 返回一个 setter 函数用来负责更新状态，并触发 React 对组件的重新渲染。

它可以接受一个 init state 作为参数，当调用执行的时候会返回一个包含两个元素的数组：

- 第一个元素是当前 state。
- 第二个元素是一个 setter 函数，用来更新 state，通常以 set 作为前缀。

使用公式：

```js
const [state, setState] = useState(initState)
```

示例：

```jsx
import { useState } from 'react';

function CountButton() {
  // 初始化 state
  const [count, setCount] = useState(0)
  
  const onClick = () => {
    setCount(count + 1)
  }
  
  return (
    <button onClick={onClick}>
    	{ count }
    </button>
  )
}
```

- 当点击 button 的时候，会通过 setCount 更新 count，count 发生改变， React 会重新渲染组件。

#### 理解 state snapshot

React 中的状态变量与 JavaScript 变量 在函数中的表现行为并不一样。React 中的 状态变量更像当前组件状态的一个快照。只有当通过执行 setter 函数更新状态变量，重新触发渲染时，才会发生变化。

如何理解? 示例：

```jsx
import { useState } from 'react';

function CountButton() {
  // 初始化 state
  const [count, setCount] = useState(0)
  
  const onClick = () => {
    console.log(count) // 0
    setCount(count + 1)
    console.log(count) // 0
  }
  
  return (
    <button onClick={onClick}>
    	{ count }
    </button>
  )
}

```

- 上面代码初始状态为 0，点击 button，会会执行 onClick 函数
- 以通常的思维，代码的执行过程是：打印0、执行setCount, count 加 1 、打印 1
- 但是实际效果却是：打印0、执行setCount, count 加 1 、打印 0。

你会发现执行 setCount 函数后，并没有立即更新 count。第二个 console 访问的还是当前的状态，setCount 的表现行为更像是一个异步的函数。

React 把这种行为称为：state snapshot。

理解了 state snapshot，我们再来看下批量多次执行 setter 函数，更新状态。下面的代码我们期望实现：

- 点击 +1 时，score 会增加 1
- 点击 +3 时，通过执行三次 increment，使 score 增加 3 的效果

```jsx
import { useState } from 'react';

export default function CountButton() {
  const [score, setScore] = useState(0);

  function increment() {
    setScore(s + 1);
  }

  return (
    <>
      <button onClick={() => increment()}>+1</button>
      <button onClick={() => {
        increment();
        increment();
        increment();
      }}>+3</button>
      <h1>Score: {score}</h1>
    </>
  )
}

```

但实际情况是，点击 +3，你会发现，score 只进行了一次叠加，别没有想期望的那样。

state snapshot 就可以很好的解释上面代码发生了什么。当通过执行 setScore 函数，触发一次重新渲染时，React 并不会立即改变当前运行中的代码状态：CountButton 组件更新过程中的状态，因此 score 还是 0。

```javascript
console.log(score);  // 0
setScore(score + 1); // setScore(0 + 1);
console.log(score);  // 0
setScore(score + 1); // setScore(0 + 1);
console.log(score);  // 0
setScore(score + 1); // setScore(0 + 1);
console.log(score);  // 0
```

#### 更新对象类型

useState 的初始状态参数可以是任意类型的 JavaScript 变量，比如对象。

但是在更新一个对象类型的 state 时，需要你传入一个新的对象，用新的对象去更新 state。

当存在嵌套的情况时，则需要进行多次展开操作。

```jsx
const [person, setPerson] = useState({
  name: 'Niki de Saint Phalle',
  artwork: {
    title: 'Blue Nana',
    city: 'Hamburg',
    image: 'https://i.imgur.com/Sd1AgUOm.jpg',
  }
});

function handleNameChange(e) {
  setPerson({
    ...person,
    name: e.target.value
  });
}

function handleTitleChange(e) {
  setPerson({
    ...person,
    artwork: {
      ...person.artwork,
      title: e.target.value
    }
  });
}
```

#### 更新数组

与更新对象的操作相似，需要创建一个新的数组。

```jsx
 const [list, setList] = useState([
  { id: 0, title: 'Big Bellies', seen: false },
  { id: 1, title: 'Lunar Landscape', seen: false },
  { id: 2, title: 'Terracotta Army', seen: true },
]);

  function handleToggle(artworkId, nextSeen) {
    setList(list.map(artwork => {
      if (artwork.id === artworkId) {
        return { ...artwork, seen: nextSeen };
      } else {
        return artwork;
      }
    }));
  }
```

#### 为什么对于引用类型在更新阶段需要传入一个新的 state。



### 函数式更新

### 引用类型更新

### 惰性初始化

- 调用 useState 方法的时候做了什么？
- useState 需要哪些参数?
  - 一个 初始化的 state
  - 当参数是对象时
  - 函数式更新：会有一个参数 prevState
  - 惰性初始 state：`initialState` 参数只会在组件的初始渲染中起作用，后续渲染时会被忽略。
  - 跳过 state 更新：只有当 state 发生变化的时候才会更新，原理 Object.is() 来比较 state

- useState 方法的返回值是什么？

- 返回一对值：**当前**状态和一个让你更新它的函数，你可以通过更新函数更新 state，但是它不会把新的 state 和旧的 state 进行合并。
- `useState` 唯一的参数就是初始 state，初始 state 参数只有在第一次渲染时会被用到。
- 通过数组解构语法，你可以给 state 变量取不同的变量。
- 多次调用用例
- 传入相同的 state 是否更新
- 

### 对比等价 Class 组件

### 函数组件

## useEffect

### 每一次渲染都有它自己的 Props and State

### 每一次渲染都有它自己的事件处理函数

### 每次渲染都有它自己的Effects

### 每一次渲染都有它自己的…所有

### 关于依赖项不要对React撒谎

**`useEffect`使你能够根据props和state\*同步\*React tree之外的东西。**

- 该 Hook 接收一个包含命令式、且可能有副作用代码的函数。'=在函数组件主体内（这里指在 React 渲染阶段）改变 DOM、添加订阅、设置定时器、记录日志以及执行其他包含副作用的操作都是不被允许的，因为这可能会产生莫名其妙的 bug 并破坏 UI 的一致性。
- 副作用函数：已经在 React 组件中执行过数据获取、订阅或者手动修改过 DOM。我们统一把这些操作称为“副作用”，或者简称为“作用”。
- 给函数组件增加了操作副作用的能力，*Effect Hook* 可以让你在函数组件中执行副作用操作
- 它跟 class 组件中的 `componentDidMount`、`componentDidUpdate` 和 `componentWillUnmount` 具有相同的用途，只不过被合并成了一个 API。
- 当你调用 `useEffect` 时，就是在告诉 React 在完成对 DOM 的更改后运行你的“副作用”函数。由于副作用函数是在组件内声明的，所以它们可以访问到组件的 props 和 state。
- 默认情况下，React 会在每次渲染后调用副作用函数 —— **包括**第一次渲染的时候
- 副作用函数还可以通过返回一个函数来指定如何“清除”副作用。
- 通过使用 Hook，你可以把组件内相关的副作用组织在一起（例如创建订阅及取消订阅），而不要把它们拆分到不同的生命周期函数里。
- **清除 effect**
- **effect 的执行时机**
  - 在浏览器完成布局与绘制之后
- **effect 的条件执行**

**`useEffect` 做了什么？** 通过使用这个 Hook，你可以告诉 React 组件需要在渲染后执行某些操作。React 会保存你传递的函数（我们将它称之为 “effect”），并且在执行 DOM 更新之后调用它。在这个 effect 中，我们设置了 document 的 title 属性，不过我们也可以执行数据获取或调用其他命令式的 API。

**为什么在组件内部调用 `useEffect`？** 将 `useEffect` 放在组件内部让我们可以在 effect 中直接访问 `count` state 变量（或其他 props）。我们不需要特殊的 API 来读取它 —— 它已经保存在函数作用域中。Hook 使用了 JavaScript 的闭包机制，而不用在 JavaScript 已经提供了解决方案的情况下，还引入特定的 React API。

**`useEffect` 会在每次渲染后都执行吗？** 是的，默认情况下，它在第一次渲染之后*和*每次更新之后都会执行。（我们稍后会谈到[如何控制它](https://react.docschina.org/docs/hooks-effect.html#tip-optimizing-performance-by-skipping-effects)。）你可能会更容易接受 effect 发生在“渲染之后”这种概念，不用再去考虑“挂载”还是“更新”。React 保证了每次运行 effect 的同时，DOM 都已经更新完毕。

### 无需清除的 effect

### 需要清除的 effect

- effect 返回一个函数，React 将会在执行清除操作时调用它：

**为什么要在 effect 中返回一个函数？** 这是 effect 可选的清除机制。每个 effect 都可以返回一个清除函数。如此可以将添加和移除订阅的逻辑放在一起。它们都属于 effect 的一部分。

**React 何时清除 effect？** React 会在组件卸载的时候执行清除操作。

### 在依赖列表中省略函数是否安全？

### vs Class 组件



### Effect 的提示

#### 使用多个 Effect 实现关注点分离

#### 为什么每次更新的时候都要运行 Effect

#### 通过跳过 Effect 进行性能优化

## `useContext`

接收一个 context 对象（`React.createContext` 的返回值）并返回该 context 的当前值。当前的 context 值由上层组件中距离当前组件最近的 `<MyContext.Provider>` 的 `value` prop 决定。



useReducer

## 自定义 Hook

## Hook 使用规则

- 只能在**函数最外层**调用 Hook。不要在循环、条件判断或者子函数中调用。
- 只能在 **React 的函数组件**中调用 Hook。不要在其他 JavaScript 函数中调用。（还有一个地方可以调用 Hook —— 就是自定义的 Hook 中，我们稍后会学习到。）



- [React Docs](https://beta.reactjs.org/learn)

- 👍[React Hooks: Managing State With useState Hook](https://dev.to/pbteja1998/react-hooks-managing-state-with-usestate-hook-4689)
- [React Hooks - useState](https://dev.to/brettblox/react-hooks-usestate-43en)
- [5 use cases of the useState ReactJS hook](https://dev.to/colocodes/5-use-cases-of-the-usestate-reactjs-hook-4n00)
- [Making Sense of React Hooks](https://dev.to/dan_abramov/making-sense-of-react-hooks-2eib)
- [Avoiding race conditions and memory leaks in React useEffect](https://dev.to/saranshk/avoiding-race-conditions-and-memory-leaks-in-react-useeffect-3mme)
- [How to use async function in React hooks useEffect (Typescript/JS)?](https://javascript.plainenglish.io/how-to-use-async-function-in-react-hook-useeffect-typescript-js-6204a788a435)
- [Cleaning up Async Functions in React's useEffect Hook (Unsubscribing)](https://dev.to/elijahtrillionz/cleaning-up-async-functions-in-reacts-useeffect-hook-unsubscribing-3dkk)
- [Guide to React Hook-useContext()](https://dev.to/srishtikprasad/guide-to-react-hook-usecontext-3lp7)

- [Demystifying React Hooks: useContext](https://dev.to/milu_franz/demystifying-react-hooks-usecontext-5g4a)
- [Replace lifecycle with hooks in React](https://dev.to/trentyang/replace-lifecycle-with-hooks-in-react-3d4n)
- [React Hooks Best Practices in 2022](https://dev.to/kuldeeptarapara/react-hooks-best-practices-in-2022-4bh0)
- [Awesome Things Related To React Hooks](https://dev.to/said_mounaim/awesome-things-related-to-react-hooks-30c4)

- [React Hooks: Memoization](https://medium.com/@sdolidze/react-hooks-memoization-99a9a91c8853)
- [The Iceberg of React Hooks](https://medium.com/@sdolidze/the-iceberg-of-react-hooks-af0b588f43fb)
- [How to use useReducer in React Hooks for performance optimization](https://medium.com/crowdbotics/how-to-use-usereducer-in-react-hooks-for-performance-optimization-ecafca9e7bf5)
- [React Hooks: useCallback and useMemo](https://blog.hackages.io/react-hooks-usecallback-and-usememo-8d5bb2b67231)
- [React Hooks - Understanding Component Re-renders](https://medium.com/@guptagaruda/react-hooks-understanding-component-re-renders-9708ddee9928)
- https://medium.com/capbase-engineering/asynchronous-functional-programming-using-react-hooks-e51a748e6869
- [6 Reasons to Use React Hooks Instead of Classes](https://blog.bitsrc.io/6-reasons-to-use-react-hooks-instead-of-classes-7e3ee745fe04)
