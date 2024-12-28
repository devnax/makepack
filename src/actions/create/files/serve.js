export default args => {
  let ext = ".jsx"
  switch (args.template) {
    case "react with typescript":
      ext = ".tsx"
  }

  const content = `import React from 'react';
import { createRoot } from 'react-dom/client';

const App  = () => {
  return (
    <div style={{fontFamily: 'monospace,math, sans-serif', textAlign: 'center', marginTop: '50px' }}>
      <h1>Welcome to makepack CLI!</h1>
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
const rootEle = document.getElementById('root')
if (rootEle) {
  const root = createRoot(rootEle);
  root.render(<App />);
}
  `
  return {
    content,
    filename: `serve${ext}`
  }
}