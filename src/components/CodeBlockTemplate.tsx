import React, { useState } from 'react';
import { NodeViewProps } from '@tiptap/core';
import '../styles/components/CodeBlockTemplate.css';

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
    <div className="codeBlock">
      <div className="codeBlockHeader">
        <div className="codeBlockControls">
          <select
            value={(node.attrs as any).language || 'auto'}
            onChange={e => updateAttributes({ language: e.target.value })}
            className="languageSelect"
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
          <div className="codeBlockActions">
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="actionButton"
              title={isEditing ? "Save" : "Edit"}
            >
              ✏️
            </button>
            <button 
              onClick={handleCopy}
              className="actionButton"
              title="Copy"
            >
              📋
            </button>
            <button 
              onClick={handleDelete}
              className="actionButton"
              title="Delete"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
      <pre 
        className={`codeBlockContent ${isEditing ? 'codeBlockContentEditing' : ''}`}
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