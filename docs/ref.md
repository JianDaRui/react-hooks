---
highlight: a11y-dark
theme: smartblue
---

<img src="https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/25ef2471859e471a9e750d4486b0bbdf~tplv-k3u1fbpfcp-watermark.image?" alt="useRef.png" width="100%" />

使用 `useState`、`useReducer`、`useContext` 创建的状态，都是**可读不可变**的，一旦更新就会触发组件的重新渲染。但是实际开发过程中你经常需要一些不希望引起组件重新渲染的状态、并且希望在组件的生命周期中，该状态能被一直保持在 `React` 中。

`Refs` 就是为了解决这个问题提出来的。

当你需要在组件中一直缓存一些状态，但是并不想因为这些状态的改变而重新触发渲染，那么你可以选择使用 `ref`。

使用示例：

[代码片段](https://code.juejin.cn/pen/7171774770697601076)

- 当你点击 `button` 的时候，会发现页面并没有更新 `countRef.current` 最新值，但是控制台中的 `countRef.current` 确每次会更新变化
- `useRef` 会给你返回一个带有 `current` 属性的对象，你可以通过 `ref.current` 访问当前值。
- `useRef` 与 `useState` 返回的状态不同之处就是：`ref.current` 的值是**可读可变**的，你可以直接通过 `ref.current = newValue`，进行更改。
- 并且更改 `useRef` 不会触发组件的重新渲染，这是**因为 `react` 没有对 `ref` 的值进行 `track` 操作**。

如果使用 useState:

[代码片段](https://code.juejin.cn/pen/7171775300471586850)

- 点击 `button` 会重新渲染，可以看到变化，这是因为 `React` 会跟踪 `state`

通常我们会在哪种情况下使用 `useRef`：

- 当你需要操作 `DOM` 的时候，可以使用 `ref` 保持对 `DOM` 的引用
- 当你需要使用*计时器*时，可以保持对*计时器*的引用，以保证在恰当的时机可以重置*计时器*
- 当你需要记录一些不影响组件重新渲染的状态时。

### 操作 DOM
在业务需求中，经常会遇到操作 `DOM` 的场景，比如：滚动视图到指定位置、表单获取焦点、移动 `DOM` 位置、调整 `DOM` 大小等等。这种情况下就可以使用 `useRef` 钩子去保存对 `DOM` 对象的引用。

引用的方式一般分为两种：

1. 直接引用组件自身的 `DOM` 对象
2. 引用子组件的 `DOM` 对象

**1. 引用组件自身的 `DOM` 对象**

[代码片段](https://code.juejin.cn/pen/7171775660187680783)

- 通过给 `HTML` 标签绑定一个 `ref` 属性，来实现 `DOM` 引用

**2. 访问子组件的 DOM 节点**

[代码片段](https://code.juejin.cn/pen/7171775972809637888)

- 需要从 `React` 中导出 `forwardRef` API，将子组件传递给 `forwardRef`
- 父组件将 ref 变量 传递给子组件，子组件绑定 ref 属性至目标标签

### 最佳实践

- **将 `refs` 作为 `react` 的一个`逃生舱`**。当你需要调用 React 外部系统或者浏览器的一些原生 `API` 的时候，`refs` 是非常有用的。但是当你的组件中有很多逻辑和数据流需要依赖 `ref` 的值时，你需要重新思考你的编码方式。
- 在**渲染时（rendering 阶段）**读取或者更改 `ref` 的值，如果有些信息需要在渲染时用到，则使用 `state` 代替，因为 React 不知道 ref.current 何时会发生改变。在渲染时依赖 ref.current 会使你的组件行为无法预测。
- `React` 对 `state` 的限制不会作用于 `refs`。例如 `***state` 的行为在每次渲染时更像是一张快照并且不会同步更新***。但是 `ref` 的值是同步立即改变的。因为 `ref` 本身是一个常规类型的 `JavaScript Object`

当你使用 `ref` 时不必担心如何避免状态变化。只要你没有在渲染阶段使用可变的 `ref` 就行。`React` 并不关心你在 `ref.current` 上做的任何操作。

### refs vs state

- 返回值不同：
    - `useRef` 钩子返回的是一个带有 `current` 属性的常规 `JavaScript` 对象，可读可变
    - `useState` 钩子返回的是一个数组，数组第一项状态可读不可变，只能通过第二项去更改状态
- `Track` 情况不同：
    - `refs` 的值不会被 React 跟踪，所以改变 `refs` 不会触发重新渲染
    - `state` 是每次改变都会触发重新渲染
- 可保存的值些许不同：
    - 相较于 `useState` 钩子，`useRef` 可以用于保存对 `DOM` 的引用。

### React 何时更新 refs

在 `React` 中，每次更新会分为两个阶段：

- 渲染期间，`React` 会调用组件函数计算出哪些内容应该渲染到视图上
- `commit` 期间，`React` 会将计算出来的 `DOM` 更新到真实的 `DOM` 上

通常情况下，你不想在渲染过程中访问 `refs`。这也适用于持有 `DOM` 节点的 `ref`。在第一次渲染期间，`DOM` 节点还没有创建，因此 `ref.current` 将为 `null`。在渲染更新阶段，`DOM` 节点还没有更新。所以在渲染更新过程中读取还为时过早。

`React` 在会在 `commit` 阶段设置 `ref.current`。在更新 `DOM` 之前，`React` 将受影响的 `ref.current` 值设置为 `null`。更新 `DOM` 之后，`React` 立即将它们设置为相应的 `DOM` 节点。

### 总结

- `Refs` 用来保存不用于渲染期间的值。
- `Refs` 是一个常规 `JavaScript` 对象，它只有一个名为 `current` 的属性，你可以读取或设置该属性。
- 你可以通过调用 `useRef` 钩子要求 `React` 给你一个引用。
- 与状态一样，`Refs` 允许你在组件重新渲染之间保留信息。
- 与 `state` 不同，设置 `ref` 的当前值不会触发重新呈现。
- 不要在渲染期间读或写 `ref.current` 。这使得你的组件行为难以预测。