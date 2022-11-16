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

从代码表现来看 使用 useContext 可以使组件标签看上去更简洁干净。这很可能导致你在开发过程中过度使用 useContext。实际开发过程中如果真的遇到在组件树中需要深层传递 props 的情况，也并不意味这你必须使用 useContext 来解决问题。

这种情况下，在使用 useContext 之前还有下面两个方面需要你考虑。

1. **当在组件层级树中，每层都需要顶层组件分享 props 时，可以选择 props 来解决问题**。当你的组件很普通的时候，通过给很多组件传递很多 props 的情况很常见。这样做虽然看上去很麻烦，你需要给每个组件添加 props 属性，但是这种方式可以让你的组件**数据流**很清晰，一眼便可以让你知道哪个组件使用了哪些 props，对于后续的维护也很方便。
2. **当面临 props 透传时，可以将子组件抽离抽离出来，将子组件作为 props 传递给透传组件**。当在实际开过过程中，如果遇到组件透传的情况：你需要将 props 传递多层，但是这些负责传递的组件并不使用 props 数据，这意味着你可以将实际使用 props 数据的组件抽离出来，将组件作为 props 传递。比如有一个 <Layout posts={posts} /> 组件，Layout 组件会透传数据，则你可以将 Layout 中实际使用该 props 的 Post 组件抽离出来传递给 Layout。让 Post 组件直接接收数据，像这样：<Layout><Posts posts={posts} /></Layout>。这可以减少负责**维护数据的组件**与实际**使用数据的组件**之间的层级数量。
3. 适合使用 useContext 的场景：主题、当前用户信息、路由、状态管理。

### Context & Reducer 结合使用

通过上面的学习可以知道：

- Reducer 可以将组件的 state 更新逻辑整合在一起
- Context 可以将组件信息向深层传递

为此你可以将 Reducer & Context 结合在一起，使用 Context 将 Reducer  状态与 dispatch 向下传递。



## 逃生舱

## useRef

通过上文可以知道，使用 useState、useReducer、useContext 创建的状态，都是不可变的，一旦更新就会触发组件的重新渲染。但是实际开发过程中你经常需要一些不希望引起组件重新渲染的状态、并且希望在组件的生命周期中，该状态能被一直保持在 React 中。

Refs 就是为了解决这个问题提出来的。

当你需要在组件中一直缓存一些状态，但是并不想因为这些状态的改变而重新触发渲染，那么你可以选择使用 ref。

使用示例：

```jsx
// 1. 从 react 中导出 useRef hook，并在函数组件中调用
import { useRef } from 'react';

export default function Counter() {
  // 2. 调用 useRef 并进行初始化
  let countRef = useRef(0);

  function handleClick() {
    // 3. 当前引用值会发生变化，但是并不会触发组件的重新渲染
    countRef.current = countRef.current + 1;
    console.log(countRef.current)
  }

  return (
    <button onClick={handleClick}>
      You clicked {countRef.current} times
    </button>
  );
}

```

- 当你点击 button 的时候，会发现页面并没有更新 countRef.current 最新值，但是控制台中的 countRef.current 确每次会更新变化
- useRef 会给你返回一个带有 current 属性的对象，你可以通过 ref.current 访问当前值。
- useRef 与 useState 返回的状态不同之处就是：ref.current 的值是可变的，你可以直接通过 ref.current = newValue，进行更改。
- 并且更改 useRef 不会触发组件的重新渲染，这是因为 react 没有对 ref 的值进行 track 操作。

通常我们会在哪种情况下使用 useRef：

- 当你需要操作 DOM 的时候，可以使用 ref 保持对 DOM 的引用
- 当你需要使用 计时器时，可以保持对计时器的引用，以保证在恰当的时机可以重置计时器
- 当你需要记录一些不影响组件重新渲染的状态时。

#### 操作 DOM

```jsx
import { forwardRef, useRef } from 'react';

const MyInput = forwardRef((props, ref) => {
  return <input {...props} ref={ref} />;
});

export default function Form() {
  const inputRef = useRef(null);

  function handleClick() {
    inputRef.current.focus();
  }

  return (
    <>
      <MyInput ref={inputRef} />
      <button onClick={handleClick}>
        Focus the input
      </button>
    </>
  );
}
```



#### 最佳实践

- 将 refs 作为 react 的一个逃生舱。当你需要调用系统或者浏览器的一些原生 API 的时候，refs 是非常有用的。但是当你的组件逻辑合作和数据流需要依赖 ref 的值时，你需要重新思考你的编码方式。
- 在渲染时读取或者更改 ref 的值，如果有些信息需要在渲染时用到，则使用 state 代替。
- React 对 state 的限制不会作用于 refs。例如 state 的行为在每次渲染时更像是一张快照并且不会同步更新。但是 ref 的值是同步立即改变的。因为 ref 本身是一个常规的 JavaScript Object ，
  

### refs vs state

#### React 何时跟新 refs

在 React 中，每次更新会分为两个阶段：

- 阶段一渲染期间，React 会调用组件函数计算出哪些内容应该渲染到视图上
- 阶段二 commit 期间，React 会将计算出来的 DOM 更新到真实的 DOM 上

通常情况下，你不希望在渲染过程中访问 refs。这也适用于持有 DOM 节点的 ref。在第一次渲染期间，DOM 节点还没有创建，因此ref.current 将为空。在渲染更新期间，DOM 节点还没有更新。所以在渲染过程中读取还为时过早。

React 在会在 commit 阶段设置 ref.current。在更新 DOM 之前，React 将受影响的 ref.current 值设置为 null。更新 DOM 之后，React 立即将它们设置为相应的 DOM 节点。

通常，你会从事件处理程序访问 refs。如果你想用一个 ref 来做一些事情，但是没有特定的事件来做它，你可能需要一个 Effect。



## 使用 Effect 进行同步

一些组件需要与外部系统进行同步操作。例如，你或许想基于 React 状态去控制一个非 React 的组件，比如与服务端简历链接、当组件出现在视图的时候，发送一个分析日志。Effects 允许你在渲染之后运行一些代码，以便你可以将组件与 React 外部的某些系统同步。

### 什么是 Effects？它们与事件有何不同之处？

在了解 Effects 之前，你必须熟悉 React 组件内部的两种类型的逻辑：

- 渲染代码(主要负责描述 UI)会一直存在于你的组件顶层。在顶层你可以操作转换 props 、state，并且返回视图所需渲染的 JSX 结构。渲染代码必须是纯函数。像一个数学方程式，仅负责计算结果，而不做其他任何事情。
- 事件处理函数(主要负责交互)是组件内的嵌套函数。它们主要负责执行任务。事件函数可以更新字段、触发 HTTP 请求、进行页面导航。由于事件函数通常负责与用户的交互，所以会触发程序状态的改变。而造成这种变化的行为，我们称为 **副作用**。

**Effects 可以让你明确声明由渲染事件本身引起的副作用，而不是事件函数引起的副作用。**例如在聊天窗口发送一条信息是一个时间，因为它是由用户具体的点击操作引起的。而与服务器建立链接是一个 effect，因为不管是用户的哪个操作，都需要发生链接。

Effects 在视图更新结束后的渲染进程结束时运行，这对于同步 React 组件与外部系统是非常好的时机。

### 如何写一个 Effect

1. 声明一个 Effect。默认情况下，Effect 会在每次渲染后运行。
2. 声明 Effect 依赖。大多数的 Effect 应该仅当需要的时候在运行，而不是每次渲染之后，例如，一个 fade-in 动画应该仅在组件出现的时候运行一次。链接或者断开聊天室，应该仅在组件出现或者消失时运行。你应该通过声明具体的依赖来控制 effect 的运行。
3. 如果有需要，则添加一个 `cleanup` 函数。有些副作用需要明确指出如何停止、撤销或者清除，例如链接需要断开连接、订阅需要取消订阅。

依赖数组中可以包含多个依赖项，只要依赖数组有一项状态发生改变，不同与上一次的渲染，则 React 就会重新渲染。React 内部会使用 Object.is API 对依赖项进行比较。

**在 React 中，渲染期间应该是 JSX 的纯计算操作，不应该有副作用，例如修改操作 DOM **。

在 dev 环境下，React 会默认重复挂载你的组件，这是为了确保你能及时发现 bug。当然你可以通过使用严格模式来避免这个行为

### 什么情况下会导致无限循环

Effects 运行作为渲染的结果，如果不当操作会引发无限循环的情况。

### 使用场景

#### 控制非 React 物料

比如有时你需要添加一个不是 React 写的 UI 物料。例如，你计划向页面添加一个 Map 组件，它有一个 setZoomLevel() 方法，你想要在 React 组件代码中通过状态变量 zoomLevel 来保持 Map 组件的缩放效果。你的 Effect 应该是下面这种写法：

```js
useEffect(() => {
	const map = mapRef.current
  map.setZoomlevel(zoomLevel)
}, [zoomLevel])
```

注意这种情况下不需要 cleanup 函数。在开发环境中，React 将调用两次这个 Effect，虽然会调用两次，但是不会有任何问题，因为两次调用的过程中 zoomLevel 的值是没有变化的，这意味着 React 不会做任何处理。他可能会轻微的变慢，但这不是事，它只会发生在开发环境中，而不是生产环境。

有些 API 或许不允许你连续调用两次。例如，如果你连续调用两次 HTML 原生标签 dialog 的 showModal 方法，它将会抛出错误。这是你可以通过执行一个 cleanup 函数来关闭 dialog。

代码示例：

```js
useEffect(() => {
  const dialog = dialogRef.current;
  dialog.showModal();
  return () => dialog.close();
}, []);
```

#### 订阅事件

如果你在 Effect 中订阅了某些事件，则可以通过 cleanup 函数取消订阅。

```jsx
seEffect(() => {
  function handleScroll(e) {
    console.log(e.clientX, e.clientY);
  }
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
```



- 在开发环境中，会首先调用 addEventListener，然后立即执行 removeEventListener 方法，然后再次调用 addEventListener
- 在生产环境中，仅会调用一次 addEventListener

#### 触发动画

如果你的 Effect 中做了些动画效果，则 cleanup 函数可以将动画效果重置为初始值。

```jsx
useEffect(() => {
  const node = ref.current;
  node.style.opacity = 1; // Trigger the animation
  return () => {
    node.style.opacity = 0; // Reset to the initial value
  };
}, []);
```

#### 获取数据

如果你在 Effect 函数中发起了请求事件，则可以在 cleanup 函数中选择放弃请求或者忽略请求结果。

```jsx
useEffect(() => {
  let ignore = false;

  async function startFetching() {
    const json = await fetchTodos(userId);
    if (!ignore) {
      setTodos(json);
    }
  }

  startFetching();

  return () => {
    ignore = true;
  };
}, [userId]);
```

你不能撤销一个已经发生的网络请求，但是你可以通过 cleanup 函数确保无关的 fetch 影响到你的应用。例如，在一个聊天室中，如果 userId 由 Alice 切换为 Bob 后，cleanup 函数可以确保即使切换到 Bob 之后，有关 Alice 的响应也能被忽略。

#### 发送日志

有时候你可能需要在组件中进行买点或者发送一些日志。

```jsx
useEffect(() => {
  logVisit(url); // Sends a POST request
}, [url]);
```



### 非 Effect 需要再初始化阶段运行，则移动到组件外部

当应用初始化的时候，有些逻辑仅需要运行一次，那么你可以选择将其放在组件外部。

```jsx
if (typeof window !== 'undefined') { // Check if we're running in the browser.
  checkAuthToken();
  loadDataFromLocalStorage();
}

function App() {
  // ...
}
```

#### 非 Effect：购买产品

有时，即使你写了一个 cleanup 函数，也无法避免一些运行两次 Effect 两次所引发的后果。例如，下面的代码，在 Effect 中会发送一个购买产品的 POST 请求：

```jsx
useEffect(() => {
  // 🔴 Wrong: This Effect fires twice in development, exposing a problem in the code.
  fetch('/api/buy', { method: 'POST' });
}, []);
```

你并不想购买两次产品。然而这也是为什么你不能将请求逻辑放在 Effect 中的原因。试想一下，如果用户跳转到了另一个页面然后又回退到本页面，你的 Effect 将运行两次，然而你不想当用户访问页面的时候进行两次购买操作，你想仅在用于点击 button 的时候发起 购买的请求。

由此可以看出，购买操作不是由渲染引起的，而是由一个具体的点击交互操作引起的。因为点击仅会进行一次，所以他应该也仅运行一次。因此，你应该将发起购买请求的代码逻辑从 Effect 中移除，将其放到购买按钮触发的事件函数中:

```jsx
  function handleClick() {
    // ✅ Buying is an event because it is caused by a particular interaction.
    fetch('/api/buy', { method: 'POST' });
  }
```

这说明如果重新挂载的操作影响到拟组建的逻辑，这种情况通常存在 bug。从用户的视角来看，访问一个页面，然后跳转，然后再返回，不应该有所变化。React 在开发环境下的重新挂载逻辑，保证了你的组件不会破坏这个规则。

### 将所有的放在一起

下面的例子可以让你通过实践来感受下 Effect 是如何工作的。

实例代码中，会在 Effect 运行之后，使用 setTimeout 在三秒后调用 console 去打印 input 中的文本。cleanup 函数会取消 timeoutId，点击 Mount the component 开始。

Playground 组件

```jsx
import { useState, useEffect } from 'react';

function Playground() {
  const [text, setText] = useState('a');

  useEffect(() => {
    function onTimeout() {
      console.log('⏰ ' + text);
    }

    console.log('🔵 Schedule "' + text + '" log');
    const timeoutId = setTimeout(onTimeout, 3000);

    return () => {
      console.log('🟡 Cancel "' + text + '" log');
      clearTimeout(timeoutId);
    };
  }, [text]);

  return (
    <>
      <label>
        What to log:{' '}
        <input
          value={text}
          onChange={e => setText(e.target.value)}
        />
      </label>
      <h1>{text}</h1>
    </>
  );
}
```

App 组件

```jsx
import { useState } from 'react';

export default function App() {
  const [show, setShow] = useState(false);
  return (
    <>
      <button onClick={() => setShow(!show)}>
        {show ? 'Unmount' : 'Mount'} the component
      </button>
      {show && <hr />}
      {show && <Playground />}
    </>
  );
}

```

- 首先你会看到控制台输出了：Schedule "a" log`→ `Cancel "a" log` → `Schedule "a" log，三秒之后有输出 "a"
- 正如你在上文所了解到的，额外的调度/取消对是因为React在开发过程中重新挂载组件，以验证你已经很好地实现了 cleanup 函数。
- 现在编辑输入，输入abc。如果你做的足够快，你会看到 Schedule "ab" log 紧接着是 Cancel "ab" log 和 Schedule "abc" log。
- React 总是会在执行下一次渲染的 Effect 之前，先执行 cleanup 函数清除上一次渲染的 Effect。
- 这就是为什么即使您在 input 标签中快速输入，每次最多只调度一次 setTimeout 。编辑输入几次，观察控制台，感受一下Effects 是如何被清理的。



- 然后你再输入一些内容，并且立即点击 “Unmount the component”。
- 你会注意到 cleanup 函数会清理最后一次渲染的 Effect。



- 最后，你可以尝试编辑上面的组件，注释掉 cleanup 函数，因此 timeout 不会被取消。
- 然后尝试快速的输入 abcde。你猜在三秒后发生什么？在 timeout 中的 console 是否会只打印五次 abcde 吗？最终的值并且输出五次
- 实际上，在三秒之后你会看到控制台输出了 logs (`a`, `ab`, `abc`, `abcd`, and `abcde`)，而不是五次 abcde。
- 每个 Effect 都会从与之对应的渲染中获取文本值。
- 文本状态的改变并不重要：一个带有 text = ab 状态渲染中 Effect，所能获取的只能是 text = ab。
- 换句话说 每次渲染的 Effect 是相互隔离的。
- 如果您对这是如何工作的感到好奇，您可以阅读关于闭包的内容。



### 总结：

- 不想事件函数，Effect 是由渲染事件本身引起的而不是有一个特定的交互行为引起的。
- Effect 可以让你的组件与外部系统进行同步操作
- 默认情况下，Effect 会在每次渲染之后运行
- 如果 Effect 所有的依赖值在两次渲染之间没有变换，则React 不会执行 Effect
- 你不能选择你的依赖，依赖是由 Effect 中的代码确定的
- 一个空的依赖数组对应于组件的 mount 阶段。也就是初次渲染到视图的时候
- 当严格模式开启式，React 会 mount 两次组件，以便对你的组件进行压力测试
- 如果你的 Effect 由于重复 mount 打破，你需要立即执行一个 cleanup 函数
- React 会在下一次运行你的 Effect 之前和卸载时，调用 cleanup 函数，



## 你或许不需要 Effect

### 如何移除多于的 Effect

- **你不需要为了 渲染在 Effect 中更新数据。**例如，我们假设你想在渲染之前过滤一个 list，你或许想当  list 改变的时候，通过写一个 Effect 去更新 state 变量。然而这是没用的。当你更新你的组件状态的时候，React 会首先调用你的组件函数去计算出需要渲染到视图上的内容，然后 React 将发生变化的部分 commit 到 DOM 上，更新视图，然后 React 才会运行你的 Effect。如果此时你在 Effect 内部更新 state 变量，React 会重启整个过程。为了避免不必要的渲染，在你的组件顶层转换所有的 数据。无论何时 state 或者 props 发生变化，代码都会自动重新运行。
- **你不需要在 Effect 中处理用户事件**。例如，我们假设你想发送一个 POST 请求，并且当用户购买产品的时候可以展示一些通知信息，当 点击 购买按钮的时候，你想确切的知道发生了什么。当 Effect 运行时，你不知道用户做了什么(例如，用户点击了哪一个 button )。这就是为什么你必须在对应的事件处理函数中处理用户事件。

为了帮助你获取一个正确的感知，让我们看一些相同概念的例子

### 基于 props 或者 state 更新 state

假设你的组件有两个状态变量：firstName 与 LastName。你想通过链接这两个 状态变量计算一个 fullName。而且，你想只要 firstName 与 LastName 发生变化，就去更新 fullName。你首先想到的可能是在添加一个 fullName 状态变量并且在 Effect 中去更新它。

```jsx
function Form() {
  const [firstName, setFirstName] = useState('Taylor');
  const [lastName, setLastName] = useState('Swift');

  // 🔴 避免: 多于的 state 和不必要的 Effect
  const [fullName, setFullName] = useState('');
  useEffect(() => {
    setFullName(firstName + ' ' + lastName);
  }, [firstName, lastName]);
  // ...
}
```

这比必要的要复杂得多。它的效率也很低：它用一个过时的 fullName 值进行整个渲染传递，然后立即用更新的值重新渲染。移除状态变量和 Effect：

```jsx
function Form() {
  const [firstName, setFirstName] = useState('Taylor');
  const [lastName, setLastName] = useState('Swift');
  // ✅ Good: calculated during rendering
  const fullName = firstName + ' ' + lastName;
  // ...
}
```

**当有些值可以基于已存在的 props 或者 state 计算出来的时候，不要将其放在 state 中。而是在渲染时去计算它。**这会使你的代码更快(避免了连续更新)、更简单(移除多于的代码)、更少的潜在 bug(可以避免不同状态变量之间不同步所导致的错误)。如果这种方法给你带来了新的感受，用 React 的方式思考哪些值应该放到 state 中。

### 使用 useMemo 缓存昂贵开销的计算

该组件通过它 props 中的 todos 和 filter 属性，计算出 visibleTodos。你可能会想将结果存储在状态变量中，并在Effect中更新它:

```jsx
function TodoList({ todos, filter }) {
  const [newTodo, setNewTodo] = useState('');

  // 🔴 Avoid: redundant state and unnecessary Effect
  const [visibleTodos, setVisibleTodos] = useState([]);
  useEffect(() => {
    setVisibleTodos(getFilteredTodos(todos, filter));
  }, [todos, filter]);

  // ...
}
```

就像上面的例子一样，这两个都是不需要且不高效的。首先，移除 state & Effect：

```jsx
function TodoList({ todos, filter }) {
  const [newTodo, setNewTodo] = useState('');
  // ✅ This is fine if getFilteredTodos() is not slow.
  const visibleTodos = getFilteredTodos(todos, filter);
  // ...
}
```

在许多情况下，这段代码是 OK 的，可以正常运行! 但是可能 getFilteredTodos() 会很慢，或者你有很多事情要做。在这种情况下，如果一些不相关的状态变量 (如newTodo) 发生了更改，你并不希望需要重新计算 getFilteredTodos()。

你可以缓存(或" memoize ")一个昂贵的计算，通过包装它在useMemo钩子:

```jsx
import { useMemo, useState } from 'react';

function TodoList({ todos, filter }) {
  const [newTodo, setNewTodo] = useState('');
  const visibleTodos = useMemo(() => {
    // ✅ Does not re-run unless todos or filter change
    return getFilteredTodos(todos, filter);
  }, [todos, filter]);
  // ...
}
```

或者写成一行：

```jsx
import { useMemo, useState } from 'react';

function TodoList({ todos, filter }) {
  const [newTodo, setNewTodo] = useState('');
  // ✅ Does not re-run getFilteredTodos() unless todos or filter change
  const visibleTodos = useMemo(() => getFilteredTodos(todos, filter), [todos, filter]);
  // ...
}
```

这个操作意思是告诉 React：你不想重复运行 useMemo 包裹的函数，而是只有当 todos 或者 filter 发生变化的时候，才重新计算。

React  会在初始渲染的时候记住 getFilteredTodos 方法返回的值。在下一次渲染时，会检测 todos 和 filter 是否发生变化。如果他们遇上一次相同，useMemo 将会返回上一次它缓存的结果。如果不同，React 会重新调用被包裹的函数并且再次存储最新的计算结果。

你在 useMemo 中包装的函数会在渲染期间运行，因此这只适用于纯计算。

### 当 prop 发生改变的时候重置所有 state

ProfilePage 组件接受一个 userId 属性，当前页面包含一个评论输入框，并且你使用了一个 comment  作为状态变量，去存储输入框中的值。有一天，你会注意到一个问题：当你从一个简介切换到另一个时，comment 状态没有发生重置。结果，很容易不小心在错误的用户资料上发表评论。为了修复这个问题，你想只要 userId 发生变化的时候就清空 comment 状态变量：

```jsx
export default function ProfilePage({ userId }) {
  const [comment, setComment] = useState('');

  // 🔴 Avoid: Resetting state on prop change in an Effect
  useEffect(() => {
    setComment('');
  }, [userId]);
  // ...
}
```

这个操作是无效的，因为 ProfilePage 和他的子组件在第一次渲染时会使用一个旧的值，并且再次渲染。并且他也是复杂的，因为你需要在 ProfilePage 每个具有类似状态的组件中执行词操作。例如如果 comment UI 是嵌套的，你或许想要清除嵌套的 comment 状态。

然而，你可以通过给组件一个明确的 key 来告诉 React，每个用户的 profile 文件从概念上就是不同的。

将你的组件拆分为两个组件，并且通过从外层组件向内层组件传递 key 属性：

```jsx
export default function ProfilePage({ userId }) {
  return (
    <Profile
      userId={userId}
      key={userId}
    />
  );
}

function Profile({ userId }) {
  // ✅ This and any other state below will reset on key change automatically
  const [comment, setComment] = useState('');
  // ...
}
```

正常情况下，当相同的组件渲染到相同的位置时，React 会维护组件状态。当选择将 userId 作为 key 传递给 Profile 组件时，你其实是在要求 React 将两个 Profile 作为不同的组件对待，因为两个不同的组件不会共享状态。只有 userId 发生变化，React 就会重置 DOM 并且重置 Profile 组件及其子组件状态。comment 状态也会在两个 profile 组件切换的时候自动清除。

### 当 props 发生变化的时候调整 state

有时你或许想在 props 发生变换的时候重置或者调整部分 state，而不是全部。

List 组件接受一个 items 数组作为 prop。并且维持通过 selection 状态变量维持被选中的 item。

你想要在 items 发生变化的时候重置 selection 初始值为 null：

```jsx
function List({ items }) {
  const [isReverse, setIsReverse] = useState(false);
  const [selection, setSelection] = useState(null);

  // 🔴 Avoid: Adjusting state on prop change in an Effect
  useEffect(() => {
    setSelection(null);
  }, [items]);
  // ...
}
```

这也不是好主意。每次 items 发生变化，List 组件和他的子组件将首先使用一个失效的 selection 值进行渲染。然后 React 会更新 DOM 并且运行 Effect。最终调用 setSelection(null) 触发 List 组件和他子组件的另一次渲染，重启整个渲染过程。

你应该删除 Effect ，改为直接在渲染阶段调整状态：

```jsx
function List({ items }) {
  const [isReverse, setIsReverse] = useState(false);
  const [selection, setSelection] = useState(null);

  // Better: Adjust the state while rendering
  const [prevItems, setPrevItems] = useState(items);
  if (items !== prevItems) {
    setPrevItems(items);
    setSelection(null);
  }
  // ...
}
```

从上一次渲染中存储信息可能有些难以理解，但是他相较于在 Effect 中更新 state 更好。在上面例子中， setSelection 会在渲染期间直接调用。React 将在 List 退出后立即使用返回语句重新渲染它。到那时，React 还没有渲染 List 子节点或更新 DOM，因此这让 List 子元素跳过呈现陈旧的 selection 值。 

当你在渲染阶段更新组件，React 丢弃返回的 JSX 并立即重试渲染。为了避免非常缓慢的级联重试，React 只允许你在渲染期间更新相同组件的状态。如果你在渲染期间更新了另一个组件的状态，你将看到报错。像 items !== prevItems 可以避免死循环。您可以像这样调整状态，但任何其他副作用(如更改DOM或设置超时)都应该保留在事件处理程序或 Effects 中，以保持组件的可预测性。

**尽管此模式比Effect更有效，但大多数组件也不需要它。**无论如何，根据 props 或其他 state 调整状态都会使数据流更难以理解和调试。总是检查是否可以用一个 key 重置所有状态或在渲染期间计算所有内容。

例如，不存储(和重置)所选 item，你可以存储所选 item ID:

```jsx
function List({ items }) {
  const [isReverse, setIsReverse] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  // ✅ Best: Calculate everything during rendering
  const selection = items.find(item => item.id === selectedId) ?? null;
  // ...
}
```

现在根本不需要“调整”状态了。如果具有选中 id 的 item 在数组中，则保持选中状态。如果不是，则在渲染期间由于没有与之匹配的 id 会返回 null，这个行为有点不同，但可以说它更好，因为现在对 items 的很多更改操作都保存了所选数据。

### 在事件处理函数中分享逻辑

假设你有一个带有两个按钮(Buy和Checkout)的产品页面，这两个按钮都允许你购买该产品。当用户将产品添加到购物车的时候，你想显示一个通知。在两个 按钮的点击事件处理函数中都添加 showNotification 方法的调用有些重复，因此你或许想将这块逻辑代码放到 Effect 中：

```jsx
function ProductPage({ product, addToCart }) {
  // 🔴 Avoid: Event-specific logic inside an Effect
  useEffect(() => {
    if (product.isInCart) {
      showNotification(`Added ${product.name} to the shopping cart!`);
    }
  }, [product]);

  function handleBuyClick() {
    addToCart(product);
  }

  function handleCheckoutClick() {
    addToCart(product);
    navigateTo('/checkout');
  }
  // ...
}
```

这个 Effect 是不需要的。他很可能造成 bug。例如，我们假设你的应用在页面重新加载的时候已经缓存了购物车中的数据。如果你添加一个产品到购物车然后刷新页面，这提示信息会再次出现。上面的这种写法会让你的提示信息在每次刷新产品页面的时候都出现。因为 product.isInCart 在页面加载的时候已经是 true 了。因此 Effect 会再次调用 showNotification 方法。

**当你不确定某些代码是该放到 Effect 中还是事件处理函数中时，你可以问问自己这些代码为什么运行。Effect 中仅仅适合运行那些需要将组件展示给用户的代码**。在上面的例子中，提示信息应该出现是因为用户按下了按钮，而不是因为页面显示了！因此删除 Effect 并且将需要分享的逻辑放到一个函数中，然后你在两个事件处理函数中调用即可。

```jsx
function ProductPage({ product, addToCart }) {
  // ✅ Good: Event-specific logic is called from event handlers
  function buyProduct() {
    addToCart(product);
    showNotification(`Added ${product.name} to the shopping cart!`);
  }

  function handleBuyClick() {
    buyProduct();
  }

  function handleCheckoutClick() {
    buyProduct();
    navigateTo('/checkout');
  }
  // ...
}
```

上面的代码移除了 Effect 并且修复了 bug。

### 发送 POST 请求

下面的 Form 组件会发送两个不同的 POST 请求。当组件挂载的时候会发送一个分析请求。当你填完表格并且点击 提交 按钮的时候，会向 /api/register 发送一个 POST  请求。

```jsx
function Form() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // ✅ Good: This logic should run because the component was displayed
  useEffect(() => {
    post('/analytics/event', { eventName: 'visit_form' });
  }, []);

  // 🔴 Avoid: Event-specific logic inside an Effect
  const [jsonToSubmit, setJsonToSubmit] = useState(null);
  useEffect(() => {
    if (jsonToSubmit !== null) {
      post('/api/register', jsonToSubmit);
    }
  }, [jsonToSubmit]);

  function handleSubmit(e) {
    e.preventDefault();
    setJsonToSubmit({ firstName, lastName });
  }
  // ...
}
```

让我们在这个例子中应用与上面相同的规则。

发送分析日志的请求仍应该放在 Effect 中。因为 Form 组件需要展示。

然而，向 /api/register 接口发送 POST 请求的事件不是由 Form 组件展示引起的。你仅仅想在一个具体的时间发起 POST 请求：当用户点击 button 时。它仅应该由特定的交互事件引起。删除第二个 Effect 并将 POST 请求移动到事件函数中：

```jsx
function Form() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // ✅ Good: This logic runs because the component was displayed
  useEffect(() => {
    post('/analytics/event', { eventName: 'visit_form' });
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    // ✅ Good: Event-specific logic is in the event handler
    post('/api/register', { firstName, lastName });
  }
  // ...
}
```

当你选择将代码逻辑放在事件处理函数中还是 Effect 中时，其实主要问题是你应该回答：从用户的视角看这是哪个类型的逻辑？如果这块代码逻辑是由用户交互引起的，则应该放到事件处理函数中。如果是由用户看到组件渲染到视图的过程引起的，则应该放到 Effect 中。

### 链式操作

有时你或许需要链式触发 Effect，每个 Effect 会基于其他 state 调整一部分 state。

```jsx
function Game() {
  const [card, setCard] = useState(null);
  const [goldCardCount, setGoldCardCount] = useState(0);
  const [round, setRound] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);

  // 🔴 Avoid: Chains of Effects that adjust the state solely to trigger each other
  useEffect(() => {
    if (card !== null && card.gold) {
      setGoldCardCount(c => c + 1);
    }
  }, [card]);

  useEffect(() => {
    if (goldCardCount > 3) {
      setRound(r => r + 1)
      setGoldCardCount(0);
    }
  }, [goldCardCount]);

  useEffect(() => {
    if (round > 5) {
      setIsGameOver(true);
    }
  }, [round]);

  useEffect(() => {
    alert('Good game!');
  }, [isGameOver]);

  function handlePlaceCard(nextCard) {
    if (isGameOver) {
      throw Error('Game already ended.');
    } else {
      setCard(nextCard);
    }
  }

  // ...
```

在上面的代码中有两个问题。

第一个问题是它非常低效：Game 组件及其子组件必须在 Effect 链中的每个 setter 调用之间重新渲染。在上面的例子中，实际情况是这个样的：

setCard → 渲染 → setGoldCardCount → 渲染 → setRount → 渲染 → setIsGameOver → 渲染

整个组件树产生了三次不必要的渲染。

即使它可能并不慢，但是随着代码的发展，你也会遇到编写的“链”不符合新的需求的情况。想象一下，你正在添加一种方法来逐步回顾游戏移动的历史记录。你可以通过将每个状态变量更新为过去的值来实现这一点。然而，将卡片状态设置为过去的值将再次触发Effect链并更改正在显示的数据。这样的代码通常是僵硬而脆弱的。

这种情况下，最好是在渲染期间计算你所需要的状态，并且在事件函数中重新调整 state。

```jsx
function Game() {
  const [card, setCard] = useState(null);
  const [goldCardCount, setGoldCardCount] = useState(0);
  const [round, setRound] = useState(1);

  // ✅ Calculate what you can during rendering
  const isGameOver = round > 5;

  function handlePlaceCard(nextCard) {
    if (isGameOver) {
      throw Error('Game already ended.');
    }

    // ✅ Calculate all the next state in the event handler
    setCard(nextCard);
    if (nextCard.gold) {
      if (goldCardCount <= 3) {
        setGoldCardCount(goldCardCount + 1);
      } else {
        setGoldCardCount(0);
        setRound(round + 1);
        if (round === 5) {
          alert('Good game!');
        }
      }
    }
  }

  // ...
```

上面的代码就高效很多。此外，如果你实现了一种查看游戏历史的方法，那么现在你就可以将每个状态变量设置为过去的移动，而不必触发调整每个其他值的 Effect 链。如果你需要在多个事件函数中复用逻辑，你可以将复用逻辑再单独提取为一个函数，然后调用它即可。

技术在事件函数内部，状态的表现更像快照。例如，即使你调用了 setRound(round + 1) 之后，round 的值仍然是用户点击按钮时的状态。如果你需要为计算操作使用新值，手动定义它，比如 `const nextRound = round + 1`。

在某些情况下，当不能直接在事件处理程序中计算下一个状态时。例如，想象一个具有多个下拉列表的表单，其中下一个下拉列表的选项依赖于前一个下拉列表的选择值。然后，选择 Effects 链获取数据是合适的，因为您需要与网络进行同步。

### 初始化应用

当 app 加载的时候，有些逻辑应该仅运行一次。你获取会将其放到组件的顶层 Effect 中：

```jsx
function App() {
  // 🔴 Avoid: Effects with logic that should only ever run once
  useEffect(() => {
    loadDataFromLocalStorage();
    checkAuthToken();
  }, []);
  // ...
}
```

但是，您很快就会发现它在开发中运行了两次。这可能会导致一些问题——例如，可能会使*身份验证令牌*失效，因为该函数没有设计为被调用两次。一般来说，组件应该具有重新挂载的弹性。这包括顶层 App 组件。尽管在实际生产中可能永远不会重新安装，但在所有组件中遵循相同的约束可以更容易地移动和重用代码。如果某些逻辑必须在每次应用加载时运行一次，而不是每次组件挂载时运行一次，你可以添加一个顶层变量来跟踪它是否已经执行，并始终跳过重新运行它:

```jsx
let didInit = false;

function App() {
  useEffect(() => {
    if (!didInit) {
      didInit = true;
      // ✅ Only runs once per app load
      loadDataFromLocalStorage();
      checkAuthToken();
    }
  }, []);
  // ...
}
```

你也可以在 app 渲染之前、模块初始化时运行它：

```jsx
if (typeof window !== 'undefined') { // Check if we're running in the browser.
   // ✅ Only runs once per app load
  checkAuthToken();
  loadDataFromLocalStorage();
}

function App() {
  // ...
}
```

在导入组件时，顶层的代码只运行一次——即使它最终没有被渲染。为了避免在导入任意组件时出现变慢或令人惊讶的行为，不要过度使用此模式。将整个应用程序的初始化逻辑保留到根组件模块(如 App.js )或应用程序的入口模块中。

### 当 state 变化的时候通知父组件

假设你正在编写一个 Toggle 组件，其中有一个内部的 isOn 状态，可以是 true 也可以是 false。切换它有几种不同的方法(通过单击或拖动)。你想要在 Toggle 内部状态改变时通知父组件，所以你给组件提供可一个 onChange 事件，并在 Effect 中调用它: 

```jsx
function Toggle({ onChange }) {
  const [isOn, setIsOn] = useState(false);

  // 🔴 Avoid: The onChange handler runs too late
  useEffect(() => {
    onChange(isOn);
  }, [isOn, onChange])

  function handleClick() {
    setIsOn(!isOn);
  }

  function handleDragEnd(e) {
    if (isCloserToRightEdge(e)) {
      setIsOn(true);
    } else {
      setIsOn(false);
    }
  }

  // ...
}
```

就像之前一样，这并不理想。Toggle 首先会更新它的状态，React更新视图。然后 React 运行 Effect，它调用从父组件传递过来的onChange 函数。现在父组件将更新自己的状态，开始进行下一轮渲染。但是我们需要最好是一次性完成所有工作。

删除 Effect，并在同一个事件处理程序中更新两个组件的状态:

```jsx
function Toggle({ onChange }) {
  const [isOn, setIsOn] = useState(false);

  function updateToggle(nextIsOn) {
    // ✅ Good: Perform all updates during the event that caused them
    setIsOn(nextIsOn);
    onChange(nextIsOn);
  }

  function handleClick() {
    updateToggle(!isOn);
  }

  function handleDragEnd(e) {
    if (isCloserToRightEdge(e)) {
      updateToggle(true);
    } else {
      updateToggle(false);
    }
  }

  // ...
}

```

使用这种方法，Toggle 组件及其父组件都会在事件中更新它们的状态。React 会将来自不同组件的一起进行 **批量更新**，因此结果将只有一个渲染。

你也可以完全删除状态，而从父组件接收 isOn:

```jsx
// ✅ Also good: the component is fully controlled by its parent
function Toggle({ isOn, onChange }) {
  function handleClick() {
    onChange(!isOn);
  }

  function handleDragEnd(e) {
    if (isCloserToRightEdge(e)) {
      onChange(true);
    } else {
      onChange(false);
    }
  }

  // ...
}
```

“状态提升”可以让父组件通过切换自身的状态来实现对 Toggle 的完全控制。这意味着父组件将必须包含更多的逻辑，但需要担心的总体状态会更少。每当你试图保持两个不同的状态变量同步时，这是一个信号，表明你应该尝试向上进行**状态提升**啦!

### 将数据传递给父组件

在 Child 组件中请求数据，然后在 Effect 中将数据传递给父组件：

```jsx
function Parent() {
  const [data, setData] = useState(null);
  // ...
  return <Child onFetched={setData} />;
}

function Child({ onFetched }) {
  const data = useSomeAPI();
  // 🔴 Avoid: Passing data to the parent in an Effect
  useEffect(() => {
    if (data) {
      onFetched(data);
    }
  }, [onFetched, data]);
  // ...
}
```

在 React 中，数据通常从父组件流向子组件。当你看到视图上出现错误时，你可以沿着组件链向上查找信息的来源，直到找到哪个组件传递了错误的 props 或具有错误的 state。当子组件在 Effects 中更新它们的父组件的状态时，数据流变得非常难以跟踪。因为子组件和父组件都需要相同的数据，所以让父组件获取这些数据，并将其传递给子组件:

```jsx
function Parent() {
  const data = useSomeAPI();
  // ...
  // ✅ Good: Passing data down to the child
  return <Child data={data} />;
}

function Child({ data }) {
  // ...
}
```

这更简单，并且保持数据流的可预测性:数据从父节点向下流到子节点。

### useSyncExternalStore：订阅外部存储

有时，组件可能需要订阅 React 状态之外的一些数据。这些数据可以来自第三方库或内置的浏览器 API。由于这些数据可以在 React 不知道的情况下发生变化，所以需要手动让组件订阅到它。这通常是通过 Effect 来完成的，例如:

```jsx
function useOnlineStatus() {
  // Not ideal: Manual store subscription in an Effect
  const [isOnline, setIsOnline] = useState(true);
  useEffect(() => {
    function updateState() {
      setIsOnline(navigator.onLine);
    }

    updateState();

    window.addEventListener('online', updateState);
    window.addEventListener('offline', updateState);
    return () => {
      window.removeEventListener('online', updateState);
      window.removeEventListener('offline', updateState);
    };
  }, []);
  return isOnline;
}

function ChatIndicator() {
  const isOnline = useOnlineStatus();
  // ...
}

```

在上面代码示例中，组件订阅外部数据存储(在本例中是浏览器导航器，浏览器 navigator.onLine API)。因为这个 API 在服务器上不存在(所以它不能用来生成初始的 HTML )，所以初始状态被设置为 true。只要该数据存储的值在浏览器中发生变化，组件就会更新其状态。

虽然通常使用 Effects 来实现这一点，但 React 提供了一个专门用来订阅外部存储的 Hook：useSyncExternalStore，遇到上面这种情况都首选 useSyncExternalStore。删除 Effect 并将其替换为调用 useSyncExternalStore:

```jsx
function subscribe(callback) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function useOnlineStatus() {
  // ✅ Good: Subscribing to an external store with a built-in Hook
  return useSyncExternalStore(
    subscribe, // React won't resubscribe for as long as you pass the same function
    () => navigator.onLine, // How to get the value on the client
    () => true // How to get the value on the server
  );
}

function ChatIndicator() {
  const isOnline = useOnlineStatus();
  // ...
}
```

这种方法比手动将可变数据同步到带有 Effect 的 React 状态更不容易出错。通常，你将编写像上面的 useOnlineStatus() 这样的自定义Hook，这样您就不需要在各个组件中重复此代码。 [阅读更多关于订阅React组件的外部存储的信息。](https://beta.reactjs.org/apis/react/useSyncExternalStore)

### 请求数据

许多 app 使用 Effects 去进行数据请求。编写这样的数据请求 Effect 是很常见的:

```jsx
function SearchResults({ query }) {
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    // 🔴 避免: 避免进行没有 cleanup 逻辑的数据请求
    fetchResults(query, page).then(json => {
      setResults(json);
    });
  }, [query, page]);

  function handleNextPageClick() {
    setPage(page + 1);
  }
  // ...
}

```

你不需要将 fetch 移动到事件处理函数中。

这或许与先前需要将代码放到事件处理函数中的例子是相互矛盾的。然而考虑到这部分逻辑主要是去发起数据请求而不是输入事件。搜索输入通常是从 URL 预先填充的，用户可以在不接触输入的情况下向前和向后导航。它是从 页面还是 query 中获取并不重要。当组件可见时，你希望根据当前页面和查询将结果与来自网络的数据保持同步。这就是为什么它是一个效应。

然而上面的代码有个 bug。设想你很快的输入 "hello"。然后查询将从 "h" 到 "he"、"hel"、"hell" 最终到" hello"进行变换。这将开始单独的请求，但不能保证响应将以何种顺序到达。例如，“hello” 的响应可能会在 "hello" 的响应之后到达。因为它最后会调用 setResults()，这将会展示一个错误的搜索结果。这被称为 **竞态**：两个请求之间互相竞争，并且会产生一个你无法预期的顺序。

**为了解决竞态问题，你需要添加一个 cleanup 函数以忽视过期的响应。**

```jsx
function SearchResults({ query }) {
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  useEffect(() => {
    let ignore = false;
    fetchResults(query, page).then(json => {
      if (!ignore) {
        setResults(json);
      }
    });
    return () => {
      ignore = true;
    };
  }, [query, page]);

  function handleNextPageClick() {
    setPage(page + 1);
  }
  // ...
}
```

这确保了在 Effect 获取数据时，除了最后一个请求之外的所有响应都将被忽略。

处理竞态条件并不是实现数据获取的唯一困难。可能还需要考虑如何缓存的响应(以便用户点击回退时，可以立即看到上一个视图而不是 spinner 状态)，如何获取服务器上的数据(这样初始 server-rendered HTML 包含所获取的内容而不是转轮)，以及如何避免网络瀑布(这样一个子组件，需要获取数据不必等待每个父组件上面完成抓取数据之前可以开始)。**这些问题适用于任何 UI 库，而不仅仅是React。解决这些问题并非易事，这就是为什么现代框架提供了比直接在组件中写入 effect 更有效的内置数据获取机制。**

如果你不使用框架(也不想构建自己的框架)，但想让从 Effects 获取数据更符合工程学，考虑将你的获取逻辑提取到自定义Hook中，就像这个例子:

```jsx
function SearchResults({ query }) {
  const [page, setPage] = useState(1);
  const params = new URLSearchParams({ query, page });
  const results = useData(`/api/search?${params}`);

  function handleNextPageClick() {
    setPage(page + 1);
  }
  // ...
}

function useData(url) {
  const [data, setData] = useState(null);
  useEffect(() => {
    let ignore = false;
    fetch(url)
      .then(response => response.json())
      .then(json => {
        if (!ignore) {
          setData(json);
        }
      });
    return () => {
      ignore = true;
    };
  }, [url]);
  return data;
}
```

你可能还想添加一些逻辑，用于错误处理和跟踪内容是否正在加载。你可以自己构建这样的Hook，也可以使用 React 生态系统中已有的众多解决方案之一。尽管仅这一点并不像使用框架内置的数据获取机制那么有效，但是将数据获取逻辑移到自定义 Hook 中将使以后采用高效的数据获取策略更加容易。

一般来说，当你不得不编写 Effects 时，请留意何时可以使用更具有声明性和更有目的构建的 API(如上面的useData)将功能提取到自定义 Hook 中。在组件中使用的原始 useEffect 调用越少，维护应用程序就越容易。

## Effects 中的生命周期

Effects 的生命周期与组件不同。组件可以挂载、更新或卸载。而一个 Effect 只能做两件事：开始同步某些东西，然后停止同步它。如果你的 Effect 依赖于随时间变化的 props 和 state，那么这个循环可能会发生多次。React 提供了一个 linter 规则来检查是否正确指定了Effect 的依赖项。这将使你的 Effect 与最新的 props 和 state 同步。

你会学到的

- Effect 的生命周期与组件的生命周期有何不同
- 如何孤立地看待每个独立的 Effect
- 何时需要重新同步 Effect，以及原因
- 如何确定 Effect 的依赖关系
- 一个响应式的值意味着什么
- 空的依赖数组意味着什么
- React 如何用 linter 验证你的依赖项是正确的
- 当你不同意 linter 的意见时该怎么办?

### 一个 Effect 的生命周期

每个 React 组件都会经历相同的生命周期：

- 挂载：将组件渲染到视图上
- 更新：当组件接受新的 props 或者 state 时，进行更新操作。通常是为了响应交互事件
- 卸载：当组件从视图上移除时

这是一个非常好的思考方式，但是并不是 Effect 的思考方式。一次，请独立的思考每个 Effect 在你组件中的生命周期。Effect 通常用于描述如何同步外部系统到当前的 props 或 state。随着你代码的变化，这种同步操作需要或多或少的发生。

为了说明这一点，设想下将组件连接到聊天服务器的效果:

```jsx
const serverUrl = 'https://localhost:1234';

function ChatRoom({ roomId }) {
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    return () => {
      connection.disconnect();
    };
  }, [roomId]);
  // ...
}
```

你的 Effect 的主体部分明确指出了如何**开始同步**：

```jsx
    // ...
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    return () => {
      connection.disconnect();
    };
    // ...
```

通过 Effect 返回的 cleanup 函数明确指出了如何**停止同步**：

```jsx
    // ...
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    return () => {
      connection.disconnect();
    };
    // ...
```

凭直觉，你可能认为 React 会在组件挂载时开始同步，在组件卸载时停止同步。然而，事情并没有结束！有时，还可能需要在组件保持挂载的情况下进行**多次开始和停止同步**。

接下来让我们一起看看为什么这是必要的，它何时发生，以及如何控制这种行为。

> **注意**
>
> 有的 Effect 没有返回 cleanup 函数。通常情况下，你认为需要返回，但是如果你没有返回的情况下，React 的表现行为就像你返回了一个什么都不做的空的 cleanup 函数。

### 为什么同步可能需要发生多次？

设想下 ChatRoom 组件接受一个 roomId 的 props，它由用户通过点击 dropdown 产生。我们假设初始时用户选择的是 "general" 作为 roomId。app 显示 "general" 聊天室：

```jsx
const serverUrl = 'https://localhost:1234';

function ChatRoom({ roomId /* "general" */ }) {
  // ...
  return <h1>Welcome to the {roomId} room!</h1>;
}
```

在页面被渲染后，React 会运行 Effect 进行状态同步。链接 "general" 房间：

```jsx
function ChatRoom({ roomId /* "general" */ }) {
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId); // Connects to the "general" room
    connection.connect();
    return () => {
      connection.disconnect(); // Disconnects from the "general" room
    };
  }, [roomId]);
  // ...
```

到目前为止，一切都表现的符合预期。

之后，用户在下拉框中选择了另一个："travel"。React 首先会更新 UI。

```jsx
function ChatRoom({ roomId /* "travel" */ }) {
  // ...
  return <h1>Welcome to the {roomId} room!</h1>;
}
```

你可以暂停下，思考接下来发生了什么。用户在 UI 中看到选择的 "travel" 聊天室。然而，上次运行的 Effect 仍然 “geneal” 房间进行着链接。props 中的 roomId 已经改变了，所以无论你的 Effect 在那时做了什么(连接到 “general” 房间)都不再与现在的 UI 匹配了。

此时，你希望 React 做两件事:

- 停止与旧的 roomId 同步(断开与 “general” 房间的连接)
- 开始与新的 roomId 同步(连接到“travel”房间)

幸运的是，你已经学会如何通过 React 完成这两件事！用 Effect 的主体指定如何开始同步，用 cleanup 函数指定如何停止同步。React 现在需要做的就是以正确的顺序调用它们，并使用正确的 props 和 state。让我们看看这到底是怎么发生的。

### React 如何重复同步你的 Effect

回想一下，你的 ChatRoom 组件已经收到了新的 roomId 。以前是 “general”，现在是 “travel”。React 需要重新同步你的 Effect 以重新连接到不同的房间。

为了停止同步，React 会调用 Effect 在连接到 “general” 房间后返回的 cleanup 函数。由于 roomId 为 "general"，cleanup 函数需要断开与 "general" 房间的连接:

```jsx
function ChatRoom({ roomId /* "general" */ }) {
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId); // Connects to the "general" room
    connection.connect();
    return () => {
      connection.disconnect(); // Disconnects from the "general" room
    };
    // ...
```

然后 React 将运行你在渲染期间提供的 Effect。这一次，roomId 是 "travel"，所以它将开始同步到 "travel" 聊天室(直到它的 cleanup 函数最终也被调用):

```jsx
function ChatRoom({ roomId /* "travel" */ }) {
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId); // Connects to the "travel" room
    connection.connect();
    // ...
```

得益于此，你现在连接到用户在 UI 中选择的同一个房间。灾难避免了!

每次在组件使用不同的 roomId 重新渲染后，你的 Effect 将重新同步。例如，假设用户将 roomId 从 “travel” 更改为 “music”。React 将再次通过调用它的 cleanup 函数(断开你与 “travel” 房间的连接)来停止同步你的 Effect。然后，它将通过运行新的 roomId 属性(将你连接到“music”房间)来再次开始同步。

最后，当用户切换到另一个视图时，聊天室会卸载。现在完全没有必要保持联系了。React 将停止最后一次同步你的 Effect，并断开你与“music” 聊天室的连接。

### 从 Effect 的角度思考

让我们从 CharRoom 组件的角度来回顾一下发生的一切:

- CharRoom 挂载时 roomId 设置为 "general"
- roomId 设置为 “travel”，CharRoom 更新
- roomId 设置为“music”，CharRoom 更新
- 切换视图，CharRoom 卸载

在组件生命周期的每一个点上，你的 Effect 做了不同的事情:

- Effect 连接到 “general” 房间
- Effect 与 “general” 房间断开连接，与 “general” 房间连接
- Effect 从 “travel” 房间断开，连接到 “music” 房间
- Effect 与 “music” 室断开连接

现在让我们从 Effect 本身的角度来思考发生了什么:

```jsx
  useEffect(() => {
    // Effect 链接到指定的 roomId
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    return () => {
      // ...断开连接
      connection.disconnect();
    };
  }, [roomId]);
```

这段代码的结构可能会启发你， 这一系列操作发生了什么事情:

- Effect 连接到 “general” 房间(直到它断开)
- Effect 连接到 “travel” 房间(直到它断开)
- Effect 连接到 “music” 房间(直到它断开)

以前，你是从组件的角度考虑问题的。当你从组件的角度看时，很容易把 Effects 看作是在特定时间触发的“回调”或“生命周期事件”，比如“渲染之后”或“卸载之前”。这种思维方式很快就会变得复杂，所以最好避免。

**相反，每次只关注一个启动/停止周期。无论组件是挂载、更新还是卸载，都不应该如此。您所需要做的就是描述如何启动同步和如何停止同步。如果你做得好，你的 Effect 会根据需要多次启动和停止。**

这可能会提醒你，在编写创建 JSX 的渲染逻辑时，不要考虑组件是在挂载还是在更新。你描述应该出现在屏幕上的内容，然后 React 计算剩下的内容。

### React 如何验证你的 Effect 可以重新同步

你可能想知道 React 是如何知道你的 Effect 需要在 roomId 更改后重新同步的。这是因为你告诉 React，这个 Effect 的代码依赖于roomId，把它包含在依赖列表中:

```jsx
function ChatRoom({ roomId }) { // 属性 roomId 可能随着发生变化
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId); // Effect 读取了 roomId
    connection.connect();
    return () => {
      connection.disconnect();
    };
  }, [roomId]); // 你通过依赖数组告诉 React，这个 Effect 依赖于 roomId
  // ...
```

工作原理:

- 你知道 roomId 是一个属性，这意味着它可以随着时间的推移而变化。
- 你知道你的 Effect 读取了 roomId (因此它的逻辑取决于稍后可能更改的值)。
- 这就是为什么你将它指定为 Effect 的依赖项(以便当 roomId 发生变化时它会重新同步)。

每次在组件重新呈现之后，React都会查看您传递的依赖项数组。如果数组中的任何值与之前呈现时传递的同一点上的值不同，React将重新同步您的Effect。例如，如果你在初始渲染中传递["general"]，然后在下次渲染中传递["travel"]， React会比较"general"和"travel"。这些是不同的值(与Object.is相比)，因此React将重新同步您的Effect。另一方面，如果您的组件重新呈现但roomId没有更改，则您的Effect将保持连接到相同的房间。





### Effects 响应 响应式的值

下面这段代码中，Effect 读取两个变量( serverUrl 和 roomId )，但只指定了 roomId 作为依赖:

```jsx
const serverUrl = 'https://localhost:1234';

function ChatRoom({ roomId }) {
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    return () => {
      connection.disconnect();
    };
  }, [roomId]);
  // ...
}
```

为什么不需要将 serverUrl 设置为依赖项？

这是因为 serverUrl 不会因为重新渲染而改变。无论组件重新渲染多少次，用什么 props 和 state，都是一样的。因为 serverUrl 从不改变，所以将它指定为依赖项是没有意义的。毕竟，依赖关系只有在随时间变化时才会做一些事情!

另一方面，在重新渲染时，roomId 可能是不同的。**在组件中声明的 props、state 和其他值是响应式的，因为它们是在渲染期间通过计算得到的，并参与了 React 数据流。**

如果 serverUrl 是一个状态变量，它将是响应式的。响应值必须包含在依赖项中:

```jsx
function ChatRoom({ roomId }) { // Props change over time
  const [serverUrl, setServerUrl] = useState('https://localhost:1234'); // State may change over time

  useEffect(() => {
    const connection = createConnection(serverUrl, roomId); // Your Effect reads props and state
    connection.connect();
    return () => {
      connection.disconnect();
    };
  }, [roomId, serverUrl]); // So you tell React that this Effect "depends on" on props and state
  // ...
}
```

通过将 serverUrl 包含为依赖项，可以确保 Effect 在 serverUrl 更改后重新同步。

尝试更改所选聊天室或在此沙箱中编辑服务器URL:

App.js

```jsx
import { useState, useEffect } from 'react';
import { createConnection } from './chat.js';

function ChatRoom({ roomId }) {
  const [serverUrl, setServerUrl] = useState('https://localhost:1234');

  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    return () => connection.disconnect();
  }, [roomId, serverUrl]);

  return (
    <>
      <label>
        Server URL:{' '}
        <input
          value={serverUrl}
          onChange={e => setServerUrl(e.target.value)}
        />
      </label>
      <h1>Welcome to the {roomId} room!</h1>
    </>
  );
}

export default function App() {
  const [roomId, setRoomId] = useState('general');
  return (
    <>
      <label>
        Choose the chat room:{' '}
        <select
          value={roomId}
          onChange={e => setRoomId(e.target.value)}
        >
          <option value="general">general</option>
          <option value="travel">travel</option>
          <option value="music">music</option>
        </select>
      </label>
      <hr />
      <ChatRoom roomId={roomId} />
    </>
  );
}
```

chat.js

```jsx
export function createConnection(serverUrl, roomId) {
  // A real implementation would actually connect to the server
  return {
    connect() {
      console.log('✅ Connecting to "' + roomId + '" room at ' + serverUrl + '...');
    },
    disconnect() {
      console.log('❌ Disconnected from "' + roomId + '" room at ' + serverUrl);
    }
  };
}
```

每当你更改响应值(如 roomId 或 serverUrl )时，Effect 就会重新连接到聊天服务器。

### 给 Effect 一个空依赖数组意味着什么

如果你将 serverUrl 和 roomId 都移到组件之外会发生什么?

```jsx
const serverUrl = 'https://localhost:1234';
const roomId = 'general';

function ChatRoom() {
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    return () => {
      connection.disconnect();
    };
  }, []); // ✅ All dependencies declared
  // ...
}
```

现在 Effect 的代码不使用任何响应值，因此它的依赖项可以为空 ([])。

如果从组件的角度考虑，空的 [] 依赖项数组意味着此 Effect 仅在组件挂载时连接到聊天室，仅在组件卸载时断开连接。(请记住，React 仍然会在开发环境中重新同步它，以便对 Effect 的逻辑进行压力测试。)



```jsx
import { useState, useEffect } from 'react';
import { createConnection } from './chat.js';

const serverUrl = 'https://localhost:1234';
const roomId = 'general';

function ChatRoom() {
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    return () => connection.disconnect();
  }, []); // 移除依赖项
  return <h1>Welcome to the {roomId} room!</h1>;
}

export default function App() {
  const [show, setShow] = useState(false);
  return (
    <>
      <button onClick={() => setShow(!show)}>
        {show ? 'Close chat' : 'Open chat'}
      </button>
      {show && <hr />}
      {show && <ChatRoom />}
    </>
  );
}
```

然而，如果从 Effect 的角度考虑，则完全不需要考虑挂载和卸载。重要的是，你已经指定了 Effect 如何开始和停止同步。今天，它没有响应式依赖。但如果你想让用户随着时间的推移改变 roomId 或 serverUrl (所以他们必须做出反应)，你的 Effect 代码不会改变。您只需要将它们添加到依赖项中。

### 所有在组件主体中声明的变量都是响应式的

props 和 state 并不是唯一的响应式变量。由它们计算出的值也是响应式的。如果 props 或 state 发生变化，组件将重新渲染，从它们计算出的值也将发生变化。这就是为什么 Effect 使用的组件体中的所有变量也应该在 Effect 依赖项列表中。

假设用户可以在下拉菜单中选择聊天服务器，但也可以在设置中配置默认服务器。假设你已经将设置状态放在一个上下文中，因此你可以从该上下文中读取设置。现在，根据 props 中选择的服务器和上下文中的默认服务器计算 serverUrl:

```jsx
function ChatRoom({ roomId, selectedServerUrl }) { // roomId is reactive
  const settings = useContext(SettingsContext); // settings is reactive
  const serverUrl = selectedServerUrl ?? settings.defaultServerUrl; // serverUrl is reactive
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId); // Your Effect reads roomId and serverUrl
    connection.connect();
    return () => {
      connection.disconnect();
    };
  }, [roomId, serverUrl]); // So it needs to re-synchronize when either of them changes!
  // ...
}
```

在本例中，serverUrl 不是 props 或 state 变量。它是一个常规变量，在渲染阶段计算。但是由于它是在渲染期间计算的，所以它可以因重新渲染而改变。这就是为什么它是响应式的。

**组件内部的所有值(包括组件主体中的 props 、state 和变量)都是响应式的。任何响应值都可以在重新渲染时更改，因此需要将响应值作为 Effect 的依赖项包含在内。**

换句话说，Effects 对来自组件主体的所有值“做出响应”。

### React 验证你指定为依赖项的每个响应值

如果 linter 为 React 配置了，它将检查 Effect 代码使用的每个响应值是否声明为依赖项。例如，这是一个 lint 错误，因为 roomId 和serverUrl 都是响应的:

```jsx
import { useState, useEffect } from 'react';
import { createConnection } from './chat.js';

function ChatRoom({ roomId }) { // roomId is reactive
  const [serverUrl, setServerUrl] = useState('https://localhost:1234'); // serverUrl is reactive

  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    return () => connection.disconnect();
  }, []); // <-- Something's wrong here!

  return (
    <>
      <label>
        Server URL:{' '}
        <input
          value={serverUrl}
          onChange={e => setServerUrl(e.target.value)}
        />
      </label>
      <h1>Welcome to the {roomId} room!</h1>
    </>
  );
}

```

这看起来像是一个 React 错误，但实际上 React 是在指出代码中的一个错误。roomId 和 serverUrl 可能会随着时间的推移发生变化，但是当它们发生变化时，你会忘记重新同步 Effect。因此，即使用户在 UI 中选择了不同的值，你也将保持与初始 roomId 和 serverUrl 的连接。

要修复这个 bug，按照 linter 的建议指定 roomId 和 serverUrl 作为 Effect 的依赖项:

```jsx
function ChatRoom({ roomId, serverUrl }) {
  const [serverUrl, setServerUrl] = useState('https://localhost:1234'); // serverUrl is reactive
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    return () => {
      connection.disconnect();
    };
  }, [serverUrl, roomId]); // ✅ All dependencies declared
  // ...
}
```

在上面的沙盒中尝试这个修复。验证 linter 错误已经消失，并且聊天在需要时重新连接。

> **注意**
>
> 在某些情况下，React 知道某些值永远不会改变，即使它是在组件内部声明的。例如，useState 返回的 setter 函数和 useRef 返回的 ref 对象都是稳定的——它们保证在重新渲染时不会改变。稳定值不具有响应性，所以 linter 允许你从依赖列表中省略它们。当然，即使在依赖数组中包含它们是可以的: 它们不会改变，所以没关系。

### 当你不想重新同步时该怎么做

在前面的示例中，通过列出 roomId 和 serverUrl 作为依赖项，已经修复了 lint 错误。

然而，你可以向 linter “证明”这些值不是响应式的，也就是说，它们不会因为重新渲染而改变。例如，如果 serverUrl 和 roomId 不依赖于渲染并且总是具有相同的值，则可以将它们移到组件之外。现在它们不需要成为依赖:

```jsx
const serverUrl = 'https://localhost:1234'; // serverUrl is not reactive
const roomId = 'general'; // roomId is not reactive

function ChatRoom() {
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    return () => {
      connection.disconnect();
    };
  }, []); // ✅ All dependencies declared
  // ...
}
```

你也可以将它们移动到效果中。它们在渲染时不会被计算，所以它们不是响应式的:

```jsx
function ChatRoom() {
  useEffect(() => {
    const serverUrl = 'https://localhost:1234'; // serverUrl is not reactive
    const roomId = 'general'; // roomId is not reactive
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    return () => {
      connection.disconnect();
    };
  }, []); // ✅ All dependencies declared
  // ...
}
```

**Effect 是响应式的代码块**。当你在它们内部读取的值发生变化时，它们会重新同步。与每次交互只运行一次的事件处理程序不同，Effects在需要同步时运行。

你不能“选择”你的依赖项。你的依赖项必须包括您在 Effect 中读取的每个响应值。linter 强制了这一点。有时，这可能会导致无限循环和你的 Effect 重新同步太频繁的问题。不要通过抑制 linter来解决这些问题! 下面是你可以尝试的方法:

- **检查 Effect 是否代表独立的同步过程**。如果你的 Effect 没有同步任何东西，那么它可能是不必要的。如果它同步了几个独立的东西，就把它拆分。

- **如果你想读取 props 或 state 的最新值，而不需要对其进行“响应”并重新同步 Effect，**你可以将 Effect 分为响应部分(你将保留在 Effect 中)和非反应部分(你将提取到事件函数中)。阅读更多关于分离事件和效果的信息。

- **避免依赖对象和函数作为依赖项。**如果在渲染期间创建对象和函数，然后从 Effect 中读取它们，那么它们在每次渲染时都是不同的。这将导致您的 Effect 每次都重新同步。

### 回顾

- 组件可以挂载、更新和卸载。
- 每个 Effect 都有一个独立于周围组件的生命周期。
- 每个 Effect 都描述了一个可以开始和停止的独立同步过程。
- 在编写和读取 Effect 时，应该从每个 Effect 的角度(如何启动和停止同步)考虑问题，而不是从组件的角度(如何安装、更新或卸载)考虑问题。
- 在组件体中声明的值是“活性的”。
- 响应值应该重新同步效果，因为它们可以随时间变化。
- linter 验证 Effect 中使用的所有响应值都指定为依赖项。
- linter 标记的所有错误都是合法的。总有一种方法可以在不违反规则的情况下修复代码。

## 从 Effect 中分离事件

事件处理函数只有在再次执行相同的交互时才会重新运行。与事件处理函数不同，如果 Effects 读取的某些值(如 props 或 state 变量)与上一次渲染时的值不同，则会重新同步。有时，你还需要这两种行为的混合：一个响应某些值而不响应其他值的重新运行的 Effect。这一页将教你如何做到这一点。多个 Effects 依赖有部分相同如何处理。

你会学到的

- 如何在事件处理程序和 Effects 之间进行选择
- 为什么 Effects 是响应式的，而事件处理程序不是
- 当你想让你的 Effect 的一部分代码不响应时该怎么做
- 什么是事件函数，以及如何从 Effects 中提取它们
- 如何从使用事件函数的 Effects 读取最新的 props 和 state

### 在事件处理函数与 Effects 之间选择

首先，让我们回顾下二者有什么不同。

假设你正在实现一个聊天室组件。你的需求如下所示:

- 组件应该自动连接到所选聊天室。
- 当你点击“发送”按钮时，它应该会发送消息到聊天。

假设你已经为它们实现了代码，但不确定将其放在哪里。应该使用事件处理程序还是 Effects? 每次您需要回答这个问题时，请考虑为什么需要运行这段代码。

### 事件处理程序在响应特定交互时运行

从用户的角度来看，发送消息应该是因为点击了特定的 “Send” 按钮后发生。如果你在任何其他时间或任何其他原因发送他们的消息，用户将会非常不安全。这就是为什么发送消息应该是一个事件处理函数。事件处理函数让你处理特定的交互，比如点击:

```jsx
function ChatRoom({ roomId }) {
  const [message, setMessage] = useState('');
  // ...
  function handleSendClick() {
    sendMessage(message);
  }
  // ...
  return (
    <>
      <input value={message} onChange={e => setMessage(e.target.value)} />
      <button onClick={handleSendClick}>Send</button>;
    </>
  );
}
```

使用事件处理程序，可以确保 sendMessage(message) 只在用户按下按钮时运行。

### Effects 在需要同步时运行

回想一下，你还需要保持组件与聊天室的连接。这些代码应该放到哪里?

运行这段代码的原因不是某种特定的交互。用户为什么或者如何导航到聊天室界面并不重要。现在他们正在查看它并可以与它交互，组件需要保持与所选聊天服务器的连接。即使聊天室组件是应用程序的初始界面，用户根本没有执行任何交互，你仍然需要连接。这就是为什么它是一个 Effect:

```jsx
function ChatRoom({ roomId }) {
  // ...
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    return () => {
      connection.disconnect();
    };
  }, [roomId]);
  // ...
}
```

使用这段代码，你可以确保始终有一个到当前所选聊天服务器的活动连接，而不管用户执行了什么特定的交互。无论用户只是打开了你的应用程序，选择了一个不同的房间，还是导航到另一个屏幕和返回， 你的 Effect 将确保组件将保持与当前选择的房间同步，并将在必要时重新连接。

App

```jsx
import { useState, useEffect } from 'react';
import { createConnection, sendMessage } from './chat.js';

const serverUrl = 'https://localhost:1234';

function ChatRoom({ roomId }) {
  const [message, setMessage] = useState('');

  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    return () => connection.disconnect();
  }, [roomId]);

  function handleSendClick() {
    sendMessage(message);
  }

  return (
    <>
      <h1>Welcome to the {roomId} room!</h1>
      <input value={message} onChange={e => setMessage(e.target.value)} />
      <button onClick={handleSendClick}>Send</button>
    </>
  );
}

export default function App() {
  const [roomId, setRoomId] = useState('general');
  const [show, setShow] = useState(false);
  return (
    <>
      <label>
        Choose the chat room:{' '}
        <select
          value={roomId}
          onChange={e => setRoomId(e.target.value)}
        >
          <option value="general">general</option>
          <option value="travel">travel</option>
          <option value="music">music</option>
        </select>
      </label>
      <button onClick={() => setShow(!show)}>
        {show ? 'Close chat' : 'Open chat'}
      </button>
      {show && <hr />}
      {show && <ChatRoom roomId={roomId} />}
    </>
  );
}
```

chat.js

```jsx
export function sendMessage(message) {
  console.log('🔵 You sent: ' + message);
}

export function createConnection(serverUrl, roomId) {
  // A real implementation would actually connect to the server
  return {
    connect() {
      console.log('✅ Connecting to "' + roomId + '" room at ' + serverUrl + '...');
    },
    disconnect() {
      console.log('❌ Disconnected from "' + roomId + '" room at ' + serverUrl);
    }
  };
}
```

### 响应式的值和响应式的逻辑

直观地说，事件处理程序总是“手动”触发的，例如通过单击按钮。另一方面，Effect 是“自动的”:它们运行和重新运行，只要它需要保持同步。

有一种更精确的方法来思考这个问题。

在组件主体中声明的 props、state 和变量称为响应值。在本例中，serverUrl 不是响应值，但 roomId 和 message 是。它们参与渲染数据流:

```jsx
const serverUrl = 'https://localhost:1234';

function ChatRoom({ roomId }) {
  const [message, setMessage] = useState('');

  // ...
}
```

由于重新渲染，这样的响应式值可能会发生变化。例如，用户可以编辑消息或在下拉列表中选择不同的 roomId。事件处理函数和 effect 在响应变化时是不同的:

- 事件处理函数内部的逻辑不是响应式的。它将不会再次运行，除非用户再次执行相同的交互(例如，单击)。事件处理程序可以读取响应值，但不会对其更改“作出反应”。
- Effects 内部的逻辑是响应式的。如果 Effect 读取响应值，则必须将其指定为依赖项。然后，如果重新渲染导致该值发生变化，React将使用新值重新运行 Effect 的逻辑。
  让我们回顾一下前面的例子来说明这种差异。

### 事件处理函数内部的逻辑不是响应式的

看一下这行代码。这种逻辑是否应该是响应式?

```js
    // ...
    sendMessage(message);
    // ...
```

从用户的角度来看，对消息的更改并不意味着他们想要发送消息。它只意味着用户正在输入。换句话说，发送消息的逻辑不应该是被动的。它不应该仅仅因为响应值更改而再次运行。这就是为什么你把这个逻辑放在事件处理程序中:

```jsx
  function handleSendClick() {
    sendMessage(message);
  }
```

事件处理程序不是响应式的，因此 sendMessage(message) 只在用户单击 Send 按钮时运行。

### Effecst 内部的逻辑是响应式的

现在我们看下下面的代码：

```jsx
    // ...
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    // ...
```

从用户的角度来看，**对 roomId 的更改确实意味着他们想要连接到一个不同的房间**。换句话说，连接到房间的逻辑应该是响应式的。你希望这些代码行与响应值“保持一致”，并在该值不同时再次运行。这就是为什么你把这个逻辑放在 Effect 中:

```jsx
useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    return () => {
      connection.disconnect()
    };
  }, [roomId]);
```

Effect 是响应式的，因此 roomId 的每个不同值都会运行 createConnection(serverUrl, roomId) 和 connect .connect() 。你的 Effect 保持聊天连接同步到当前选定的房间。

### 从 Effects 中提取非响应式逻辑

当你想要将反应逻辑和非反应逻辑写在一起时，事情会变得更加棘手。

例如，假设您想在用户连接到聊天时显示一个通知。你从 props 中读取当前主题(暗或亮)，这样你就可以用正确的颜色显示通知:

```jsx
function ChatRoom({ roomId, theme }) {
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.on('connected', () => {
      showNotification('Connected!', theme);
    });
    connection.connect();
    // ...
```

然而，theme 是一个响应值(它可以由于重新渲染而更改)，并且 Effect 读取的每个响应值都必须声明为它的依赖项。所以现在你必须指定theme 作为 Effect 的依赖项:

```jsx
function ChatRoom({ roomId, theme }) {
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.on('connected', () => {
      showNotification('Connected!', theme);
    });
    connection.connect();
    return () => {
      connection.disconnect()
    };
  }, [roomId, theme]); // ✅ All dependencies declared
  // ...
```

试这运行这个例子，看看你是否能发现这个用户体验的问题:

App.js

```jsx
import { useState, useEffect } from 'react';
import { createConnection, sendMessage } from './chat.js';
import { showNotification } from './notifications.js';

const serverUrl = 'https://localhost:1234';

function ChatRoom({ roomId, theme }) {
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.on('connected', () => {
      showNotification('Connected!', theme);
    });
    connection.connect();
    return () => connection.disconnect();
  }, [roomId, theme]);

  return <h1>Welcome to the {roomId} room!</h1>
}

export default function App() {
  const [roomId, setRoomId] = useState('general');
  const [isDark, setIsDark] = useState(false);
  return (
    <>
      <label>
        Choose the chat room:{' '}
        <select
          value={roomId}
          onChange={e => setRoomId(e.target.value)}
        >
          <option value="general">general</option>
          <option value="travel">travel</option>
          <option value="music">music</option>
        </select>
      </label>
      <label>
        <input
          type="checkbox"
          checked={isDark}
          onChange={e => setIsDark(e.target.checked)}
        />
        Use dark theme
      </label>
      <hr />
      <ChatRoom
        roomId={roomId}
        theme={isDark ? 'dark' : 'light'}
      />
    </>
  );
}

```

Chat.js

```jsx
export function createConnection(serverUrl, roomId) {
  // A real implementation would actually connect to the server
  let connectedCallback;
  let timeout;
  return {
    connect() {
      timeout = setTimeout(() => {
        if (connectedCallback) {
          connectedCallback();
        }
      }, 100);
    },
    on(event, callback) {
      if (connectedCallback) {
        throw Error('Cannot add the handler twice.');
      }
      if (event !== 'connected') {
        throw Error('Only "connected" event is supported.');
      }
      connectedCallback = callback;
    },
    disconnect() {
      clearTimeout(timeout);
    }
  };
}
```

notification.js

```jsx
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

export function showNotification(message, theme) {
  Toastify({
    text: message,
    duration: 2000,
    gravity: 'top',
    position: 'right',
    style: {
      background: theme === 'dark' ? 'black' : 'white',
      color: theme === 'dark' ? 'white' : 'black',
    },
  }).showToast();
}

```

当 roomId 改变时，聊天将如你所期望的那样重新连接。但是由于 theme 也是一个依赖项，每次你在暗主题和亮主题之间切换时，聊天也会重新连接。这可不太好!

换句话说，你不希望这一行是反应的，即使它在一个 Effect (它是反应的)中:

```js
// ...
showNotification('Connected!', theme);
// ...
```

你需要一种方法将非响应式的逻辑与周围的响应式 Effect 分离开来。

### useEvent Hook，声明一个 Event 函数

使用一个叫做 useEvent 的特殊钩子从你的 Effect 中提取这个非响应式逻辑:

```jsx
import { useEffect, useEvent } from 'react';

function ChatRoom({ roomId, theme }) {
  const onConnected = useEvent(() => {
    showNotification('Connected!', theme);
  });
  // ...
```

这里，onConnected 被称为事件函数。它是 Effect 逻辑的一部分，但它的行为更像事件处理程序。它内部的逻辑不是响应式的，它总是可以“看到”你的 props 和 state 的最新值。

现在你可以从你的效果内部调用 onConnected Event 函数:

```jsx
function ChatRoom({ roomId, theme }) {
  const onConnected = useEvent(() => {
    showNotification('Connected!', theme);
  });

  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.on('connected', () => {
      onConnected();
    });
    connection.connect();
    return () => connection.disconnect();
  }, [roomId]); // ✅ All dependencies declared
  // ...
```

这就解决了问题。类似于 useState 返回的 setter 函数，所有的 Event 函数都是稳定的: 它们在重新渲染时不会改变。这就是为什么您可以在依赖项列表中跳过它们。它们不是响应式的。

你可以认为事件函数非常类似于事件处理函数。主要区别在于，事件处理程序是在响应用户交互时运行的，而事件函数是由您从 Effects 中触发的。事件函数让您“打破” Effects 的响应式和一些不应该是响应式的代码之间的链。

### 使用 Event 函数获取最新的 props 和 state

事件函数使你可以修复许多可能会试图抑制依赖 linter 的模式。

例如，假设您有一个 Effect 来记录页面访问:

```jsx
function Page() {
  useEffect(() => {
    logVisit();
  }, []);
  // ...
}
```

之后，向站点添加多条路由。现在，Page 组件接收一个带有当前路径的 url 属性。你想传递 url 作为你的 logVisit 调用的一部分，但是依赖 linter 抱怨:

```jsx
function Page({ url }) {
  useEffect(() => {
    logVisit(url);
  }, []); // 🔴 React Hook useEffect has a missing dependency: 'url'
  // ...
}
```

考虑一下你希望代码做什么。因为每个URL代表不同的页面，所以您希望记录对不同URL的单独访问。换句话说，这个logVisit调用应该是响应于url的。这就是为什么，在这种情况下，它是有意义的跟随依赖linter，并添加url作为依赖:

```jsx
function Page({ url }) {
  useEffect(() => {
    logVisit(url);
  }, [url]); // ✅ All dependencies declared
  // ...
}
```

现在让我们假设你想包含购物车中的商品数量和每次页面访问:

```jsx
function Page({ url }) {
  const { items } = useContext(ShoppingCartContext);
  const numberOfItems = items.length;

  useEffect(() => {
    logVisit(url, numberOfItems);
  }, [url]); // 🔴 React Hook useEffect has a missing dependency: 'numberOfItems'
  // ...
}
```

你在 Effect 中使用了numberOfItems，因此 linter  要求您将其作为依赖项添加。但是，您不希望 logVisit 调用对 numberOfItems 产生响应。如果用户向购物车中放入了一些东西，而 numberOfItems 发生了变化，这并不意味着用户再次访问了该页。换句话说，访问页面感觉类似于一个事件。你要非常准确地说出事情发生的时间。

将代码分成两部分:

```jsx
function Page({ url }) {
  const { items } = useContext(ShoppingCartContext);
  const numberOfItems = items.length;

  const onVisit = useEvent(visitedUrl => {
    logVisit(visitedUrl, numberOfItems);
  });

  useEffect(() => {
    onVisit(url);
  }, [url]); // ✅ All dependencies declared
  // ...
}
```

这里，onVisit 是一个 Event 函数。它里面的代码不是响应式的。这就是为什么你可以使用 numberOfItems (或任何其他响应值!)，而不必担心它会导致周围的代码在更改时重新执行。

另一方面，效果本身仍然是被动的。效果中的代码使用 url 道具，因此效果将在每次使用不同的 url 重新渲染后重新运行。这将依次调用onVisit 事件函数。

因此，对于 url 的每次更改，您都将调用 logVisit，并且总是读取最新的 numberOfItems。但是，如果 numberOfItems 自己发生变化，这将不会导致任何代码重新运行。

### Event 函数的限制

目前，事件函数的使用方式非常有限:

- 只能从Effects内部调用它们。
- 永远不要将它们传递给其他组件或 hook。

例如，不要像这样声明和传递 Event 函数:

```jsx
function Timer() {
  const [count, setCount] = useState(0);

  const onTick = useEvent(() => {
    setCount(count + 1);
  });

  useTimer(onTick, 1000); // 🔴 Avoid: Passing event functions

  return <h1>{count}</h1>
}

function useTimer(callback, delay) {
  useEffect(() => {
    const id = setInterval(() => {
      callback();
    }, delay);
    return () => {
      clearInterval(id);
    };
  }, [delay, callback]); // Need to specify "callback" in dependencies
}
```

相反，总是在使用事件函数的 Effects 旁边直接声明事件函数:

```jsx
function Timer() {
  const [count, setCount] = useState(0);
  useTimer(() => {
    setCount(count + 1);
  }, 1000);
  return <h1>{count}</h1>
}

function useTimer(callback, delay) {
  const onTick = useEvent(() => {
    callback();
  });

  useEffect(() => {
    const id = setInterval(() => {
      onTick(); // ✅ Good: Only called locally inside an Effect
    }, delay);
    return () => {
      clearInterval(id);
    };
  }, [delay]); // No need to specify "onTick" (an Event function) as a dependency
}
```

在未来，这些限制可能会被取消。但是现在，你可以认为事件函数是你的 Effect 代码的非响应式“片段”，所以它们应该接近使用它们的 Effect。

### 回顾

- 事件处理程序在响应特定交互时运行。
- 效果在需要同步时运行。
- 事件处理程序内部的逻辑不是响应式的。
- Effects 内部的逻辑是响应式的。
- 可以将非响应性逻辑从 Effects 移到 Event 函数中。
- 只从 Effects 内部调用 Event 函数。
- 不要将 Event 函数传递给其他组件或 hook。



## 移除 Effect 的依赖

### 依赖应该与代码匹配



### 移除依赖需要证明它不是依赖

### 调整依赖就要调整代码

### 移除不必要的依赖



### 代码是否应该提取到事件函数中

### 你的 Effect 是否做了无关的事情

### 是否根据一些 state 去计算新的 state

### 你是读取某个状态来计算下一个状态吗?

### 你是否希望读取值时不对其变换“作出响应”吗?

### 是否有一些反应性值在无意中发生了变化?



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



### Effect 的提示

#### 使用多个 Effect 实现关注点分离

#### 为什么每次更新的时候都要运行 Effect

#### 通过跳过 Effect 进行性能优化

## 自定义 Hook

## Hook 使用规则

- 只能在**函数最外层**调用 Hook。不要在循环、条件判断或者子函数中调用。
- 只能在 **React 的函数组件**中调用 Hook。不要在其他 JavaScript 函数中调用。（还有一个地方可以调用 Hook —— 就是自定义的 Hook 中，我们稍后会学习到。）



- [React Docs](https://beta.reactjs.org/learn)
- [React Hooks: Managing State With useState Hook](https://dev.to/pbteja1998/react-hooks-managing-state-with-usestate-hook-4689)
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
