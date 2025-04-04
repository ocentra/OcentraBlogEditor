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

const styles = {
  editorToolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px',
    background: 'rgba(0, 0, 0, 0.2)',
    borderBottom: '1px solid var(--editor-border)',
    flexWrap: 'wrap' as const,
  },
  toolbarGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '0 4px',
    '&:not(:last-child)': {
      borderRight: '1px solid var(--editor-border)',
    },
  },
  toolbarButton: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: '1px solid var(--editor-border)',
    borderRadius: '4px',
    color: 'var(--editor-text)',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    padding: 0,
    '&:hover': {
      background: 'var(--editor-hover)',
    },
  },
  toolbarButtonActive: {
    background: 'var(--editor-accent)',
    borderColor: 'var(--editor-accent)',
  },
  headingButton: {
    width: 'auto',
    padding: '0 8px',
    fontWeight: 600,
  },
  tableButton: {
    width: 'auto',
    padding: '0 8px',
    fontSize: '16px',
  },
};

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
    <div style={styles.editorToolbar}>
      <div style={styles.toolbarGroup}>
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          style={{
            ...styles.toolbarButton,
            ...(editor.isActive('bold') ? styles.toolbarButtonActive : {})
          }}
          title="Bold"
        >
          <span role="img" aria-label="bold">𝐁</span>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          style={{
            ...styles.toolbarButton,
            ...(editor.isActive('italic') ? styles.toolbarButtonActive : {})
          }}
          title="Italic"
        >
          <span role="img" aria-label="italic">𝐼</span>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          style={{
            ...styles.toolbarButton,
            ...(editor.isActive('underline') ? styles.toolbarButtonActive : {})
          }}
          title="Underline"
        >
          <span role="img" aria-label="underline">U̲</span>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          style={{
            ...styles.toolbarButton,
            ...(editor.isActive('highlight') ? styles.toolbarButtonActive : {})
          }}
          title="Highlight"
        >
          <span role="img" aria-label="highlight">🖍️</span>
        </button>
      </div>

      <div style={styles.toolbarGroup}>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          style={{
            ...styles.toolbarButton,
            ...styles.headingButton,
            ...(editor.isActive('heading', { level: 1 }) ? styles.toolbarButtonActive : {})
          }}
          title="Heading 1"
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          style={{
            ...styles.toolbarButton,
            ...styles.headingButton,
            ...(editor.isActive('heading', { level: 2 }) ? styles.toolbarButtonActive : {})
          }}
          title="Heading 2"
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          style={{
            ...styles.toolbarButton,
            ...styles.headingButton,
            ...(editor.isActive('heading', { level: 3 }) ? styles.toolbarButtonActive : {})
          }}
          title="Heading 3"
        >
          H3
        </button>
      </div>

      <div style={styles.toolbarGroup}>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          style={{
            ...styles.toolbarButton,
            ...(editor.isActive('bulletList') ? styles.toolbarButtonActive : {})
          }}
          title="Bullet List"
        >
          •
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          style={{
            ...styles.toolbarButton,
            ...(editor.isActive('orderedList') ? styles.toolbarButtonActive : {})
          }}
          title="Numbered List"
        >
          1.
        </button>
        <button
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          style={{
            ...styles.toolbarButton,
            ...(editor.isActive('taskList') ? styles.toolbarButtonActive : {})
          }}
          title="Task List"
        >
          ☐
        </button>
      </div>

      <div style={styles.toolbarGroup}>
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          style={{
            ...styles.toolbarButton,
            ...(editor.isActive({ textAlign: 'left' }) ? styles.toolbarButtonActive : {})
          }}
          title="Align Left"
        >
          ⇤
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          style={{
            ...styles.toolbarButton,
            ...(editor.isActive({ textAlign: 'center' }) ? styles.toolbarButtonActive : {})
          }}
          title="Align Center"
        >
          ⇔
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          style={{
            ...styles.toolbarButton,
            ...(editor.isActive({ textAlign: 'right' }) ? styles.toolbarButtonActive : {})
          }}
          title="Align Right"
        >
          ⇥
        </button>
      </div>

      <div style={styles.toolbarGroup}>
        <button
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          style={{
            ...styles.toolbarButton,
            ...(editor.isActive('subscript') ? styles.toolbarButtonActive : {})
          }}
          title="Subscript"
        >
          x₂
        </button>
        <button
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          style={{
            ...styles.toolbarButton,
            ...(editor.isActive('superscript') ? styles.toolbarButtonActive : {})
          }}
          title="Superscript"
        >
          x²
        </button>
      </div>

      <div style={styles.toolbarGroup}>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          style={{
            ...styles.toolbarButton,
            ...(editor.isActive('codeBlock') ? styles.toolbarButtonActive : {})
          }}
          title="Insert Code Block (Ctrl+Alt+C)"
        >
          &lt;/&gt;
        </button>
      </div>

      <div style={styles.toolbarGroup}>
        <button
          onClick={() => editor.chain().focus().insertTable({
            rows: 3,
            cols: 3,
            withHeaderRow: true
          }).run()}
          style={{
            ...styles.toolbarButton,
            ...styles.tableButton
          }}
          title="Insert Table"
        >
          ⊞
        </button>
        <button
          onClick={() => editor.chain().focus().addColumnBefore().run()}
          style={{
            ...styles.toolbarButton,
            ...styles.tableButton
          }}
          title="Add Column Before"
        >
          ←|
        </button>
        <button
          onClick={() => editor.chain().focus().addColumnAfter().run()}
          style={{
            ...styles.toolbarButton,
            ...styles.tableButton
          }}
          title="Add Column After"
        >
          |→
        </button>
        <button
          onClick={() => editor.chain().focus().addRowBefore().run()}
          style={{
            ...styles.toolbarButton,
            ...styles.tableButton
          }}
          title="Add Row Before"
        >
          ↑_
        </button>
        <button
          onClick={() => editor.chain().focus().addRowAfter().run()}
          style={{
            ...styles.toolbarButton,
            ...styles.tableButton
          }}
          title="Add Row After"
        >
          _↓
        </button>
        <button
          onClick={() => editor.chain().focus().deleteTable().run()}
          style={{
            ...styles.toolbarButton,
            ...styles.tableButton
          }}
          title="Delete Table"
        >
          ⌫
        </button>
      </div>
    </div>
  );
}; 