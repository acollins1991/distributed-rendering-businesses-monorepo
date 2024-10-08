import AddNewSiteCard from "../components/AddNewSiteCard";
import { useUserStore } from "../stores/user";

export default function Home() {

    const user = useUserStore((state) => state.user)

    return <div>
        <h1>{user?.first_name} {user?.last_name}</h1>

        <div className="grid grid-cols-5 gap-4">
            <AddNewSiteCard />
        </div>
    </div>
}