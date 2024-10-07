import { useEffect, useState } from 'react'
import './App.css'
import { client } from './utils/useApi'

function App() {
  async function formHandler(event: Event) {
    event.preventDefault()
    const form = event.target as HTMLFormElement
    const details = new FormData(form).entries().reduce((accumulator: Record<string, any>, current: [string, any]) => {
      accumulator[current[0]] = current[1]
      return accumulator
    }, {})
    
    client.api.signin.$post({
      json: details
    })
  }

  return (
    <>
      <div className="w-full max-w-xs">
        <form onSubmit={formHandler} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
              Email
            </label>
            <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" name='email' type="email" placeholder="Username" />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input className="shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" name='password' type="password" placeholder="******************" />
              <p className="text-red-500 text-xs italic">Please choose a password.</p>
          </div>
          <div className="flex items-center justify-between">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
              Sign In
            </button>
            <a className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800" href="#">
              Forgot Password?
            </a>
          </div>
        </form>
        <p className="text-center text-gray-500 text-xs">
          &copy;2020 Acme Corp. All rights reserved.
        </p>
      </div>
    </>
  )
}

export default App
