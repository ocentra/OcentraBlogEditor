import React from 'react';
import { FaArrowLeft, FaSave } from 'react-icons/fa';

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
    <div className="editor-nav">
      <div className="nav-left">
        <button onClick={onBack} className="nav-btn back">
          <FaArrowLeft /> Back
        </button>
      </div>
      <div className="nav-right">
        {onSave && (
          <button onClick={onSave} className="nav-btn save">
            <FaSave /> Save Draft
          </button>
        )}
        {onPreview && (
          <button onClick={onPreview} className="nav-btn preview">
            Preview
          </button>
        )}
        {onPublish && (
          <button onClick={onPublish} className="nav-btn publish">
            Publish
          </button>
        )}
      </div>
    </div>
  );
};

export default EditorNavBar; 