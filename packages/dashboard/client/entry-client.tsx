import { App } from "./App";
import { render } from "solid-js/web";
import './assets/app.css'

const root = document.getElementById('root')
console.log(root)
render(() => <App />, root)