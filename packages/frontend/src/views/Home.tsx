import { useEffect, useState } from "react";
import AddNewSiteCard from "../components/AddNewSiteCard";
import { useUserStore } from "../stores/user";
import { client } from "../utils/useApi";
import { Link } from "react-router-dom";
import type { Site } from "../../../dashboard/server/entities/site";
import formatTimestamp from "../utils/formatTimestamp";

type SiteDeletionTriggered = (promise: Promise<Site["siteId"]>) => Promise<void>

function SiteCard({ site, siteDeletionTriggered }: { site: Site, siteDeletionTriggered: SiteDeletionTriggered }) {

    const urlString = `https://${site.domain}/`

    const [beingDeleted, setBeingDeleted] = useState(false)
    function deleteSite() {
        setBeingDeleted(true)
        siteDeletionTriggered(client.api.sites[":siteId"].$delete({
            param: {
                siteId: site.siteId
            }
        }))
    }

    return <div className='bg-white shadow-md p-3 aspect-square flex flex-col'>
        <div className="m-2.5 overflow-hidden text-white rounded-md">
            <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=crop&amp;w=1471&amp;q=80" alt="card-image" />
        </div>
        <div className="p-4">
            <h6 className="mb-2 text-slate-800 text-xl font-semibold">
                {site.name}
            </h6>
            <p className="text-slate-600 text-sm">Last Updates: {formatTimestamp(site.updated_at, true)}</p>
            <p className="text-slate-600 text-sm">Created: {formatTimestamp(site.created_at, true)}</p>
        </div>

        <div className="py-4 m-auto flex justify-between gap-4">
            <Link
                to={`/sites/${site.siteId}/edit`}
                className="flex items-center rounded-md bg-slate-800 py-1 px-2.5 border border-transparent text-center text-sm text-white transition-all shadow-sm hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none" type="button">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg> Edit
            </Link>

            <Link
                to={urlString}
                className="flex items-center rounded-md border border-slate-300 py-1 px-2.5 text-center text-sm transition-all shadow-sm hover:shadow-lg text-slate-600 hover:text-white hover:bg-slate-800 hover:border-slate-800 focus:text-white focus:bg-slate-800 focus:border-slate-800 active:border-slate-800 active:text-white active:bg-slate-800 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none" type="button">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                </svg>
                Visit
            </Link>

            <button
                onClick={deleteSite}
                className="flex items-center rounded-md bg-red-600 py-1 px-2.5 border border-transparent text-center text-sm text-white transition-all shadow-sm hover:shadow-lg focus:bg-red-700 focus:shadow-none active:bg-red-700 hover:bg-red-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none" type="button">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
                Delete
            </button>
        </div>

    </div>
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

    const siteDeletionTriggered: SiteDeletionTriggered = async (promise) => {
        const res = await promise
        const { data: { siteId } } = await res.json()

        const removedSiteIndex = sites.findIndex(s => s.siteId === siteId)

        if( typeof removedSiteIndex === 'number' ) {
            sites.splice(removedSiteIndex, 1)
            setSites([...sites])
        }

        return
    }

    return <div>
        <h1>{user?.first_name} {user?.last_name}</h1>

        <div className="grid grid-cols-5 gap-4">
            <AddNewSiteCard />
            {sites.map((site, index) => <SiteCard site={site} key={index} siteDeletionTriggered={siteDeletionTriggered} />)}
        </div>
    </div>
}