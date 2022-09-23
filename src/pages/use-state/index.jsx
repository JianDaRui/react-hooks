import { useState, useEffect } from 'react'

function UseStateFeat() {
  const [count, setCount] = useState(0)

  console.log(Math.floor(Math.random() * 100000000000))
  return (
    <div>
      <h1 style={{ color: 'red' }}>{Math.floor(Math.random() * 100000000000)}</h1>
      <h2>{count}</h2>
      <button onClick={() => setCount(count + 1)}>ADD</button>
    </div>
  )
}

export default UseStateFeat
