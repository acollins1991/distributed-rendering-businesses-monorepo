import { StrictMode, useEffect, useState } from "react";
import * as ReactDOM from "react-dom/client";
import {
    RouterProvider,
} from "react-router-dom";
import { router } from "./router"
import { useUserStore } from "./store/user";
import { getTokenCookie } from "./utils/tokenCookie";


export default () => {

    const [authChecked, setAuthChecked] = useState(false)
    const { authenticateFromCookie } = useUserStore()

    useEffect(() => {
        if (Boolean(getTokenCookie())) {
            authenticateFromCookie().then((res) => {
                const { isAuthenticated } = useUserStore.getState()
                setAuthChecked(true)
            })
        } else {
            setAuthChecked(true)
        }
    }, [authChecked])

    return <StrictMode>
        {authChecked ?
            <RouterProvider router={router} />
            : 'Checking Auth'
        }
    </StrictMode>
}