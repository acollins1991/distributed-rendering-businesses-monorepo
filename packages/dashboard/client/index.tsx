import { StrictMode, useEffect } from "react";
import * as ReactDOM from "react-dom/client";
import {
    RouterProvider,
} from "react-router-dom";
import { router } from "./router"
import { useUserStore } from "./store/user";

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
)