import React from 'react';
import { BlogSection } from '../types/interfaces';
import RichTextEditor from './RichTextEditor';
import styles from '../styles/components/Section.module.css';

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
          <div className={styles.sectionContent}>
            <select 
              value={metadata?.language || 'javascript'} 
              onChange={(e) => onTypeChange(e.target.value)}
              className={styles.codeLanguageSelector}
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
              className={styles.codeEditor}
              readOnly={readOnly}
            />
          </div>
        );
      case 'quote':
        return (
          <div className={styles.sectionContent}>
            <textarea
              value={content}
              onChange={(e) => onUpdate(e.target.value)}
              placeholder="Quote text..."
              className={styles.quoteEditor}
              readOnly={readOnly}
            />
            <input
              type="text"
              value={metadata?.author || ''}
              onChange={(e) => onTypeChange(e.target.value)}
              placeholder="Author..."
              className={styles.quoteAuthor}
              readOnly={readOnly}
            />
          </div>
        );
      default:
        return (
          <div className={styles.sectionContent}>
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
    <div 
      className={`${styles.sectionContainer} ${isActive ? styles.sectionContainerActive : ''}`}
      onClick={onSelect}
    >
      <div className={styles.sectionHeader}>
        <input
          type="text"
          value={metadata?.title || ''}
          onChange={(e) => {
            e.stopPropagation();
            onTitleChange(e.target.value);
          }}
          className={styles.sectionTitle}
          placeholder="Section title..."
          readOnly={readOnly}
          onClick={(e) => e.stopPropagation()}
        />
        {!readOnly && (
          <div className={`${styles.sectionActions} ${isActive ? styles.sectionActionsVisible : ''}`}>
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit?.(); }} 
              className={styles.actionButton}
              title="Edit section"
            >
              <svg className={styles.actionIcon} viewBox="0 0 24 24">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(); }} 
              className={`${styles.actionButton} ${styles.deleteButton}`}
              title="Delete section"
            >
              <svg className={styles.actionIcon} viewBox="0 0 24 24">
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