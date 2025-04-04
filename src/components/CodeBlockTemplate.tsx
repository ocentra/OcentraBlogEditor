import React, { useState } from 'react';
import { NodeViewProps } from '@tiptap/core';

const styles = {
  codeBlock: {
    background: '#1e1e1e',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    overflow: 'hidden',
    margin: '1em 0',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  codeBlockHeader: {
    background: '#2d2d2d',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '8px 12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeBlockControls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  languageSelect: {
    background: 'rgba(0, 0, 0, 0.3)',
    color: 'white',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '4px',
    padding: '4px 8px',
    fontSize: '12px',
    marginRight: '8px',
    minWidth: '120px',
  },
  codeBlockActions: {
    display: 'flex',
    gap: '8px',
  },
  actionButton: {
    background: 'transparent',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '4px',
    opacity: 0.7,
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:hover': {
      opacity: 1,
      background: 'rgba(255, 255, 255, 0.1)',
    },
  },
  codeBlockContent: {
    margin: 0,
    padding: '16px',
    background: 'transparent',
    color: 'white',
    fontFamily: "'Fira Code', monospace",
    fontSize: '14px',
    lineHeight: 1.5,
    whiteSpace: 'pre-wrap',
    overflowX: 'auto' as const,
  },
  codeBlockContentEditing: {
    outline: '1px solid rgba(255, 255, 255, 0.2)',
    background: 'rgba(255, 255, 255, 0.05)',
  },
};

const CodeBlockTemplate: React.FC<NodeViewProps> = ({ node, updateAttributes }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(node.textContent || '');
  };

  const handleDelete = () => {
    const selection = window.getSelection();
    if (selection?.rangeCount) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
    }
  };

  return (
    <div style={styles.codeBlock}>
      <div style={styles.codeBlockHeader}>
        <div style={styles.codeBlockControls}>
          <select
            value={(node.attrs as any).language || 'auto'}
            onChange={e => updateAttributes({ language: e.target.value })}
            style={styles.languageSelect}
          >
            <option value="auto">Auto Detect</option>
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="sql">SQL</option>
            {/* Add more language options as needed */}
          </select>
          <div style={styles.codeBlockActions}>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              style={styles.actionButton}
              title={isEditing ? "Save" : "Edit"}
            >
              ✏️
            </button>
            <button 
              onClick={handleCopy}
              style={styles.actionButton}
              title="Copy"
            >
              📋
            </button>
            <button 
              onClick={handleDelete}
              style={styles.actionButton}
              title="Delete"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
      <pre 
        style={{
          ...styles.codeBlockContent,
          ...(isEditing ? styles.codeBlockContentEditing : {})
        }}
        contentEditable={isEditing}
        suppressContentEditableWarning
        spellCheck={false}
      >
        {node.textContent}
      </pre>
    </div>
  );
};

export default CodeBlockTemplate; 