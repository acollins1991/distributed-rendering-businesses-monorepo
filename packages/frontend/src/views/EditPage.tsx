import grapesjs, { type Editor } from 'grapesjs';
import GjsEditor from '@grapesjs/react';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { client } from '../utils/useApi';
import type { Template } from '../../../dashboard/server/entities/template';
import type { Component } from '../../../dashboard/server/entities/component';

function DefaultEditor({ template, components }: { template: Template, components: Component[] }) {
  const onEditor = (editor: Editor) => {
    if (template.content) {
      editor.addComponents(template.content)
    }
    console.log('Editor loaded', { editor });
  };

  return (
    <GjsEditor
      // Pass the core GrapesJS library to the wrapper (required).
      // You can also pass the CDN url (eg. "https://unpkg.com/grapesjs")
      grapesjs={grapesjs}
      // Load the GrapesJS CSS file asynchronously from URL.
      // This is an optional prop, you can always import the CSS directly in your JS if you wish.
      grapesjsCss="https://unpkg.com/grapesjs/dist/css/grapes.min.css"
      // GrapesJS init options
      options={{
        height: '100vh',
        storageManager: false,
      }}
      onEditor={onEditor}
    />
  );
}

export default function EditPage() {

  const { siteId, templateId } = useParams()
  const [template, setTemplate] = useState<Template>()
  const [components, setComponents] = useState<Component[]>()
  const [isLoading, setIsLoading] = useState(true)

  async function getTemplateAndComponents() {

    const res = await client.api.sites[":siteId"].templates[":templateId"].$get({
      param: {
        siteId,
        templateId
      }
    })
    const templateRes = await res.json() as Template
    setTemplate(templateRes)

    if (templateRes.registered_components && templateRes.registered_components.length) {
      client.api.sites[":siteId"].components.specific.$get({
        query: {
          ids: templateRes.registered_components
        }
      }).then(async res => {
        const componentsRes = await res.json() as Component[]
        setComponents(componentsRes)
      })
    }
  }

  useEffect(() => {
    getTemplateAndComponents().then(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return 'Loading'
  } else if (template) {
    console.log(template)
    return <DefaultEditor template={template} components={components ?? []} />
  }
}