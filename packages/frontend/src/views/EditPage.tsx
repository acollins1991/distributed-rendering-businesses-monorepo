import grapesjs, { type Editor } from 'grapesjs';
import GjsEditor from '@grapesjs/react';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { client } from '../utils/useApi';
import type { Template } from '../../../dashboard/server/entities/template';

function DefaultEditor() {
  const onEditor = (editor: Editor) => {
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
    const [template, setTemplate] = useState()

    useEffect(() => {
        client.api.sites[":siteId"].templates[":templateId"].$get({
            param: {
                siteId,
                templateId
            }
        }).then(async res => {
            const templateRes = await res.json() as Template
            // if( templateRes.registered_components ) 
        })
    }, [])

    return <DefaultEditor />
}