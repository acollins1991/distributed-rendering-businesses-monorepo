import * as ReactDOM from 'react-dom/client';
import { App } from "./App"

const root = ReactDOM.createRoot(document.getElementById('root')!);

console.log('testomg testing testing')
root.render(<App message="Sup!" />)