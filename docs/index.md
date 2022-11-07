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

### 初级

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

总之，不管你如何操作数组或者数组中的 item，记得给 setter 函数一个新的数组吧。

#### 惰性初始化

从上文中我们可以知道 useState 可以接受任意类型的数据作为初始状态。但有时我们想对初始化的状态先做一些计算操作，比如对数组类型的过滤，并且考虑到初始状态只有在组件的 mounted 阶段有用，所以我们期望这些计算操作仅在初始化阶段执行一次就好。那么我们可能这么写代码：

```jsx
import React, { useState } from "react";

function getInitialValue() {
  console.log('状态初始化时会被执行');
  // ...可以添加一些额外逻辑
  return 0;
}

function Counter() {
  const [count, setCount] = useState(getInitialValue());
  function increment() {
    setCount(count + 1);
  }
  return <button onClick={increment}>{count}</button>;
}
```

当你点击 button 并查看日志的时候，你会发现：

- getInitialValue 函数会在每次触发 click 事件的时候执行，这意味着每次渲染的时候都调用了 getInitialValue 函数
- 但是 getInitialValue 仅在第一次执行的时候是有用的，后面的每次执行结果都会被舍弃，因为后续的状态都使用的是传给 setter 函数的值
- 这种行为并不符合我们预期，通常 getInitialValue 中很可能做些计算开销很大的操作，这会影响到应用性能

useState 也可以接受一个函数作为初始状态。当初始状态是一个函数的时候，React 只会在组件的第一次挂着阶段调用函数，获取初始状态，在后续的更新阶段并不会再次调用，因此我们通常可以通过给 useState 传入一个函数，让函数做一些计算操作，来获取一个目标初始状态。

如果想要实现仅执行一次的效果，我们可以给 useState 传入一个 callback function，而不是一个函数返回的结果，并且这个 callback 被执行的时候会返回初始状态。

代码示例：

```jsx
import React, { useState } from "react";

function getInitialValue() {
  console.log('getInitialValue is getting executed');
  // ... do some expensive operations
  return 0;
}

function Counter() {
  const [count, setCount] = useState(getInitialValue);
  function increment() {
    setCount(count + 1);
  }
  return <button onClick={increment}>{count}</button>;
}
```

上面的代码在初始挂载阶段，你可以在控制台看到执行 getInitialValue 输出的日志，当你再点击 button 更新 count 的时候，发现 useState 并没有再次执行 getInitialValue，这就是**状态懒加载**。

### 进阶

#### 保存与重置状态

我们知道页面的渲染过程可以简单描述为：浏览器将 HTML 转为 DOM 树，CSS 转为 CSSOM 树，再将两者合并为渲染树，最终将渲染树渲染到页面中。

在当前组件化开发思想的影响下，我们在开始构建页面的时候，通常会将整个页面视为一颗组件树，然后将其拆分为大大小小的不同组件，组件开发完后，我们会将组件像搭积木一样，再组成页面。

组件之间的状态是独立的，React 会根据组件在 **UI 树**中的位置去 Track 每个组件的状态。在组件重新渲染的时候，你可以保留或者重置状态。 

```jsx
function Counter({ isFancy = false }) {
  const [score, setScore] = useState(0);
  const [hover, setHover] = useState(false);

  let className = 'counter';
  if (hover) {
    className += ' hover';
  }
  if (isFancy) {
    className += ' fancy';
  }

  return (
    <div
      className={className}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      <h1>{score}</h1>
      <button onClick={() => setScore(score + 1)}>
        Add one
      </button>
    </div>
  );
}


```



```js
import { useState } from 'react';

export default function App() {
  const counter = <Counter />;
  return (
    <div>
      {counter}
      {counter}
    </div>
  );
}
```



React 在这中间的主要作用就是将我们写的 JSX 结构转化为一棵虚拟 DOM 树，去与浏览器页面的对应结构进行对比，然后更新目标节点。

当你给一个 React  component 定义了一个组件 state 变量时，你或许认为 state 变量一直存在于组件中，由组件对自己的 state 变量进行管理，其实 state 变量一直是由 React 进行管理的。React 会基于组件在 UI 树的位置，将其管理的 state 变量与组件准确关联起来。

只要组件在 UI 树中被渲染，React 就会保存其 state。并且在后续的更新中， UI 树中相同的位置渲染了相同的组件，则 React 会一直保存与该组件相关的 state。

当你在 UI 树中的同一位置(节点)渲染了不同的组件时，React 会重置整个子组件树状态。

如果你想要在每次渲染的时候保存组件的 state ，则每次重新渲染的 UI 树结构必须匹配，如果结构不匹配，当 组将从 UI 树中移除的时候， React 会销毁其 state。



#### 如何在相同的位置重置状态



```jsx
function Counter({ person }) {
  const [score, setScore] = useState(0);
  const [hover, setHover] = useState(false);

  let className = 'counter';
  if (hover) {
    className += ' hover';
  }

  return (
    <div
      className={className}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      <h1>{person}'s score: {score}</h1>
      <button onClick={() => setScore(score + 1)}>
        Add one
      </button>
    </div>
  );
}

```





```jsx
import { useState } from 'react';

export default function Scoreboard() {
  const [isPlayerA, setIsPlayerA] = useState(true);
  return (
    <div>
      {isPlayerA ? (
        <Counter person="Taylor" />
      ) : (
        <Counter person="Sarah" />
      )}
      <button onClick={() => {
        setIsPlayerA(!isPlayerA);
      }}>
        Next player!
      </button>
    </div>
  );
}

```



方法一：在不同的位置渲染组件

```jsx
import { useState } from 'react';

export default function Scoreboard() {
  // ...
  return (
    <div>
      {isPlayerA &&
        <Counter person="Taylor" />
      }
      {!isPlayerA &&
        <Counter person="Sarah" />
      }
      // ...
  );
}

```

方法二：为组件标签添加一个唯一的 key

```jsx
export default function Scoreboard() {
  // ...
  return (
    <div>
      {isPlayerA ? (
        <Counter key="Taylor" person="Taylor" />
      ) : (
        <Counter key="SarTaylorah" person="Sarah" />
      )}
      // ...
    </div>
  );
}
```

- 当切换的时候，两个组将的 state 不会被保存，因为它们有不同的 key
- 不同的 key ，React 以 key 作为组件的位置标记而不是其在父组件中的顺序。



#### 避免冗余与重复

- 创建的状态是否会引起冲突矛盾
- 在另一个状态变量中是否已经有相同的信息可用?
- 能否根据一个状态的相反状态得到一个另一个状态

#### 原则

在一个组件中会可能存在多个 state ，你可以选择 JavaScript 中的任意数据类型，这里有几条原则可以帮助你创建一个更合理的 state 的结构：

- 合并相关状态，如果你总是需要同时更新两个或者多个 state 变量，那么你可以考虑将这些 state 变量组合成一个 state 变量
- 避免状态矛盾，当一个 state 结构与其他 state 相互矛盾时，你应该避免这种情况，比如存在多个 state 变量用于描述或记录同一操作的不同状态时，你就应该讲这些相互矛盾的 state 合并在一起。
- 避免状态冗余，如果当前状态在组件渲染期间可以通过 props 或者 其他 state 变量计算出来，那么你没有必要通过 useState 对其进行转换，例如存在一个 state ，它的最新状态总是需要根据其他状态进行计算更新，那么你应该将其从组件 state 中提取出来。放在组件顶层空间，由组件渲染阶段自动完成 state 的更新
- 避免状态重复，当在多个 state 变量或者嵌套对象中存在相同的数据时，很难进行状态同步，你应该尽量减少重复。这条原则多用于数组类型中，当需要对数组项进行操作时，我们最好选择记录数组项的下标或者 id ，而不是去记录数组项
- 避免深层嵌套，深层次的嵌套结构是非常不利于数据更新的，因为你需要层层解构，如果可以，尽可能将数据拍平。

- 将两个或多个组件中需要共享的状态提升到最近公共父组件



#### 组件状态与其在UI树中的位置紧紧关联

- 这个位置是在 UI 树中的位置 而不是 JSX 中的位置

#### 在相同的位置，相同的组件会维持状态

#### 在相同的位置，不同的组件则会重置状态

如果你想要在每次渲染中维持组件状态，那么你需要保证每次渲染中 UI 树 的结构是一样的。



#### 在相同的位置，重置状态

通过 key 来重置状态

- 在组件渲染期间通过计算获取状态

- 状态提升，在组件间共享组件状态

- 保持与重置状态，key

- reducer 对 更新逻辑进行整合管理

- 通过 context 实现深层共享

- reducer 结合 context 一起使用

  

## useReducer Hook

有时候你会发现，在写组件的时候，随着你的业务逻辑变得复杂，组件的代码量也会变得越来越多、更新 state 的事件函数也会越来越多，并且 state 更新逻辑分散在组件的各个事件函数中，这使得你的组件代码难以阅读、进行状态维护。对于这种情况，你就可以使用 userReducer hook 将所有的 state 更新逻辑合并到一个被称为 reducer 的纯函数中。

- 将更新 state 的逻辑转换为 dispatch action
- 写一个 render 纯函数
- 在组将中使用 纯函数

创建 reducer 函数

```jsx
import {useState} from 'react';
import AddTask from './AddTask.js';
import TaskList from './TaskList.js';

export default function TaskApp() {
  const [tasks, setTasks] = useState(initialTasks);

  function handleAddTask(text) {
    setTasks([
      ...tasks,
      {
        id: nextId++,
        text: text,
        done: false,
      },
    ]);
  }

  function handleChangeTask(task) {
    setTasks(
      tasks.map((t) => {
        if (t.id === task.id) {
          return task;
        } else {
          return t;
        }
      })
    );
  }

  function handleDeleteTask(taskId) {
    setTasks(tasks.filter((t) => t.id !== taskId));
  }

  return (
    <>
      <h1>Prague itinerary</h1>
      <AddTask onAddTask={handleAddTask} />
      <TaskList
        tasks={tasks}
        onChangeTask={handleChangeTask}
        onDeleteTask={handleDeleteTask}
      />
    </>
  );
}

let nextId = 3;
const initialTasks = [
  {id: 0, text: 'Visit Kafka Museum', done: true},
  {id: 1, text: 'Watch a puppet show', done: false},
  {id: 2, text: 'Lennon Wall pic', done: false},
];

```



第一步：将设置状态逻辑转换为 dispatch action

```js
// 负责添加任务
function handleAddTask(text) {
  setTasks([
    ...tasks,
    {
      id: nextId++,
      text: text,
      done: false,
    },
  ]);
}
// 负责更新任务
function handleChangeTask(task) {
  setTasks(
    tasks.map((t) => {
      if (t.id === task.id) {
        return task;
      } else {
        return t;
      }
    })
  );
}
// 负责删除任务
function handleDeleteTask(taskId) {
  setTasks(tasks.filter((t) => t.id !== taskId));
}
```

更新后：

```js
function handleAddTask(text) {
  dispatch({
    type: 'added',
    id: nextId++,
    text: text,
  });
}

function handleChangeTask(task) {
  dispatch({
    type: 'changed',
    task: task,
  });
}

function handleDeleteTask(taskId) {
  dispatch({
    type: 'deleted',
    id: taskId,
  });
}
```

- 在事件处理函数中没有通过 setter 函数更新 state，而是通过 dispatch 函数描述用户的动作。
- 使用 render 管理状态与直接通过 setter 函数更新状态有所不同，setter 函数是直接告诉 React 需要做什么，而 reducer 是通过 dispacth 函数用于描述用户刚刚做了什么，
- 在上面的代码中我们给 dispatch 函数传递了一个对象，这个对象在 React 中，通常被称为 action。
- action 对象可以有任意类型的属性，但是通常会有一个 type 属性用于描述 **发生了什么**，而其他字段则作为 荷载，



##### 写一个 rendcer 纯函数

- 我们将所有的 state 更新逻辑放在 reducer 函数中，reducer 函数接收两个参数：当前 state 与 action 对象，并且它需要返回一个新的 state。
- reducer 函数都存在于组件函数外部，因此我们可以将其提取到组件文件外部。专用于做 state 更新操作。

```js
function tasksReducer(tasks, action) {
  switch (action.type) {
    case 'added': {
      return [
        ...tasks,
        {
          id: action.id,
          text: action.text,
          done: false,
        },
      ];
    }
    case 'changed': {
      return tasks.map((t) => {
        if (t.id === action.task.id) {
          return action.task;
        } else {
          return t;
        }
      });
    }
    case 'deleted': {
      return tasks.filter((t) => t.id !== action.id);
    }
    default: {
      throw Error('Unknown action: ' + action.type);
    }
  }
}

```



第三步：在组件中使用 reducer 函数。

- 从组件中导出 useReducer hook

```jsx
import {useReducer} from 'react';
```

- 传入 reducer 函数 & 初始 state

```js
const [tasks, dispatch] = useReducer(tasksReducer, initialTasks);
```

- useReducer 函数会返回两个值，一个是 state 的值，一个是 dispatch 函数，用于派发 action 对象至 reducer  函数。

完成上面三步，你可以看到，因为 reducer 函数聚合了所有 state 的更新逻辑，所以可以一看看到所有的 state 更新逻辑，并且组件函数也不再臃肿。

### useState VS useReducer

1. **代码体积方面：**

这个需要结合具体的 state 变量类型和组件中的业务逻辑来说，如果 state 变量只是简单的 boolean 、number 、string 类型，则使用 useState 更直接，代码可读性也更好，如果 变量类型是 object 或者 array 类型并且函数组件中存在多个事件处理函数用于更新 state 变量，则使用 useReducer 更高效、代码可读性更好，因为 useReducer 可以聚合所有 state 更新操作，并避免组件代码臃肿。具体例子，可以结合表单更新或者表格的增、删、改、查就可以体会到。

2. **测试方面**：

这方面应该是 useReducer  完胜。因为 useReducer 函数必须是纯函数，没有任何外部依赖，所以你可以将其导出进行测试并进行断言操作查看具体的 state & action 对象情况。

3. **调试方面**：

当 useState 出现错误时，很难判断状态设置错误的具体位置以及原因。而使用 useReducer，你可以在 reducer 中添加 console 日志，以查看状态的具体更新情况，以及它发生的原因(由于哪个操作)。如果每个 actions 对象都是正确的，你就会知道错误出在 reducer 函数逻辑中。但是，与 useState 相比，您必须判断每种情况。

4. **两者的关系**

实际上，在 React 内部，useState 就是用 useReducer 实现的，useState 返回的函数内部封装了一个 dispatch。用 useReducer 实现 useCustomState：

```js
function useCustomState(initialState) {
  
  // 特殊的 reducer
  const reducer = (state, action) => {
    if (typeof action === 'function') {
      return action(state);
    }
    return action;
  };
  
  const [state, dispatch] = useReducer(initialState, reducer);

  // setState 和 dispatch 一样引用也不变的
  const setState = useCallback(action => {
    dispatch(action);
  }, []);

  return [state, setState];
}
```

## useContext

useContext hook 主要解决的是数据透传与共享的问题。在业务开发过程中，经常会遇到需要将父组件的数据传递给多个子组件或者c孙组件的情况，如果全部采用 props 层层传递的话，会使代码变得非常冗长，不便于组件状态的维护管理，为了解决这个问题，React 提供了一个可以共享上下文的 Hook —— useConext，useContext 可以使父组件将自己的状态共享给其任意子孙组件，不管这个组件层级有多深，而不是通过 props 的方式。

代码示例：

```jsx
function Heading({ level, children }) {
  switch (level) {
    case 1:
      return <h1>{children}</h1>;
    case 2:
      return <h2>{children}</h2>;
    case 3:
      return <h3>{children}</h3>;
    case 4:
      return <h4>{children}</h4>;
    case 5:
      return <h5>{children}</h5>;
    case 6:
      return <h6>{children}</h6>;
    default:
      throw Error('Unknown level: ' + level);
  }
}

function Section({ children }) {
  return (
    <section className="section">
      {children}
    </section>
  );
}

export default function Page() {
  return (
    <Section>
      <Heading level={1}>Title</Heading>
      <Section>
        <Heading level={2}>Heading</Heading>
        <Heading level={2}>Heading</Heading>
        <Heading level={2}>Heading</Heading>
        <Section>
          <Heading level={3}>Sub-heading</Heading>
          <Heading level={3}>Sub-heading</Heading>
          <Heading level={3}>Sub-heading</Heading>
          <Section>
            <Heading level={4}>Sub-sub-heading</Heading>
            <Heading level={4}>Sub-sub-heading</Heading>
            <Heading level={4}>Sub-sub-heading</Heading>
          </Section>
        </Section>
      </Section>
    </Section>
  );
}
```

- 上面代码示例中，Heading 组件可接受一个 level 属性用于标题层级显示
- 你会发现在相同的 Section 组件中的多个 Heading 组件，都接受了相同的 level 属性
- 这种情况对于代码维护非常困难

接下来我们就可以使用 useContext 重构上面的代码，如果对于同一层级的 Heading 组件，我们可以将 level 传递给其最近的父组件 Section。再由 Section 组件传递给 Heading 组件，则可以减少部分重复代码：

```jsx
export default function Page() {
  return (
    <Section level={1}>
      ...
      <Section level={2}>
        ...
        <Section level={3}>
          ...
```

- 在 Page 组件中我们将需要直接传递给 Heading 的 level 属性传递给 Section 组件，再由 Section 组件传递给子组件 Heading。

那 Section 组件中的 children 如何接收 level 属性？我们可以使用 Context API 进行重构，主要需要三步操作：

第一步：创建一个 Context。你需要从 react 中导出 createContext API

```jsx
// LevelContext.js
import { createContext } from 'react';

export const LevelContext = createContext(1);
```

- createContext 可以接受任意数据类型的参数作为初始值，这里传递的是一个 number 类型的

第二步：在父组件 Page 中派发数据

```jsx
import { LevelContext } from './LevelContext.js';

export default function Section({ level, children }) {
  return (
    <section className="section">
      <LevelContext.Provider value={level}>
        {children}
      </LevelContext.Provider>
    </section>
  );
}
```

- 所有需要父组件数据的子孙组件必须被 LevelContext 的派发器**包裹**起来。

第三步：在 Heading 组件中获取数据

```jsx
import { useContext } from 'react';
import { LevelContext } from './LevelContext.js';

export default function Heading({ children }) {
  const level = useContext(LevelContext);
  switch (level) {
    // 省略部分代码...
  }
}
```

- 在目标组件中调用 useContext hook，并将 LevelContext 传递给 useContext。
- 这个操作也就是告诉 Heading 组件需要读取 LevelContext 的数据

经过这三步以后，你已经可以看到一个符合预期的 Page 结构。

Page 组件的代码现在是这样的：

```jsx
export default function Page() {
  return (
    <Section level={1}>
      ...
      <Section level={2}>
        ...
        <Section level={3}>
          ...
```

- 这意味着你仍然需要明确 Section 组件属于哪个层级。

由于 Context API 可以使当前组件获取其上层派发的数据。也就是说 Section 组件可以获取其上层 Scetion 组件派发的数据。因此我们可以在 Section 组件中使用 useContext Hook 来获取当前的 level，而不是通过给 Section 传递 props。

代码示例：

```jsx
import { useContext } from 'react';
import { LevelContext } from './LevelContext.js';

export default function Section({ children }) {
  // 获取上层组件派发的 LevelContext
  const level = useContext(LevelContext);
  return (
    <section className="section">
      <LevelContext.Provider value={level + 1}>
        {children}
      </LevelContext.Provider>
    </section>
  );
}
```

在 Page 组件中去除 Section 标签上的 props：

```jsx
export default function Page() {
  return (
    <Section>
      ...
      <Section>
        ...
        <Section>
          ...
```

现在组件嵌套层级有多深，Heading 组件 & Section 组件都是通过读取 LevelContext 来获取 level，Section 又通过 LevelContext 派发器对子组件进行包裹，保证了组件间的层级关系。

### useContext VS Props





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
- [2 use cases of the useReducer ReactJS hook](https://dev.to/colocodes/2-use-cases-of-the-usereducer-reactjs-hook-ine)
- [React Hooks: useState 和 useReducer 有什么区别？](https://zhuanlan.zhihu.com/p/336837522)
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
