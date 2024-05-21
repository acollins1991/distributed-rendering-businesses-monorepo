import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import client from "../utils/authenticatedApiClient"
import type { Site } from "../../server/entities/site"
import type { Template } from "../../server/entities/template"
import SiteEditPageForm from "../components/SiteEditPageForm"

export default () => {
    const { siteId, templateId } = useParams()

    const [isLoading, setIsLoading] = useState(true)
    const [site, setSite] = useState<Site>()
    const [template, setTemplate] = useState<Template>()

    useEffect(() => {
        client.sites[':siteId'].$get({
            param: {
                siteId
            }
        }).then(async res => {
            const json = await res.json() as Site
            setSite(json)
            const templateRes = await client.sites[':siteId'].templates[":templateId"].$get({
                param: {
                    siteId,
                    templateId
                }
            })
            const templateJson = await templateRes.json() as Template
            setTemplate(templateJson)
            setIsLoading(false)
        })
    }, [isLoading])

    return <div>
        {
            isLoading ?
                "Loading site and default template"
                :
                <SiteEditPageForm site={site} template={template} />

        }
    </div>
}