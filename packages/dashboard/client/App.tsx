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

    if (Boolean(getTokenCookie())) {
        authenticateFromCookie().then(() => {
            const { isAuthenticated } = useUserStore.getState()
            setAuthChecked(isAuthenticated)
        })
    }

    return <StrictMode>
        {authChecked ?
            <RouterProvider router={router} />
            : 'Checking Auth'
        }
    </StrictMode>
}