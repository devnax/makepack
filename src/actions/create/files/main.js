export default async ({ template }) => {

   let ext = 'jsx'
   if (template === 'react with typescript') {
      ext = 'tsx'
   } else if (template === 'typescript') {
      ext = 'ts'
   }
   else if (template === 'javascript') {
      ext = 'js'
   }

   const content = `import React from 'react';
import { createRoot } from 'react-dom/client';
import ${ext.includes("sx") ? "Count" : "sum"} from './src/index.${ext}';

const Main = () => {
  return (
    <div>
      <h1>Welcome to makepack CLI!</h1>
      <p>Edit <code>index.${ext}</code> and save to reload.</p>
      ${ext.includes("sx") ? "<Count />" : "<p>The sum is: {sum(5, 5)}</p>"}
    </div>
  );
};

const rootEle = document.getElementById('root')
if (rootEle) {
  const root = createRoot(rootEle);
  root.render(<Main />);
}
  `
   return {
      content,
      filename: `main.${ext.includes('ts') ? "tsx" : 'jsx'}`
   }
}