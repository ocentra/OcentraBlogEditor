import React from 'react';
import { BlogSection } from '../types';
import RichTextEditor from './RichTextEditor';
import { FaTrash, FaPencilAlt } from 'react-icons/fa';

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
            <button onClick={onEdit} className="section-action-btn edit">
              <FaPencilAlt />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="section-action-btn delete">
              <FaTrash />
            </button>
          </div>
        )}
      </div>
      {renderContent()}
    </div>
  );
};

export default Section; 