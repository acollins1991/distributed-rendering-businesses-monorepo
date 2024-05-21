import { Form, Button } from "react-bootstrap"
import client from "../utils/authenticatedApiClient"
import type { Template } from "../../server/entities/template"
import type { Site } from "../../server/entities/site"

export default ({ site, template }: { site: Site, template: Template }) => {

    async function onSubmit(e) {
        e.preventDefault()
        const form = e.target as HTMLFormElement
        const valid = form.checkValidity()

        const formData = new FormData(form)
        const submissionObject = {}
        formData.forEach((value: string, key: string) => submissionObject[key] = value);

        const res = client.sites[":siteId"].templates[":templateId"].$patch({
            param: {
                siteId: site.siteId,
                templateId: template.templateId
            },
            json: {
                variables: {
                    page_title: submissionObject.page_title,
                    page_content: submissionObject.page_content
                }
            }
        })

    }

    return <Form onSubmit={onSubmit}>
        <Form.Group className="mb-3" controlId="page_title">
            <Form.Label>Page Title</Form.Label>
            <Form.Control type="text" name="page_title" placeholder="Enter page title" defaultValue={template.variables.page_title} />
        </Form.Group>

        <Form.Group className="mb-3" controlId="page_content">
            <Form.Label>Page Content</Form.Label>
            <Form.Control type="text" name="page_content" placeholder="Enter page content" defaultValue={template.variables.page_content} />
        </Form.Group>
        <Button variant="primary" type="submit">
            Submit
        </Button>
    </Form>
}