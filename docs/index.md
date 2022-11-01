# React Hooks

为什么要有 Hooks:

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

#### 理解两个关键阶段 render & commit

```jsx
import { useState } from 'react';

function CountButton() {
  // 初始化 state
  const [count, setCount] = useState(0)
  
  const onClick = () => {
    setCount(count)
  }
  
  const random = Math.floor(Math.random() * 100000000000)
  
  return (
    <h1 style={{ color: 'red' }}>判断是否重新渲染: {random}<h1>
    <button onClick={onClick}>
    	{ count }
    </button>
  )
}
```

#### 理解 state snapshot

在正常的 JavaScript 执行的心智模型中，在函数中代码是由上到下一行一行的执行的。但是React 中的状态变量与 JavaScript 变量在函数中的表现行为并不一样。

先看下面一段代码示例：

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

- 上面代码初始状态为 0，点击 button，会执行 onClick 函数
- 以通常的思维，代码的执行过程是：打印0、执行 setCount, count 加 1 、打印 1
- 但是实际效果却是：打印0、执行setCount, count 加 1 、打印 0。

React 中的状态变量更像当前组件状态的一个快照，会以不变的状态一直存在于当前组件函数中。

我们知道 React 触发渲染的方式有两种：

- 一种是在组件初始化阶段进行的渲染。

- 另一种就是通过执行 setter 函数更新状态变量，重新触发渲染。

你会发现执行 setCount 函数后，并没有立即更新 count。第二个 console 访问的还是当前的状态，setCount 的表现行为更像是一个异步的函数。

- 当 setter 函数改变 state，再次触发渲染时，React 会调用函数组件。
- 获取一张根据当前状态计算出的新的  JSX  快照。
- React 会将新的 JSX 快照与视图进行对比更新。

作为 React  的状态存储器，state 并不会在组件函数执行完后立即销毁，而是一直存在于 React 上下文中，React 会为你保存 state。

每次 React 重新调用组件函数时，它会根据罪行的状态为你保存一张当前渲染状态的快照。当视图发生交互事件，通过 setter 函数触发重新渲染时。React 会首先更新状态快照，并根据状态快照计算一个新的 UI 快照与当前视图进行对比更新。

而每次 JSX 快照中的事件所能访问的状态都是基于当前状态快照的。

我们再来看另一个例子，下面的代码我们期望实现：

- 点击 +1 时，score 会增加 1
- 点击 +3 时，通过执行三次 increment，使 score 增加 3 的效果

```jsx
import { useState } from 'react';

export default function CountButton() {
  const [score, setScore] = useState(0);

  function increment() {
    setScore(score + 1);
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

但实际情况是，点击 +3，你会发现，score 只进行了一次叠加，并没有像期望的那样。

state snapshot 就可以很好的解释上面代码发生了什么：

当通过执行 setScore 函数，触发重新渲染时，React 并不会立即改变当前状态快照，当前快照中的 score 是 0 。三个 setter 函数在同一状态快照中，仅能访问当前快照中的 score，因此每次点击 +3 ，仍然只会进行一次叠加。

过程类似于：

```javascript
console.log(score);  // 0
setScore(score + 1); // setScore(0 + 1);
console.log(score);  // 0
setScore(score + 1); // setScore(0 + 1);
console.log(score);  // 0
setScore(score + 1); // setScore(0 + 1);
console.log(score);  // 0
```

**在一次渲染中状态变量的值是一直保持不变的**，即使它的事件处理函数是异步的。当 React 调用你的组件函数重新获取 UI 快照时，它的状态就被固定了下来。

可以通过下面的代码理解下：

```jsx
import { useState } from 'react';

export default function Counter() {
  const [number, setNumber] = useState(0);

  return (
    <>
      <h1>{number}</h1>
      <button onClick={() => {
        setNumber(number + 5);
        setTimeout(() => {
          alert(number);
        }, 3000);
      }}>+5</button>
    </>
  )
}

```

当 alert 运行的时候， number 已经发生了改变，但是你可以发现点击+5后，alert 的 number 仍然是上一个状态，这是因为 React 使用 state 快照进行了调度处理，保证 alert 访问的状态仍然是触发 setTimeout 时的值。

#### 理解状态可读不可变

1. 对于 string、boolean、number 这种**原始类型的 state**。我们会通过 setter 函数设置一个新的值，来触发组件重新渲染。如果使用原始值会发生什么？

来看段代码：

- 我们用 random 来标记组件是否重新渲染
- 在 onClick 的时候，调用 setter 函数，但是保持状态不变

```jsx
import { useState, useEffect } from 'react'

function Counter() {
  const [count, setCount] = useState(0)
  const random = Math.floor(Math.random() * 100000000000)
  return (
    <div>
      <h1 style={{ color: 'red' }}>{random}</h1>
      <h2>{count}</h2>
      <button onClick={() => {
        setCount(count)
      }}>ADD</button>
    </div>
  )
}

export default Counter

```

当你点击 ADD 的时候就会发现，虽然调用了 setCount 函数，但是组件别没有重新渲染。只有真正通过 setCount 函数改变 count 时，组件才会触发重新渲染：

```js
setCount(count + 1)
```

这个操作关键的地方在于：你**通过创建一个新的值对原来的状态完成了更新**，并没有更改原来的状态。

2. 我们再来看一下**引用类型的 state**，比如说我们定义了一对象：

```jsx
const [position, setPosition] = useState({x: 0, y: 0})
```

我们可以直接在代码中进行更改：

```js
const onClick = () => {
  position.x = 800
  console.log(position)
}
```

当用户触发 onClick 事件时，我们更改了 position 的 x 属性，并且可以通过日志看到 position 确实发生了变化。但是并没有触发组件的重新渲染。

这是因为引用类型虽然在 React 函数组件中是可变的，但是你需要将其**视为不可变类型**，在更新的时候通过创建一个新的对象，来触发更新操作。

```js
const onClick = () => {
  setPosition({
    ...position,
    x: 800
  })
}
```

上面的代码我们为 setPosition 传入了一个新的对象，并通过对原始 position 的进行解构操作，来保留不需要更改的属性。

原理是 React 源码中通过 **Object.is** 对 state 的新旧值进行了浅比较，只有当新旧状态不同时，才会执行触发更新操作。

**所以在 React 中，不管是原始类型还是引用类型的的状态，你都需要将其视为只可读不可变的。**当你想要更新一个状态的时候，就传入一个新的 value 通过 setter 函数来替换状态吧。

当你理解了 React 的状态可读不可变逻辑，就能很轻松的学会对象类型与数组类型的操作方法了：

- 更新对象类型状态
  - 对于普通的对象在更新时，给 setter 函数传入一个新的字面量对象，通过 ... 解构运算符保留不需要更改的属性，对目标属性设置新的值
  - 对于嵌套类型的对象，同样需要传入一个新的字面量对象，但是需要对对象进行多次解构操作。

```jsx
const [person, setPerson] = useState({
  name: 'Niki de Saint Phalle',
  artwork: {
    title: 'Blue Nana',
    city: 'Hamburg',
    image: 'https://i.imgur.com/Sd1AgUOm.jpg',
  }
});
// 更新外层属性
function handleNameChange(e) {
  setPerson({
    ...person,
    name: e.target.value
  });
}
// 更新嵌套属性
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

- 更新数组类型状态
  - 添加操作，需要用 concat 方法或者 [...arr] 展开语法
  - 删除操作，使用 filter 或 slice 方法
  - 替换操作，使用 map 方法
  - 排序操作，首先需要对数组进行克隆操作

```jsx
const [artists, setArtists] = useState([]);
// 添加
setArtists( // Replace the state
  [ // with a new array
    ...artists, // that contains all the old items
    { id: nextId++, name: name } // and one new item at the end
  ]
);

// 删除
setArtists(artists.filter(a => a.id !== artist.id));

// 替换
const nextArtistList = artists.map(item => {
  // 进行一些逻辑操作
});
// Re-render with the new array
setArtists(nextArtistList);

// 排序
const sortArtistList = artists.sort(item => {
  // 进行一些逻辑操作
});
// Re-render with the new array
setArtists(sortArtistList);
```

总之，不管你如何操作数组或者数组中的 item，记得给 setter 函数一个新的数组。

#### 惰性初始化

useState 也可以接受一个函数作为初始状态。当初始状态是一个函数的时候，React 只会在组件的第一次挂着阶段调用函数，获取初始状态，在后续的更新阶段并不会再次调用，因此我们通常可以通过给 useState 传入一个函数，让函数做一些计算操作，来获取一个目标初始状态。

```jsx
import React, { useState } from "react";

function getInitialValue(list) {
  console.log('获取初始状态')
 	return list.filter(item => item.price > 50)
}

function Counter() {
  const bookList = [
    {
      title: 'ESMAScript 入门',
      price: 45
    },
    {
      title: 'JavaScript 权威指南',
      price: 99
    },
    {
      title: 'JavaScript 高级程序设计',
      price: 89
    },
    {
      title: '你不知道的 JavaScript',
      price: 39
    }
    ,
    {
      title: 'JavaScript 精髓',
      price: 29
    }
  ]
  const [book, setBook] = useState(() => getInitialValue(bookList));
  function increment() {
    setCount(count + 1);
  }
  return (
    <div>
     <input/> <button onClick={increment}>Add Book</button>
      <ul>
        {
          book.map(item => {
            return (
             <li key={item.title}>
                书名：{item.title} ---
                价格：{item.price}
            </li>
            )
          })
        }
      </ul>
    </div>
  );
}
```



#### 为什么对于引用类型在更新阶段需要传入一个新的 state。



### 函数式更新

### 引用类型更新

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
