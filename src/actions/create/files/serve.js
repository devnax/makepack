export default args => {
  let ext = args.template === 'react with typescript' ? ".tsx" : ".jsx"
  let _import = ''
  let _code = ''

  switch (args.template) {
    case "typescript":
    case "javascript":
      _import = `import add from './${args.rootdir}'`
      _code = `<code>{add(5,5)}</code>`
      break
    case "react with typescript":
    case "react with javascript":
      _import = `import Count from './${args.rootdir}'`
      _code = `<Count />`
      break;
  }

  const content = `import React from 'react';
import { createRoot } from 'react-dom/client';
${_import}

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
      <div style={{marginTop: "50px"}}>
        ${_code}
      </div>
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