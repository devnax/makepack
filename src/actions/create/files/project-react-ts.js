export default args => {
  const content = `import React from 'react';
import { createRoot } from 'react-dom/client';

const App: React.FC  = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Welcome to React Typescript with makepack CLI!</h1>
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
}
const root = createRoot(document.getElementById('root'));
root.render(<App />);
  `
  return {
    content,
    filename: `${args.rootdir}/${args.entry}`
  }
}