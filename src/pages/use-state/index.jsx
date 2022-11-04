// import { useState, useEffect } from 'react'

// function UseStateFeat() {
//   const [count, setCount] = useState(0)

//   // setInterval(() => {
//   //   setCount(count + 1);
//   // }, 1000);
//   const random = Math.floor(Math.random() * 100000000000)
//   return (
//     <div>
//       <h1 style={{ color: 'red' }}>{random}</h1>
//       <h2>{count}</h2>
//       <button onClick={() => {
//         setCount(count)
//         // setCount(count => count + 1)
//         // console.log(count)
//         // setCount(count + 1)
//       }}>ADD</button>
//     </div>
//   )
// }

// export default UseStateFeat

import React, { useState } from "react";

function getInitialValue() {
  console.log('getInitialValue is getting executed');
  // ... do some expensive operations
  return 0;
}

function Counter() {
  const [count, setCount] = useState(() => getInitialValue());
  function increment() {
    setCount(count + 1);
  }
  return <button onClick={increment}>{count}</button>;
}
export default Counter
