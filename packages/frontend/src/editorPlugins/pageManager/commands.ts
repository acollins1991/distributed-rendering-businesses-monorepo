import { toPng, toJpeg, toBlob, toPixelData, toSvg } from 'html-to-image';
import type { Editor } from 'grapesjs';

export default (editor: Editor, opts = {}) => { 
    const cm = editor.Commands;

    cm.add('get-uuidv4', () => crypto.randomUUID());

    cm.add('take-screenshot', () => {
        const wrapper = editor.getWrapper()
        const el = wrapper?.getEl();
        if( !el ) {
            throw new Error('Could now find the wrapper element when running the take-screenshot command')
        }

        toJpeg(el, {
            quality: .85,
            width: 500,
            height: 500,
            'cacheBust': true,
            style: {
                backgroundColor: 'white',
                ...wrapper?.getStyle() || {}
            }
        })
    });

    cm.add('save-as-template', () => {
        // editor.Storage.getCurrentStorage()
        //     .setIsTemplate(true);
        // editor.store();
    });

    cm.add('delete-template', () => {
        // editor.Storage.getCurrentStorage()
        //     .delete(opts.onDelete, opts.onDeleteError);
    });
}