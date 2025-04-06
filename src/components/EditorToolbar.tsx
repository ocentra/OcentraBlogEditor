import React, { useEffect } from 'react';
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
import styles from '../styles/components/EditorToolbar.module.css';
import { Logger } from '../utils/logger';

const logger = Logger.getInstance('[EditorToolbar]');

interface EditorToolbarProps {
  editor: Editor | null;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor }) => {
  if (!editor) {
    logger.warn('EditorToolbar: Editor instance is null');
    return null;
  }

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

  useEffect(() => {
    if (editor) {
      logger.info('Initialized with extensions');
    }
  }, [editor]);

  return (
    <div className={styles.editorToolbar}>
      <div className={styles.toolbarGroup}>
        <button
          onClick={() => {
            logger.debug('EditorToolbar: Toggling bold');
            editor.chain().focus().toggleBold().run();
          }}
          className={`${styles.toolbarButton} ${editor.isActive('bold') ? styles.toolbarButtonActive : ''}`}
          title="Bold"
        >
          <span role="img" aria-label="bold">𝐁</span>
        </button>
        <button
          onClick={() => {
            logger.debug('EditorToolbar: Toggling italic');
            editor.chain().focus().toggleItalic().run();
          }}
          className={`${styles.toolbarButton} ${editor.isActive('italic') ? styles.toolbarButtonActive : ''}`}
          title="Italic"
        >
          <span role="img" aria-label="italic">𝐼</span>
        </button>
        <button
          onClick={() => {
            logger.debug('EditorToolbar: Toggling underline');
            editor.chain().focus().toggleUnderline().run();
          }}
          className={`${styles.toolbarButton} ${editor.isActive('underline') ? styles.toolbarButtonActive : ''}`}
          title="Underline"
        >
          <span role="img" aria-label="underline">U̲</span>
        </button>
        <button
          onClick={() => {
            logger.debug('EditorToolbar: Toggling highlight');
            editor.chain().focus().toggleHighlight().run();
          }}
          className={`${styles.toolbarButton} ${editor.isActive('highlight') ? styles.toolbarButtonActive : ''}`}
          title="Highlight"
        >
          <span role="img" aria-label="highlight">🖍️</span>
        </button>
      </div>

      <div className={styles.toolbarGroup}>
        <button
          onClick={() => {
            logger.debug('EditorToolbar: Setting heading level 1');
            editor.chain().focus().toggleHeading({ level: 1 }).run();
          }}
          className={`${styles.toolbarButton} ${styles.headingButton} ${editor.isActive('heading', { level: 1 }) ? styles.toolbarButtonActive : ''}`}
          title="Heading 1"
        >
          H1
        </button>
        <button
          onClick={() => {
            logger.debug('EditorToolbar: Setting heading level 2');
            editor.chain().focus().toggleHeading({ level: 2 }).run();
          }}
          className={`${styles.toolbarButton} ${styles.headingButton} ${editor.isActive('heading', { level: 2 }) ? styles.toolbarButtonActive : ''}`}
          title="Heading 2"
        >
          H2
        </button>
        <button
          onClick={() => {
            logger.debug('EditorToolbar: Setting heading level 3');
            editor.chain().focus().toggleHeading({ level: 3 }).run();
          }}
          className={`${styles.toolbarButton} ${styles.headingButton} ${editor.isActive('heading', { level: 3 }) ? styles.toolbarButtonActive : ''}`}
          title="Heading 3"
        >
          H3
        </button>
      </div>

      <div className={styles.toolbarGroup}>
        <button
          onClick={() => {
            logger.debug('EditorToolbar: Toggling bullet list');
            editor.chain().focus().toggleBulletList().run();
          }}
          className={`${styles.toolbarButton} ${editor.isActive('bulletList') ? styles.toolbarButtonActive : ''}`}
          title="Bullet List"
        >
          •
        </button>
        <button
          onClick={() => {
            logger.debug('EditorToolbar: Toggling ordered list');
            editor.chain().focus().toggleOrderedList().run();
          }}
          className={`${styles.toolbarButton} ${editor.isActive('orderedList') ? styles.toolbarButtonActive : ''}`}
          title="Numbered List"
        >
          1.
        </button>
        <button
          onClick={() => {
            logger.debug('EditorToolbar: Toggling task list');
            editor.chain().focus().toggleTaskList().run();
          }}
          className={`${styles.toolbarButton} ${editor.isActive('taskList') ? styles.toolbarButtonActive : ''}`}
          title="Task List"
        >
          ☐
        </button>
      </div>

      <div className={styles.toolbarGroup}>
        <button
          onClick={() => {
            logger.debug('EditorToolbar: Setting text align left');
            editor.chain().focus().setTextAlign('left').run();
          }}
          className={`${styles.toolbarButton} ${editor.isActive({ textAlign: 'left' }) ? styles.toolbarButtonActive : ''}`}
          title="Align Left"
        >
          ⇤
        </button>
        <button
          onClick={() => {
            logger.debug('EditorToolbar: Setting text align center');
            editor.chain().focus().setTextAlign('center').run();
          }}
          className={`${styles.toolbarButton} ${editor.isActive({ textAlign: 'center' }) ? styles.toolbarButtonActive : ''}`}
          title="Align Center"
        >
          ⇔
        </button>
        <button
          onClick={() => {
            logger.debug('EditorToolbar: Setting text align right');
            editor.chain().focus().setTextAlign('right').run();
          }}
          className={`${styles.toolbarButton} ${editor.isActive({ textAlign: 'right' }) ? styles.toolbarButtonActive : ''}`}
          title="Align Right"
        >
          ⇥
        </button>
      </div>

      <div className={styles.toolbarGroup}>
        <button
          onClick={() => {
            logger.debug('EditorToolbar: Toggling subscript');
            editor.chain().focus().toggleSubscript().run();
          }}
          className={`${styles.toolbarButton} ${editor.isActive('subscript') ? styles.toolbarButtonActive : ''}`}
          title="Subscript"
        >
          x₂
        </button>
        <button
          onClick={() => {
            logger.debug('EditorToolbar: Toggling superscript');
            editor.chain().focus().toggleSuperscript().run();
          }}
          className={`${styles.toolbarButton} ${editor.isActive('superscript') ? styles.toolbarButtonActive : ''}`}
          title="Superscript"
        >
          x²
        </button>
      </div>

      <div className={styles.toolbarGroup}>
        <button
          onClick={() => {
            logger.debug('EditorToolbar: Toggling code block');
            editor.chain().focus().toggleCodeBlock().run();
          }}
          className={`${styles.toolbarButton} ${editor.isActive('codeBlock') ? styles.toolbarButtonActive : ''}`}
          title="Insert Code Block (Ctrl+Alt+C)"
        >
          &lt;/&gt;
        </button>
      </div>

      <div className={styles.toolbarGroup}>
        <button
          onClick={() => {
            logger.debug('EditorToolbar: Inserting table');
            editor.chain().focus().insertTable({
              rows: 3,
              cols: 3,
              withHeaderRow: true
            }).run();
          }}
          className={`${styles.toolbarButton} ${styles.tableButton}`}
          title="Insert Table"
        >
          ⊞
        </button>
        <button
          onClick={() => {
            logger.debug('EditorToolbar: Adding column before');
            editor.chain().focus().addColumnBefore().run();
          }}
          className={`${styles.toolbarButton} ${styles.tableButton}`}
          title="Add Column Before"
        >
          ←|
        </button>
        <button
          onClick={() => {
            logger.debug('EditorToolbar: Adding column after');
            editor.chain().focus().addColumnAfter().run();
          }}
          className={`${styles.toolbarButton} ${styles.tableButton}`}
          title="Add Column After"
        >
          |→
        </button>
        <button
          onClick={() => {
            logger.debug('EditorToolbar: Adding row before');
            editor.chain().focus().addRowBefore().run();
          }}
          className={`${styles.toolbarButton} ${styles.tableButton}`}
          title="Add Row Before"
        >
          ↑_
        </button>
        <button
          onClick={() => {
            logger.debug('EditorToolbar: Adding row after');
            editor.chain().focus().addRowAfter().run();
          }}
          className={`${styles.toolbarButton} ${styles.tableButton}`}
          title="Add Row After"
        >
          _↓
        </button>
        <button
          onClick={() => {
            logger.debug('EditorToolbar: Deleting table');
            editor.chain().focus().deleteTable().run();
          }}
          className={`${styles.toolbarButton} ${styles.tableButton}`}
          title="Delete Table"
        >
          ⌫
        </button>
      </div>
    </div>
  );
}; 