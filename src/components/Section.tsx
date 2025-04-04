import React from 'react';
import { BlogSection } from '../types';
import RichTextEditor from './RichTextEditor';

interface SectionProps {
  type: BlogSection['type'];
  content: string;
  metadata: BlogSection['metadata'];
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onUpdate: (content: string) => void;
  onTypeChange: (type: string) => void;
  onTitleChange: (title: string) => void;
  onEdit?: () => void;
  readOnly?: boolean;
}

export const Section: React.FC<SectionProps> = ({
  type,
  content,
  metadata,
  isActive,
  onSelect,
  onDelete,
  onUpdate,
  onTypeChange,
  onTitleChange,
  onEdit,
  readOnly = false,
}) => {
  const renderContent = () => {
    switch (type) {
      case 'code':
        return (
          <div className="section-content">
            <select 
              value={metadata?.language || 'javascript'} 
              onChange={(e) => onTypeChange(e.target.value)}
              className="code-language-selector"
              disabled={readOnly}
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="csharp">C#</option>
            </select>
            <textarea
              value={content}
              onChange={(e) => onUpdate(e.target.value)}
              className="code-editor"
              readOnly={readOnly}
            />
          </div>
        );
      case 'quote':
        return (
          <div className="section-content">
            <textarea
              value={content}
              onChange={(e) => onUpdate(e.target.value)}
              placeholder="Quote text..."
              className="quote-editor"
              readOnly={readOnly}
            />
            <input
              type="text"
              value={metadata?.author || ''}
              onChange={(e) => onTypeChange(e.target.value)}
              placeholder="Author..."
              className="quote-author"
              readOnly={readOnly}
            />
          </div>
        );
      default:
        return (
          <div className="section-content">
            <RichTextEditor
              content={content}
              onChange={onUpdate}
              placeholder="Start writing..."
              readOnly={readOnly}
            />
          </div>
        );
    }
  };

  return (
    <div className={`section-container ${isActive ? 'active' : ''}`} onClick={onSelect}>
      <div className="section-header">
        <input
          type="text"
          value={metadata?.title || ''}
          onChange={(e) => onTitleChange(e.target.value)}
          className="section-title"
          placeholder="Section title..."
          readOnly={readOnly}
        />
        {!readOnly && (
          <div className="section-actions">
            <button onClick={(e) => { e.stopPropagation(); onEdit?.(); }} className="section-action-btn edit" title="Edit section">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="section-action-btn delete" title="Delete section">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
            </button>
          </div>
        )}
      </div>
      {renderContent()}
    </div>
  );
};

export default Section; 