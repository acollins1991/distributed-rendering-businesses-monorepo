import { useEffect, useState } from "react";
import AddNewSiteCard from "../components/AddNewSiteCard";
import { useUserStore } from "../stores/user";
import { client } from "../utils/useApi";
import { Link } from "react-router-dom";
import type { Site } from "../../../dashboard/server/entities/site";
import formatTimestamp from "../utils/formatTimestamp";

function SiteCard({ site }: { site: Site }) {

    const urlString = `https://${site.domain}/`

    return <Link to={'/add-new-site'} className='bg-white shadow-md p-3 aspect-square flex flex-col'>
        <div className="m-2.5 overflow-hidden text-white rounded-md">
            <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=crop&amp;w=1471&amp;q=80" alt="card-image" />
        </div>
        <div className="p-4">
            <h6 className="mb-2 text-slate-800 text-xl font-semibold">
                {site.name}
            </h6>
        </div>

        <div className="p-4">
            <p className="text-slate-600">
                {formatTimestamp(site.created_at)}
            </p>
            <Link to={urlString}>{urlString}</Link>
        </div>
    </Link>
}

export default function Home() {

    const user = useUserStore((state) => state.user)

    const [sites, setSites] = useState<Site[]>([])
    useEffect(() => {
        client.api.sites.$get().then(async res => {
            const sitesRes = await res.json() as Site[]
            setSites(sitesRes)
        })
    }, [])

    return <div>
        <h1>{user?.first_name} {user?.last_name}</h1>

        <div className="grid grid-cols-5 gap-4">
            <AddNewSiteCard />
            {sites.map((site, index) => <SiteCard site={site} key={index} />)}
        </div>
    </div>
}