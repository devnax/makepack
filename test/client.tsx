import ReactDOM from 'react-dom/client'
import React from 'react'
import calc from '.'
const OSMain = () => {
   return (
      <div>{calc(2, 2)}</div>
   )
}

ReactDOM.createRoot(document.getElementById('root') as any).render(<OSMain />)
