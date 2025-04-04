import React, { useState } from 'react';
import { BlogSection } from '../types';

interface DocumentSectionsProps {
  sections: BlogSection[];
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
  onAddSection: (title: string) => void;
}

const DocumentSections: React.FC<DocumentSectionsProps> = ({
  sections,
  activeSection,
  onSectionClick,
  onAddSection,
}) => {
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');

  const handleAddSection = () => {
    if (newSectionTitle.trim()) {
      onAddSection(newSectionTitle.trim());
      setNewSectionTitle('');
      setIsAddingSection(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddSection();
    } else if (e.key === 'Escape') {
      setIsAddingSection(false);
      setNewSectionTitle('');
    }
  };

  const documentSectionsStyle = {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '16px',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  };

  const documentSectionsTitleStyle = {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '1.2rem',
    fontWeight: 600,
    margin: '0 0 16px 0',
    paddingBottom: '12px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  };

  const sectionsListStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  };

  const sectionItemStyle = {
    padding: '12px 16px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    color: 'rgba(255, 255, 255, 0.8)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '0.95rem',
  };

  const addSectionButtonStyle = {
    ...sectionItemStyle,
    border: '1px dashed rgba(255, 255, 255, 0.2)',
    color: 'rgba(255, 255, 255, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const addSectionInputWrapperStyle = {
    padding: '8px',
  };

  const addSectionInputStyle = {
    width: '100%',
    padding: '4px 8px',
    background: 'transparent',
    border: 'none',
    color: 'white',
    fontSize: '0.95rem',
  };

  return (
    <div style={documentSectionsStyle}>
      <h2 style={documentSectionsTitleStyle}>Document Sections</h2>
      
      <div style={sectionsListStyle}>
        {sections.map((section) => (
          <div
            key={section.id}
            style={{
              ...sectionItemStyle,
              background: activeSection === section.id ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              color: activeSection === section.id ? 'white' : 'rgba(255, 255, 255, 0.8)',
              fontWeight: activeSection === section.id ? 500 : 'normal',
            }}
            onClick={() => onSectionClick(section.id)}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = activeSection === section.id ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.color = activeSection === section.id ? 'white' : 'rgba(255, 255, 255, 0.8)';
            }}
          >
            {section.metadata?.title || 'Untitled Section'}
          </div>
        ))}

        {isAddingSection ? (
          <div style={addSectionInputWrapperStyle}>
            <input
              type="text"
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleAddSection}
              placeholder="Enter section name..."
              style={addSectionInputStyle}
              autoFocus
            />
          </div>
        ) : (
          <div 
            style={addSectionButtonStyle}
            onClick={() => setIsAddingSection(true)}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
            }}
          >
            + Add New Section
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentSections; 