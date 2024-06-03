import { useEffect, useState } from "react";
import { useUserStore } from "../store/user";
import client from "../utils/authenticatedApiClient"
import { Link } from "react-router-dom";
import HomePageAddSiteButton from "../components/HomePageAddSiteButton";
import type { Site } from "../../server/entities/site";

export default function () {
    const { user } = useUserStore()

    const [isLoading, setisLoading] = useState(true)
    const [sites, setSites] = useState<Site[]>([])

    async function refreshSitesState() {
        setisLoading(true)
        if (user?.sites?.length) {
            client.sites.$get().then(async res => {
                const json = await res.json() as Site
                setSites(json)
                setisLoading(false)
            })
        }
        setisLoading(false)
    }

    useEffect(() => {
        refreshSitesState()
    }, [])

    return <div>

        {isLoading ?

            "Loading sites"

            :

            <ul>
                {
                    sites.map((site) => {
                        if (site.siteId) {
                            return <li key={site.siteId} className="mb-4">
                                <Link to={`/site/${site.siteId}/edit/${site.default_template}`} className="d-block mb-2">Edit {site.name}</Link>
                                Link: <a href={`http://${site.domain}`}>{site.domain}</a>
                            </li>
                        }
                    })
                }
                <li><HomePageAddSiteButton onNewSiteAdded={refreshSitesState} /></li>
            </ul>

        }

    </div>
}