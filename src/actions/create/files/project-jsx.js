export default (args) => {
  const content = `import React, { useState } from 'react';

const Count = () => {
  const [count, setCount] = useState(0);
  const increment = () => setCount(prevCount => prevCount + 1);
  const decrement = () => setCount(prevCount => prevCount - 1);
  const reset = () => setCount(0);

  return (
    <div style={styles.container}>
      <h1>Count App</h1>
      <div style={styles.counter}>{count}</div>
      <div style={styles.buttonContainer}>
        <button style={styles.button} onClick={increment}>Increment</button>
        <button style={styles.button} onClick={decrement}>Decrement</button>
        <button style={styles.button} onClick={reset}>Reset</button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    textAlign: 'center',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  },
  counter: {
    fontSize: '2rem',
    margin: '20px 0',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '1rem',
    cursor: 'pointer',
  },
};

export default Count;
  `
  return {
    content,
    filename: `${args.rootdir}/${args.entry}`
  }
}