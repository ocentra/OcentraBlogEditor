import React, { useState } from 'react';
import { NodeViewProps } from '@tiptap/core';

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
    <div className="code-block">
      <div className="code-block-header">
        <div className="code-block-controls">
          <select
            value={(node.attrs as any).language || 'auto'}
            onChange={e => updateAttributes({ language: e.target.value })}
            className="language-select"
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
          <div className="code-block-actions">
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="action-button"
              title={isEditing ? "Save" : "Edit"}
            >
              ✏️
            </button>
            <button 
              onClick={handleCopy}
              className="action-button"
              title="Copy"
            >
              📋
            </button>
            <button 
              onClick={handleDelete}
              className="action-button"
              title="Delete"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
      <pre 
        className={`code-block-content ${isEditing ? 'editing' : ''}`}
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