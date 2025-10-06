import { Navigate } from "react-router-dom";
import { useUserStore } from "../stores/user";

type GuestRouteProps = {
    children: React.ReactNode;
};

export const GuestRoute = ({
    children,
}: GuestRouteProps) => {
    const isAuthenticated = useUserStore(store => store.isAuthenticated)
    const user = useUserStore(store => store.user)
    if (isAuthenticated) {
        return <Navigate to='/' replace />;
    }

    return children;
};