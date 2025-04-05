import React, { useState, useRef, useCallback, KeyboardEvent } from 'react';
import { BlogSection } from '../types/index';
import '../styles/components/EditorSidebar.css';

interface EditorSidebarProps {
  sections: BlogSection[];
  activeSection: string | null;
  onSectionSelect: (sectionId: string) => void;
  onSectionDelete: (sectionId: string) => void;
  onSectionAdd: (title: string) => void;
  onSectionReorder: (fromIndex: number, toIndex: number) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  hasHeroImage: boolean;
  onTitleChange: (sectionId: string, newTitle: string) => void;
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
  hasHeroImage,
  onTitleChange,
}) => {
  const [draggedSection, setDraggedSection] = useState<number | null>(null);
  const [dragOverSection, setDragOverSection] = useState<number | null>(null);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const newSectionInputRef = useRef<HTMLInputElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [hoveredSection, setHoveredSection] = useState<string | number | null>(null);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState('');

  const handleDragStart = (index: number) => {
    setDraggedSection(index);
    sectionRefs.current[index]?.classList.add('dragging');
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const boundingRect = sectionRefs.current[index]?.getBoundingClientRect();
    const offset = e.clientY - (boundingRect?.top || 0);
    const height = boundingRect?.height || 0;
    if (offset > height / 2) {
      setDragOverSection(index + 1);
    } else {
      setDragOverSection(index);
    }
  };

  const handleDragEnd = () => {
    if (draggedSection !== null) {
      sectionRefs.current[draggedSection]?.classList.remove('dragging');
    }
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

  const handleTitleEdit = (sectionId: string, currentTitle: string) => {
    setEditingTitle(sectionId);
    setEditedTitle(currentTitle);
    onSectionSelect(sectionId);
  };

  const handleTitleSave = (sectionId: string) => {
    if (editedTitle.trim()) {
      const section = sections.find((s: BlogSection) => s.id === sectionId);
      if (section) {
        onTitleChange(sectionId, editedTitle.trim());
      }
    }
    setEditingTitle(null);
  };

  const handleTitleKeyDown = (e: KeyboardEvent<HTMLInputElement>, sectionId: string) => {
    if (e.key === 'Enter') {
      handleTitleSave(sectionId);
    } else if (e.key === 'Escape') {
      setEditingTitle(null);
    }
  };

  const handleMouseEnter = (index: number) => {
    setHoveredSection(index);
  };

  const handleMouseLeave = () => {
    setHoveredSection(null);
  };

  // Add a visual indicator for the drop position
  const renderDropIndicator = (index: number) => {
    if (dragOverSection === index) {
      return <div className="dropIndicator" />;
    }
    return null;
  };

  return (
    <div 
      className={`editorSidebar ${isCollapsed ? 'editorSidebarCollapsed' : ''}`}
      role="complementary"
      aria-label="Document sections"
    >
      <button 
        className={`sidebarToggle ${isCollapsed ? 'sidebarToggleCollapsed' : ''}`}
        onClick={onToggleCollapse}
        title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        aria-expanded={!isCollapsed}
      >
        <span className="visuallyHidden">
          {isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        </span>
      </button>
      
      <div className={`sidebarContent ${isCollapsed ? 'sidebarContentCollapsed' : ''}`}>
        <div className="documentTree" role="tree">
          <h3 className="documentTreeTitle">Document Sections</h3>
          
          <div className="sectionsList" role="group" aria-label="Document sections">
            {/* Hero Image Section */}
            <div
              className={`documentSection ${activeSection === 'hero' ? 'documentSectionActive' : ''}`}
              onClick={() => onSectionSelect('hero')}
              onDoubleClick={() => onSectionSelect('hero')}
              onMouseEnter={() => setHoveredSection('hero')}
              onMouseLeave={() => setHoveredSection(null)}
              tabIndex={0}
              role="treeitem"
              aria-selected={activeSection === 'hero'}
            >
              <span className="dragHandle" aria-hidden="true">⋮⋮</span>
              <div className="sectionTitleContainer">
                <span className="sectionTitle">
                  {hasHeroImage ? 'Hero Image' : 'Add Hero Image'}
                </span>
              </div>
            </div>

            {/* Regular Sections */}
            {sections.map((section: BlogSection, index: number) => (
              <React.Fragment key={section.id}>
                {renderDropIndicator(index)}
                <div
                  ref={el => sectionRefs.current[index] = el}
                  className={`documentSection ${activeSection === section.id ? 'documentSectionActive' : ''}`}
                  onClick={() => onSectionSelect(section.id)}
                  onDoubleClick={() => handleTitleEdit(section.id, section.metadata?.title || 'Untitled Section')}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseLeave={handleMouseLeave}
                  draggable={editingTitle !== section.id}
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  tabIndex={0}
                  role="treeitem"
                  aria-selected={activeSection === section.id}
                >
                  <span className="dragHandle" aria-hidden="true">⋮⋮</span>
                  <div className="sectionTitleContainer">
                    {editingTitle === section.id ? (
                      <input
                        type="text"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        onKeyDown={(e) => handleTitleKeyDown(e, section.id)}
                        onBlur={() => handleTitleSave(section.id)}
                        className="sectionTitleInput"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <>
                        <span className="sectionTitle">
                          {section.metadata?.title || 'Untitled Section'}
                        </span>
                        <button 
                          className="editSectionBtn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTitleEdit(section.id, section.metadata?.title || 'Untitled Section');
                          }}
                          title="Edit section title"
                        >
                          <svg style={{ width: '16px', height: '16px', fill: 'currentColor' }} viewBox="0 0 24 24">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                  <button 
                    className="deleteSectionBtn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSectionDelete(section.id);
                    }}
                    aria-label={`Delete section: ${section.metadata?.title || 'Untitled Section'}`}
                  >
                    <svg style={{ width: '16px', height: '16px', fill: 'currentColor' }} viewBox="0 0 24 24">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                  </button>
                </div>
              </React.Fragment>
            ))}
          </div>

          <div className="addSectionContainer">
            {isAddingSection ? (
              <div className="newSectionForm">
                <input
                  ref={newSectionInputRef}
                  type="text"
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  onKeyDown={handleAddSectionKeyDown}
                  placeholder="New section title..."
                  className="newSectionInput"
                  aria-label="New section title"
                />
                <button
                  className={`newSectionBtn ${!newSectionTitle.trim() ? 'newSectionBtnDisabled' : ''}`}
                  onClick={handleAddSection}
                  disabled={!newSectionTitle.trim()}
                  aria-label="Add section"
                >
                  +
                </button>
              </div>
            ) : (
              <button
                className="addSectionBtn"
                onClick={() => setIsAddingSection(true)}
                aria-label="Add new section"
              >
                <span>+</span> Add Section
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 