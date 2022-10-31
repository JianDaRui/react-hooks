import { useState, useEffect } from 'react'

function UseEffectFeat() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    console.log('0')
  }, [count])

  return (
    <div>
      dfsadf
      <h1 onClick={() => setCount(count+1)}> { count }</h1 >
    </div >
  )
}

export default UseEffectFeat
