import grapesjs, { type Editor, type ProjectData } from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import GjsEditor from '@grapesjs/react';
import { useParams } from 'react-router-dom';
import { client } from '../utils/useApi';
import websitePresetPlugin from 'grapesjs-preset-webpage';
import basicBlocksPlugin from 'grapesjs-blocks-basic'
import { useRef, useState, type ChangeEventHandler, type FormEventHandler } from 'react';
import PageSelectorDropdown from '../components/PageSelectorDropdown';
import FormInput from '../components/FormInput';
// import pagesManagerPlugin from "../utils/"

function DefaultEditor() {

  const { siteId } = useParams()
  const editorEndpoint = client.api.sites[":siteId"].editor.$url({
    param: {
      siteId
    }
  })

  const editorRef = useRef<Editor>()
  const onEditor = (editor: Editor) => {
    console.log('Editor loaded', { editor });
    editorRef.current = editor
  };

  const [pageOptions, setPageOptions] = useState<{ text: string, value: HTMLSelectElement["value"] }[]>([])
  function updatePageSelectOptions(editor: Editor) {
    const pages = editor.Pages.getAll()
    console.log(pages)
    setPageOptions(pages.map((page, index) => ({
      text: page.attributes.name || `Page ${index}`,
      value: page.attributes.id!
    })))
  }

  const onReady = (editor: Editor) => {
    updatePageSelectOptions(editor)
  }

  const onLoad = (data: ProjectData, editor: Editor): ProjectData => {
    return data
  }

  const onPageSelectChange = (event: Event) => {
    const target = event.target as HTMLSelectElement
    if (editorRef.current) {
      editorRef.current.Pages.select(target.value)
    }
  }

  const onNewPageSubmit: FormEventHandler<HTMLFormElement> = (event: Event) => {
    event.preventDefault()

    const form = event.target as HTMLFormElement
    const details = new FormData(form).entries().reduce((accumulator: Record<string, any>, current: [string, any]) => {
      accumulator[current[0]] = current[1]
      return accumulator
    }, {})

    const newPage = editorRef.current?.Pages.add({
      name: details.page_name,
      path: details.page_path
    })

    if (!newPage) {
      throw new Error('Problem creating new page')
    }

    editorRef.current?.Pages.select(newPage.id.toString())

    if (editorRef.current) { updatePageSelectOptions(editorRef.current) }

  }

  return <>

    <div className='py-3'>
      <div className='py-3'>
        <form style={{ width: '300px' }} onSubmit={onNewPageSubmit}>
          <FormInput type="text" name='page_name' label='Page Name' required />
          <FormInput type="text" name='page_path' label='Page Path' required />
          <button type='submit' className="mt-2 w-full rounded-md bg-slate-800 py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none">
            Create
          </button>
        </form>
      </div>

      <PageSelectorDropdown options={pageOptions} onChange={onPageSelectChange} />

    </div>

    <GjsEditor
      grapesjs={grapesjs}
      plugins={[basicBlocksPlugin, websitePresetPlugin]}
      onReady={onReady}
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
              onLoad,
              onStore: (data, editor) => {
                return data
              }
            }
          }
        },
        // this creates by default the homepage with path /
        // pageManager: {
        //   pages: [
        //     {
        //       name: 'Homepage',
        //       path: '/',
        //     }
        //   ]
        // }
      }}
      onEditor={onEditor}
    />
  </>;
}

export default function EditPage() {
  return <DefaultEditor />
}