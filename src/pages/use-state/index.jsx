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

import React, { useState, useRef, useEffect, useLayoutEffect } from "react";

function getInitialValue() {
  console.log('getInitialValue is getting executed');
  // ... do some expensive operations
  return 0;
}

// function Counter() {
//   const [count, setCount] = useState(() => getInitialValue());
//   const ref = useRef(0)
//   function increment() {
//     ref.current += 1
//     // setCount(count + 1);
//   }

//   const random = Math.floor(Math.random() * 10000000000)

//   return (
//     <div>
//       <h1 style={{ color: 'pink' }}>{random}</h1>
//       <button onClick={increment}>{ref.current}</button>
//     </div>
//   )
// }

function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (count === 0) {
      const randomNum = 10 + Math.random() * 200
      setCount(Math.floor(Math.random() * 10000000000));
    }
  }, [count]);

  // useLayoutEffect(() => {
  //   if (count === 0) {
  //     const randomNum = 10 + Math.random()*200
  //     setCount(Math.floor(Math.random() * 10000000000));
  //   }
  // }, [count]);

  return (
    <div onClick={() => setCount(0)}>{count}</div>
  );
}

function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      console.log(`You clicked ${count} times`);
    }, 3000);
  }, [count]);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
export default Counter
