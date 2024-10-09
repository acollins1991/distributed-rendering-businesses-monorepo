import grapesjs, { type Editor } from 'grapesjs';
import GjsEditor from '@grapesjs/react';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { client } from '../utils/useApi';
import type { Template } from '../../../dashboard/server/entities/template';
import type { Component } from '../../../dashboard/server/entities/component';

function DefaultEditor() {

  const { siteId } = useParams()
  const editorEndpoint = client.api.sites[":siteId"].editor.$url({
    param: {
      siteId
    }
  })

  const onEditor = (editor: Editor) => {
    editor.addComponents(`<div>
      <span title="foo">Hello world!!!</span>
    </div>`);
    console.log('Editor loaded', { editor });
  };

  return (
    <GjsEditor
      grapesjs={grapesjs}
      // Load the GrapesJS CSS file asynchronously from URL.
      // This is an optional prop, you can always import the CSS directly in your JS if you wish.
      grapesjsCss="https://unpkg.com/grapesjs/dist/css/grapes.min.css"
      // GrapesJS init options
      options={{
        height: '100vh',
        storageManager: {
          type: "remote",
          autoload: true,
          autosave: true,
          options: {
            remote: {
              urlLoad: editorEndpoint,
              urlStore: editorEndpoint,
              onLoad: result => {
                return result
              }
            }
          }
        }
      }}
      onEditor={onEditor}
    />
  );
}

export default function EditPage() {
  return <DefaultEditor />
}