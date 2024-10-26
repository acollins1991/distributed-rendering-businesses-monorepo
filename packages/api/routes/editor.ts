import { Hono } from 'hono'
import { updateGrapeJsProjectData, type Site } from '../entities/site'
import type { User } from 'lucia'

const editor = new Hono<{
    Variables: {
        site: Site,
        user: User
    }
}>()

editor.get(
    "/",
    async (c) => {
        const site = c.get("site")
        const project_data = site.grapejs_project_data

        try {
            return c.json(project_data, 200)
        } catch (e: any) {
            return c.json(e, 500)
        }
    })

// looks like ProjectData from grapejs is just an object with any structure
editor.post(
    "/",
    // no validator as for some reason it kept coming back as a blank object when using c.req.valid("json"), but  c.req.json() seems to work
    async (c) => {
        const site = c.get("site")
        const project_data = await c.req.json()

        const { data: { grapejs_project_data } } = await updateGrapeJsProjectData(site.siteId, JSON.parse(project_data))

        try {
            return c.json(grapejs_project_data, 200)
        } catch (e: any) {
            return c.json(e, 500)
        }
    })

export default editor