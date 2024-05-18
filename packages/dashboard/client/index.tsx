import * as ReactDOM from 'react-dom/client';
import { Component } from "./Component"

const root = ReactDOM.createRoot(document.getElementById('root')!);

console.log('testomg testing testing')
root.render(<Component message="Sup!" />)