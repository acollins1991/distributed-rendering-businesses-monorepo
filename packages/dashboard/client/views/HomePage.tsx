import { useUserStore } from "../store/user";

export default function () {
    const { user } = useUserStore()
    return <div>{user ? JSON.stringify(user) : ''}</div>
}