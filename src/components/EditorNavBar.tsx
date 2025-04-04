import React from 'react';
import { FaArrowLeft, FaSave } from 'react-icons/fa';

interface EditorNavBarProps {
  onBack: () => void;
  onSave?: () => void;
  onPreview?: () => void;
  onPublish?: () => void;
}

const styles = {
  editorNav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 20px',
    background: 'var(--surface-color)',
    borderBottom: '1px solid var(--border-color)',
    marginBottom: '20px',
    borderRadius: '8px',
    overflowX: 'auto' as const,
    scrollbarWidth: 'none' as const,
  },
  navLeft: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  navRight: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  navBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    background: 'transparent',
    border: '1px solid var(--border-color)',
    color: 'var(--text-color)',
  },
  navBtnBack: {
    color: 'var(--text-color)',
  },
  navBtnSave: {
    color: 'var(--editor-accent)',
    borderColor: 'var(--editor-accent)',
  },
  navBtnPreview: {
    background: 'transparent',
    color: 'var(--text-color)',
  },
  navBtnPublish: {
    background: 'var(--editor-accent)',
    color: 'white',
    borderColor: 'var(--editor-accent)',
  },
};

const EditorNavBar: React.FC<EditorNavBarProps> = ({
  onBack,
  onSave,
  onPreview,
  onPublish,
}) => {
  return (
    <div 
      style={styles.editorNav}
      className="editor-nav"
    >
      <div style={styles.navLeft}>
        <button 
          onClick={onBack} 
          style={{ ...styles.navBtn, ...styles.navBtnBack }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--surface-hover-color)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <FaArrowLeft /> Back
        </button>
      </div>
      <div style={styles.navRight}>
        {onSave && (
          <button 
            onClick={onSave} 
            style={{ ...styles.navBtn, ...styles.navBtnSave }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(74, 158, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <FaSave /> Save Draft
          </button>
        )}
        {onPreview && (
          <button 
            onClick={onPreview} 
            style={{ ...styles.navBtn, ...styles.navBtnPreview }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--surface-hover-color)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            Preview
          </button>
        )}
        {onPublish && (
          <button 
            onClick={onPublish} 
            style={{ ...styles.navBtn, ...styles.navBtnPublish }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(74, 158, 255, 0.8)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--editor-accent)';
            }}
          >
            Publish
          </button>
        )}
      </div>
    </div>
  );
};

export default EditorNavBar; 