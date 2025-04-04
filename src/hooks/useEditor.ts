import { useEditor as useTipTapEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import Highlight from '@tiptap/extension-highlight';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { ReactNodeViewRenderer } from '@tiptap/react';
import CodeBlockTemplate from '../components/CodeBlockTemplate';

// Initialize lowlight with common languages
const lowlight = createLowlight(common);

export const useEditor = (options: {
  content?: string;
  editable?: boolean;
  onUpdate?: ({ editor }: { editor: any }) => void;
}) => {
  return useTipTapEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3] as const
        },
        codeBlock: false
      }),
      Image.configure({
        inline: true,
        allowBase64: true
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank'
        }
      }),
      Table.configure({
        resizable: true
      }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({
        nested: true
      }),
      CodeBlockLowlight
        .extend({
          addNodeView: () => ReactNodeViewRenderer(CodeBlockTemplate),
          addAttributes() {
            return {
              language: {
                default: 'auto',
                parseHTML: element => element.getAttribute('language') || 'auto',
                renderHTML: attributes => ({
                  language: attributes.language,
                }),
              },
            }
          },
          addKeyboardShortcuts() {
            return {
              'Mod-Alt-c': () => this.editor.commands.toggleCodeBlock()
            }
          }
        })
        .configure({
          lowlight,
          HTMLAttributes: {
            class: 'code-block',
          },
        }),
      Highlight.configure({
        multicolor: true
      }),
      Subscript,
      Superscript,
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      Underline
    ],
    content: options.content || '',
    editable: options.editable ?? true,
    onUpdate: options.onUpdate
  });
}; 