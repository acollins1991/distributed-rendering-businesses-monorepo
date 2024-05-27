import { StrictMode, useEffect, useState } from "react";
import {
    RouterProvider,
} from "react-router-dom";
import { router } from "./router"
import { useUserStore } from "./store/user";
import { getTokenCookie } from "./utils/tokenCookie";

import AppNavbar from "./components/AppNavbar"


export default () => {

    const [authChecked, setAuthChecked] = useState(false)
    const { authenticateFromCookie, isAuthenticated } = useUserStore()

    useEffect(() => {
        if (Boolean(getTokenCookie())) {
            authenticateFromCookie().then((res) => {
                setAuthChecked(true)
            })
        } else {
            setAuthChecked(true)
        }
    }, [])

    return <StrictMode>
        {authChecked ?
            <>
                {isAuthenticated ? <AppNavbar /> : ''}
                <RouterProvider router={router} />
            </>
            : 'Checking Auth'
        }
    </StrictMode>
}