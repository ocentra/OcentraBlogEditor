import React from 'react';
import { BlogSection } from '../types/index';
import RichTextEditor from './RichTextEditor';

const styles = {
  sectionContainer: {
    background: 'var(--editor-bg)',
    border: '1px solid var(--editor-border)',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: 'var(--section-spacing)',
    position: 'relative' as const,
  },
  sectionContainerActive: {
    borderColor: 'var(--editor-accent)',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '12px',
    gap: '12px',
  },
  sectionTitle: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: 'var(--editor-text)',
    fontSize: '16px',
    fontWeight: 500,
    padding: '4px 8px',
    borderRadius: '4px',
    '&:focus': {
      outline: 'none',
      background: 'var(--editor-hover)',
    },
  },
  sectionActions: {
    display: 'flex',
    gap: '8px',
    marginLeft: 'auto',
    opacity: 0,
    transition: 'opacity 0.2s ease',
  },
  sectionActionsVisible: {
    opacity: 1,
  },
  actionButton: {
    background: 'transparent',
    border: 'none',
    color: 'var(--editor-text)',
    padding: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    borderRadius: '4px',
    transition: 'all 0.2s ease',
    '&:hover': {
      background: 'var(--editor-hover)',
      color: 'var(--editor-accent)',
    },
  },
  deleteButton: {
    '&:hover': {
      color: 'var(--danger-color)',
    },
  },
  actionIcon: {
    width: '16px',
    height: '16px',
    fill: 'currentColor',
  },
  sectionContent: {
    marginTop: '12px',
  },
  codeLanguageSelector: {
    width: '200px',
    padding: '8px',
    marginBottom: '12px',
    backgroundColor: 'var(--surface-color)',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    color: 'var(--text-color)',
    fontSize: '14px',
  },
  codeEditor: {
    width: '100%',
    minHeight: '120px',
    padding: '12px',
    fontFamily: "'Fira Code', monospace",
    backgroundColor: 'var(--surface-color)',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    color: 'var(--text-color)',
    fontSize: '14px',
    lineHeight: 1.5,
    resize: 'vertical' as const,
  },
  quoteEditor: {
    width: '100%',
    minHeight: '100px',
    padding: '12px 20px',
    fontStyle: 'italic',
    backgroundColor: 'var(--surface-color)',
    border: '1px solid var(--border-color)',
    borderLeft: '4px solid var(--accent-color)',
    borderRadius: '4px',
    color: 'var(--text-color)',
    fontSize: '16px',
    lineHeight: 1.6,
    resize: 'vertical' as const,
  },
  quoteAuthor: {
    width: '100%',
    padding: '8px 12px',
    marginTop: '12px',
    backgroundColor: 'var(--surface-color)',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    color: 'var(--text-color)',
    fontSize: '14px',
  },
};

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
          <div style={styles.sectionContent}>
            <select 
              value={metadata?.language || 'javascript'} 
              onChange={(e) => onTypeChange(e.target.value)}
              style={styles.codeLanguageSelector}
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
              style={styles.codeEditor}
              readOnly={readOnly}
            />
          </div>
        );
      case 'quote':
        return (
          <div style={styles.sectionContent}>
            <textarea
              value={content}
              onChange={(e) => onUpdate(e.target.value)}
              placeholder="Quote text..."
              style={styles.quoteEditor}
              readOnly={readOnly}
            />
            <input
              type="text"
              value={metadata?.author || ''}
              onChange={(e) => onTypeChange(e.target.value)}
              placeholder="Author..."
              style={styles.quoteAuthor}
              readOnly={readOnly}
            />
          </div>
        );
      default:
        return (
          <div style={styles.sectionContent}>
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
      style={{
        ...styles.sectionContainer,
        ...(isActive ? styles.sectionContainerActive : {})
      }}
      onClick={onSelect}
    >
      <div style={styles.sectionHeader}>
        <input
          type="text"
          value={metadata?.title || ''}
          onChange={(e) => {
            e.stopPropagation();
            onTitleChange(e.target.value);
          }}
          style={styles.sectionTitle}
          placeholder="Section title..."
          readOnly={readOnly}
          onClick={(e) => e.stopPropagation()}
        />
        {!readOnly && (
          <div style={{
            ...styles.sectionActions,
            ...(isActive ? styles.sectionActionsVisible : {})
          }}>
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit?.(); }} 
              style={styles.actionButton}
              title="Edit section"
            >
              <svg style={styles.actionIcon} viewBox="0 0 24 24">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(); }} 
              style={{...styles.actionButton, ...styles.deleteButton}}
              title="Delete section"
            >
              <svg style={styles.actionIcon} viewBox="0 0 24 24">
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