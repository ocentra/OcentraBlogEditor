import React from 'react';
import { Editor } from '@tiptap/react';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import Heading from '@tiptap/extension-heading';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import TaskList from '@tiptap/extension-task-list';
import TextAlign from '@tiptap/extension-text-align';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import CodeBlock from '@tiptap/extension-code-block-lowlight';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';

interface EditorToolbarProps {
  editor: Editor | null;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor }) => {
  if (!editor) return null;

  // Configure editor extensions
  const extensions = [
    Bold,
    Italic,
    Underline,
    Highlight.configure({
      multicolor: true,
    }),
    Heading.configure({
      levels: [1, 2, 3],
    }),
    BulletList,
    OrderedList,
    TaskList,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Subscript,
    Superscript,
    CodeBlock.configure({
      lowlight: {
        // Add your code highlighting configuration here
      },
    }),
    Table.configure({
      resizable: true,
    }),
    TableRow,
    TableCell,
    TableHeader,
  ];

  return (
    <div className="editor-toolbar">
      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'is-active' : ''}
          title="Bold"
        >
          <span role="img" aria-label="bold">𝐁</span>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'is-active' : ''}
          title="Italic"
        >
          <span role="img" aria-label="italic">𝐼</span>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive('underline') ? 'is-active' : ''}
          title="Underline"
        >
          <span role="img" aria-label="underline">U̲</span>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={editor.isActive('highlight') ? 'is-active' : ''}
          title="Highlight"
        >
          <span role="img" aria-label="highlight">🖍️</span>
        </button>
      </div>

      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
          title="Heading 1"
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
          title="Heading 2"
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
          title="Heading 3"
        >
          H3
        </button>
      </div>

      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'is-active' : ''}
          title="Bullet List"
        >
          •
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'is-active' : ''}
          title="Numbered List"
        >
          1.
        </button>
        <button
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={editor.isActive('taskList') ? 'is-active' : ''}
          title="Task List"
        >
          ☐
        </button>
      </div>

      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}
          title="Align Left"
        >
          ⇤
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}
          title="Align Center"
        >
          ⇔
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}
          title="Align Right"
        >
          ⇥
        </button>
      </div>

      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          className={editor.isActive('subscript') ? 'is-active' : ''}
          title="Subscript"
        >
          x₂
        </button>
        <button
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          className={editor.isActive('superscript') ? 'is-active' : ''}
          title="Superscript"
        >
          x²
        </button>
      </div>

      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive('codeBlock') ? 'is-active' : ''}
          title="Insert Code Block (Ctrl+Alt+C)"
        >
          &lt;/&gt;
        </button>
      </div>

      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().insertTable({
            rows: 3,
            cols: 3,
            withHeaderRow: true
          }).run()}
          title="Insert Table"
        >
          ⊞
        </button>
        <button
          onClick={() => editor.chain().focus().addColumnBefore().run()}
          title="Add Column Before"
        >
          ←|
        </button>
        <button
          onClick={() => editor.chain().focus().addColumnAfter().run()}
          title="Add Column After"
        >
          |→
        </button>
        <button
          onClick={() => editor.chain().focus().addRowBefore().run()}
          title="Add Row Before"
        >
          ↑_
        </button>
        <button
          onClick={() => editor.chain().focus().addRowAfter().run()}
          title="Add Row After"
        >
          _↓
        </button>
        <button
          onClick={() => editor.chain().focus().deleteTable().run()}
          title="Delete Table"
        >
          ⌫
        </button>
      </div>
    </div>
  );
}; 