import React, { useMemo } from 'react'
import { useState, useEffect, useContext, createContext } from 'react'


const ContextState = createContext({
  count: 0,
  list: []
})

const ChildrenComponent = React.memo(() => {
  const { list } = useContext(ContextState)

  return (
    <div>
      <h1 style={{ color: 'green' }}>Flag: {Math.random()}</h1>
      {
        list.map(item => {
          return (
            <div htmlFor="" key={item.price}>{item.name}</div>
          )
        })
      }
    </div>
  )
  
  // return useMemo(() => {
  //   return (
  //     <div>
  //       <h1 style={{ color: 'green' }}>Flag: {Math.random()}</h1>
  //       {
  //         list.map(item => {
  //           return (
  //             <div htmlFor="" key={item.price}>{item.name}</div>
  //           )
  //         })
  //       }
  //     </div>
  //   )
  // }, [list])
})

function UseContextFeat() {

  const [list, setList] = useState([
    { name: 'JavaScript 高级程序设计', price: 17 },
    { name: 'JavaScript 权威指南', price: 18 },
    { name: '你不知道的 JavaScript', price: 34 },
    { name: 'ECMAscript 入门', price: 28 },
  ])

  const [count, setCount] = useState(0)

  const onClick = () => {
    setCount(count + 1)
  }

  return (
    <div>
      <ContextState.Provider value={{
        list: list,
        count: count
      }}>
        <h1 style={{
          color: 'red'
        }}>{Math.random()}</h1>
        <button onClick={onClick}>{count}</button>
        <ChildrenComponent />
      </ContextState.Provider>
    </div>
  )
}

export default UseContextFeat
