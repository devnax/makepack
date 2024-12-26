export default (args) => {
  const content = `import React from 'react';
const App = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Welcome to React JS with makepack CLI!</h1>
      <p>Edit <code>index.tsx</code> and save to reload.</p>
      <a
        href="https://reactjs.org"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: '#61dafb', textDecoration: 'none' }}
      >
        Learn React
      </a>
    </div>
  );
};
export default App;
  `
  return {
    content,
    filename: `${args.rootdir}/${args.entry}`
  }
}