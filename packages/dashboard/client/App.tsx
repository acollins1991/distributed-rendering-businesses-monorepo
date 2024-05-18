import { useEffect } from "react"
import apiClient from "./utils/apiClient"
import { useState } from 'react';

export default function App(props: { message: string }) {

    const [user, setUser] = useState<String>()

    useEffect(() => {
        apiClient.api.user.$get().then(res => {
            console.log(res)
        })
        setUser(() => {
            return 'testing'
        })
    })

    return <p>{user}</p>
}