import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { EditorToolbar } from './EditorToolbar';
import { useEditor as useTipTapEditor } from '../hooks/useEditor';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

const styles = {
  container: {
    position: 'relative' as const,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  editor: {
    minHeight: '100%',
    padding: '20px',
    color: '#ffffff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
    lineHeight: 1.6,
    fontSize: '1.1rem',
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
  },
  paragraph: {
    marginBottom: '1rem',
  },
  heading: {
    color: '#ffffff',
    fontWeight: 600,
    lineHeight: 1.2,
    marginTop: '2rem',
    marginBottom: '1rem',
  },
  h1: {
    fontSize: '2.5rem',
  },
  h2: {
    fontSize: '2rem',
  },
  h3: {
    fontSize: '1.75rem',
  },
  h4: {
    fontSize: '1.5rem',
  },
  h5: {
    fontSize: '1.25rem',
  },
  h6: {
    fontSize: '1rem',
  },
  list: {
    paddingLeft: '1.5rem',
    marginBottom: '1rem',
  },
  listItem: {
    marginBottom: '0.5rem',
  },
  blockquote: {
    borderLeft: '4px solid #4a9eff',
    paddingLeft: '1rem',
    margin: '1.5rem 0',
    fontStyle: 'italic',
    color: '#a0a0a0',
  },
  code: {
    background: '#2a2a2a',
    padding: '0.2rem 0.4rem',
    borderRadius: '4px',
    fontFamily: '"Fira Code", monospace',
    fontSize: '0.9em',
  },
  pre: {
    background: '#2a2a2a',
    padding: '1rem',
    borderRadius: '4px',
    overflowX: 'auto' as const,
    margin: '1.5rem 0',
  },
  preCode: {
    background: 'none',
    padding: 0,
    color: '#e0e0e0',
  },
  image: {
    maxWidth: '100%',
    height: 'auto',
    borderRadius: '8px',
    margin: '1rem 0',
  },
  link: {
    color: '#4a9eff',
    textDecoration: 'none',
  },
  linkHover: {
    textDecoration: 'underline',
  },
  table: {
    borderCollapse: 'collapse' as const,
    margin: '1rem 0',
    width: '100%',
  },
  tableCell: {
    border: '1px solid #4a4a4a',
    padding: '0.5rem',
    textAlign: 'left' as const,
  },
  tableHeader: {
    backgroundColor: '#2a2a2a',
    fontWeight: 600,
  },
  tableWrapper: {
    overflowX: 'auto' as const,
    margin: '1rem 0',
  },
  readOnlyEditor: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    borderRadius: '16px',
    padding: '20px',
    overflowY: 'auto' as const,
  },
};

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
    <div style={{
      ...styles.container,
      ...(readOnly && styles.readOnlyEditor),
    }}>
      {!readOnly && <EditorToolbar editor={editor} />}
      <EditorContent 
        editor={editor}
        style={styles.editor}
        data-placeholder={placeholder}
      />
      <style>{`
        .ProseMirror p { ${Object.entries(styles.paragraph).map(([k, v]) => `${k}: ${v}`).join(';')} }
        .ProseMirror h1, .ProseMirror h2, .ProseMirror h3, .ProseMirror h4, .ProseMirror h5, .ProseMirror h6 { ${Object.entries(styles.heading).map(([k, v]) => `${k}: ${v}`).join(';')} }
        .ProseMirror h1 { ${Object.entries(styles.h1).map(([k, v]) => `${k}: ${v}`).join(';')} }
        .ProseMirror h2 { ${Object.entries(styles.h2).map(([k, v]) => `${k}: ${v}`).join(';')} }
        .ProseMirror h3 { ${Object.entries(styles.h3).map(([k, v]) => `${k}: ${v}`).join(';')} }
        .ProseMirror h4 { ${Object.entries(styles.h4).map(([k, v]) => `${k}: ${v}`).join(';')} }
        .ProseMirror h5 { ${Object.entries(styles.h5).map(([k, v]) => `${k}: ${v}`).join(';')} }
        .ProseMirror h6 { ${Object.entries(styles.h6).map(([k, v]) => `${k}: ${v}`).join(';')} }
        .ProseMirror ul, .ProseMirror ol { ${Object.entries(styles.list).map(([k, v]) => `${k}: ${v}`).join(';')} }
        .ProseMirror li { ${Object.entries(styles.listItem).map(([k, v]) => `${k}: ${v}`).join(';')} }
        .ProseMirror blockquote { ${Object.entries(styles.blockquote).map(([k, v]) => `${k}: ${v}`).join(';')} }
        .ProseMirror code { ${Object.entries(styles.code).map(([k, v]) => `${k}: ${v}`).join(';')} }
        .ProseMirror pre { ${Object.entries(styles.pre).map(([k, v]) => `${k}: ${v}`).join(';')} }
        .ProseMirror pre code { ${Object.entries(styles.preCode).map(([k, v]) => `${k}: ${v}`).join(';')} }
        .ProseMirror img { ${Object.entries(styles.image).map(([k, v]) => `${k}: ${v}`).join(';')} }
        .ProseMirror a { ${Object.entries(styles.link).map(([k, v]) => `${k}: ${v}`).join(';')} }
        .ProseMirror a:hover { ${Object.entries(styles.linkHover).map(([k, v]) => `${k}: ${v}`).join(';')} }
        .ProseMirror table { ${Object.entries(styles.table).map(([k, v]) => `${k}: ${v}`).join(';')} }
        .ProseMirror th, .ProseMirror td { ${Object.entries(styles.tableCell).map(([k, v]) => `${k}: ${v}`).join(';')} }
        .ProseMirror th { ${Object.entries(styles.tableHeader).map(([k, v]) => `${k}: ${v}`).join(';')} }
        .ProseMirror .tableWrapper { ${Object.entries(styles.tableWrapper).map(([k, v]) => `${k}: ${v}`).join(';')} }
      `}</style>
    </div>
  );
};

export default RichTextEditor; 