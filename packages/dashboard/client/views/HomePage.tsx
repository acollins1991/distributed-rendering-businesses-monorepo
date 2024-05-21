import { useEffect, useState } from "react";
import { useUserStore } from "../store/user";
import client from "../utils/authenticatedApiClient"
import { Link } from "react-router-dom";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import HomePageAddSiteButton from "../components/HomePageAddSiteButton";
import type { Site } from "../../server/entities/site";


export default function () {
    const { user } = useUserStore()

    const [isLoading, setisLoading] = useState(true)
    const [sites, setSites] = useState<Site[]>([])

    useEffect(() => {
        if (user?.sites.length) {
            client.sites.$get().then(async res => {
                const json = await res.json()
                setSites(json)
                setisLoading(false)
            })
        } else {
            setisLoading(false)
        }
    }, [isLoading])

    return <div>

        {isLoading ?

            "Loading sites"

            :

            <ul>
                {
                    sites.map((site) => {
                        if (site.siteId) {
                            return <li key={site.siteId}>
                                <Link to={`/site/${site.siteId}/edit/${site.default_template}`} >{site.name}</Link>
                            </li>
                        }
                    })
                }
                <li><HomePageAddSiteButton /></li>
            </ul>

        }

    </div>
}