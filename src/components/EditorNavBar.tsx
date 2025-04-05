import React from 'react';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import '../styles/components/EditorNavBar.css';

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
    <div className="editorNav">
      <div className="navLeft">
        <button 
          onClick={onBack} 
          className="navBtn navBtnBack"
          onMouseEnter={(e) => {
            e.currentTarget.classList.add('hover');
          }}
          onMouseLeave={(e) => {
            e.currentTarget.classList.remove('hover');
          }}
        >
          <FaArrowLeft /> Back
        </button>
      </div>
      <div className="navRight">
        {onSave && (
          <button 
            onClick={onSave} 
            className="navBtn navBtnSave"
            onMouseEnter={(e) => {
              e.currentTarget.classList.add('hover');
            }}
            onMouseLeave={(e) => {
              e.currentTarget.classList.remove('hover');
            }}
          >
            <FaSave /> Save Draft
          </button>
        )}
        {onPreview && (
          <button 
            onClick={onPreview} 
            className="navBtn navBtnPreview"
            onMouseEnter={(e) => {
              e.currentTarget.classList.add('hover');
            }}
            onMouseLeave={(e) => {
              e.currentTarget.classList.remove('hover');
            }}
          >
            Preview
          </button>
        )}
        {onPublish && (
          <button 
            onClick={onPublish} 
            className="navBtn navBtnPublish"
            onMouseEnter={(e) => {
              e.currentTarget.classList.add('hover');
            }}
            onMouseLeave={(e) => {
              e.currentTarget.classList.remove('hover');
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