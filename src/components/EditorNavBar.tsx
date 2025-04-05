import React from 'react';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import styles from '../styles/components/EditorNavBar.module.css';

interface EditorNavBarProps {
  onBack: () => void;
  onSave?: () => void;
  onPreview?: () => void;
  onPublish?: () => void;
}

const EditorNavBar: React.FC<EditorNavBarProps> = ({
  onBack,
  onSave,
  onPreview,
  onPublish,
}) => {
  return (
    <div className={styles.editorNav}>
      <div className={styles.navLeft}>
        <button 
          onClick={onBack} 
          className={`${styles.navBtn} ${styles.navBtnBack}`}
          onMouseEnter={(e) => {
            e.currentTarget.classList.add(styles.hover);
          }}
          onMouseLeave={(e) => {
            e.currentTarget.classList.remove(styles.hover);
          }}
        >
          <FaArrowLeft /> Back
        </button>
      </div>
      <div className={styles.navRight}>
        {onSave && (
          <button 
            onClick={onSave} 
            className={`${styles.navBtn} ${styles.navBtnSave}`}
            onMouseEnter={(e) => {
              e.currentTarget.classList.add(styles.hover);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.classList.remove(styles.hover);
            }}
          >
            <FaSave /> Save Draft
          </button>
        )}
        {onPreview && (
          <button 
            onClick={onPreview} 
            className={`${styles.navBtn} ${styles.navBtnPreview}`}
            onMouseEnter={(e) => {
              e.currentTarget.classList.add(styles.hover);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.classList.remove(styles.hover);
            }}
          >
            Preview
          </button>
        )}
        {onPublish && (
          <button 
            onClick={onPublish} 
            className={`${styles.navBtn} ${styles.navBtnPublish}`}
            onMouseEnter={(e) => {
              e.currentTarget.classList.add(styles.hover);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.classList.remove(styles.hover);
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