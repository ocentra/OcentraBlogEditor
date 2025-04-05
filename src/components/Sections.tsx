import React, { useState } from 'react';
import { BlogSection } from '../types/interfaces';
import styles from '../styles/components/Sections.module.css';

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

  return (
    <div className={styles.documentSections}>
      <h2 className={styles.documentSectionsTitle}>Document Sections</h2>
      
      <div className={styles.sectionsList}>
        {sections.map((section) => (
          <div
            key={section.id}
            className={`${styles.sectionItem} ${activeSection === section.id ? styles.sectionItemActive : ''}`}
            onClick={() => onSectionClick(section.id)}
          >
            {section.metadata?.title || 'Untitled Section'}
          </div>
        ))}

        {isAddingSection ? (
          <div className={styles.addSectionInputWrapper}>
            <input
              type="text"
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleAddSection}
              placeholder="Enter section name..."
              className={styles.addSectionInput}
              autoFocus
            />
          </div>
        ) : (
          <div 
            className={styles.addSectionButton}
            onClick={() => setIsAddingSection(true)}
          >
            + Add New Section
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentSections; 