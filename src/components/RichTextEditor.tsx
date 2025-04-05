import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { EditorToolbar } from './EditorToolbar';
import { useEditor as useTipTapEditor } from '../hooks/useEditor';
import styles from '../styles/components/RichTextEditor.module.css';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = 'Enter your text here...',
  readOnly = false,
}) => {
  const editor = useTipTapEditor({
    content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      if (!readOnly) {
        onChange(editor.getHTML());
      }
    }
  });

  if (!editor) {
    return null;
  }

  return (
    <div className={`${styles.container} ${readOnly ? styles.readOnlyEditor : ''}`}>
      {!readOnly && <EditorToolbar editor={editor} />}
      <EditorContent 
        editor={editor}
        className={styles.editor}
        data-placeholder={placeholder}
      />
    </div>
  );
};

export default RichTextEditor; 