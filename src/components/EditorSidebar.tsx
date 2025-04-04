import React, { useState, useRef, useCallback, KeyboardEvent } from 'react';
import { BlogSection } from '../types/index';
import './EditorSidebar.css';

interface EditorSidebarProps {
  sections: BlogSection[];
  activeSection: string | null;
  onSectionSelect: (sectionId: string) => void;
  onSectionDelete: (sectionId: string) => void;
  onSectionAdd: (title: string) => void;
  onSectionReorder: (fromIndex: number, toIndex: number) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onHeroImageSelect: () => void;
  hasHeroImage: boolean;
}

export const EditorSidebar: React.FC<EditorSidebarProps> = ({
  sections,
  activeSection,
  onSectionSelect,
  onSectionDelete,
  onSectionAdd,
  onSectionReorder,
  isCollapsed,
  onToggleCollapse,
  onHeroImageSelect,
  hasHeroImage,
}) => {
  const [draggedSection, setDraggedSection] = useState<number | null>(null);
  const [dragOverSection, setDragOverSection] = useState<number | null>(null);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const newSectionInputRef = useRef<HTMLInputElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleDragStart = (index: number) => {
    setDraggedSection(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedSection === null || draggedSection === index) return;
    setDragOverSection(index);
  };

  const handleDragEnd = () => {
    if (draggedSection !== null && dragOverSection !== null && draggedSection !== dragOverSection) {
      onSectionReorder(draggedSection, dragOverSection);
    }
    setDraggedSection(null);
    setDragOverSection(null);
  };

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>, index: number) => {
    const currentSection = sections[index];
    if (!currentSection) return;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        if (index > 0) {
          onSectionSelect(sections[index - 1].id);
          sectionRefs.current[index - 1]?.focus();
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (index < sections.length - 1) {
          onSectionSelect(sections[index + 1].id);
          sectionRefs.current[index + 1]?.focus();
        }
        break;
      case 'Delete':
      case 'Backspace':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          onSectionDelete(currentSection.id);
        }
        break;
      case 'Enter':
        if (!isAddingSection) {
          e.preventDefault();
          setIsAddingSection(true);
          setTimeout(() => newSectionInputRef.current?.focus(), 0);
        }
        break;
    }
  }, [sections, onSectionSelect, onSectionDelete, isAddingSection]);

  const handleAddSection = () => {
    if (newSectionTitle.trim()) {
      onSectionAdd(newSectionTitle.trim());
      setNewSectionTitle('');
      setIsAddingSection(false);
    }
  };

  const handleAddSectionKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddSection();
    } else if (e.key === 'Escape') {
      setIsAddingSection(false);
      setNewSectionTitle('');
    }
  };

  return (
    <div 
      className={`editor-sidebar ${isCollapsed ? 'collapsed' : ''}`}
      role="complementary"
      aria-label="Document sections"
    >
      <button 
        className="sidebar-toggle"
        onClick={onToggleCollapse}
        title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        aria-expanded={!isCollapsed}
      >
        <span className="visually-hidden">
          {isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        </span>
      </button>
      
      <div className="sidebar-content">
        <div className="document-tree" role="tree">
          <h3>Document Sections</h3>
          <button 
            className={`hero-image-btn ${hasHeroImage ? 'has-image' : ''}`}
            onClick={onHeroImageSelect}
            aria-label={hasHeroImage ? 'Edit hero image' : 'Add hero image'}
          >
            {hasHeroImage ? 'Edit Hero Image' : 'Add Hero Image'}
          </button>
          
          {sections.length === 0 ? (
            <div className="empty-sections">
              <p>No sections yet. Add your first section to begin!</p>
              <button 
                className="add-first-section-btn"
                onClick={() => onSectionAdd('Introduction')}
              >
                Add Introduction
              </button>
            </div>
          ) : (
            <>
              <div className="sections-list" role="group" aria-label="Document sections">
                {sections.map((section, index) => (
                  <div
                    ref={el => sectionRefs.current[index] = el}
                    key={section.id}
                    className={`document-section ${activeSection === section.id ? 'active' : ''} ${dragOverSection === index ? 'drag-over' : ''}`}
                    onClick={() => onSectionSelect(section.id)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    tabIndex={0}
                    role="treeitem"
                    aria-selected={activeSection === section.id}
                  >
                    <span className="drag-handle" aria-hidden="true">⋮⋮</span>
                    <span className="section-title">{section.metadata?.title || 'Untitled Section'}</span>
                    <button 
                      className="delete-section-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSectionDelete(section.id);
                      }}
                      aria-label={`Delete section: ${section.metadata?.title || 'Untitled Section'}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="add-section-container">
                {isAddingSection ? (
                  <div className="new-section-form">
                    <input
                      ref={newSectionInputRef}
                      type="text"
                      value={newSectionTitle}
                      onChange={(e) => setNewSectionTitle(e.target.value)}
                      onKeyDown={handleAddSectionKeyDown}
                      placeholder="New section title..."
                      className="new-section-input"
                      aria-label="New section title"
                    />
                    <button
                      className="new-section-btn add"
                      onClick={handleAddSection}
                      disabled={!newSectionTitle.trim()}
                      aria-label="Add section"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button
                    className="add-section-btn"
                    onClick={() => setIsAddingSection(true)}
                    aria-label="Add new section"
                  >
                    <span>+</span> Add Section
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}; 